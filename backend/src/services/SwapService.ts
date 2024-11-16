import { ethers } from 'ethers'
import { contract_ABI, contract_address } from '../config/blockchain'
import { Web3 } from 'web3'

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || '0x0'

export class SwapService {
  // get attestation
  public async fetchAttestation(messageHash: string) {
    let attestationResponse = { status: 'pending', attestation: '0x' }

    while (attestationResponse.status != 'complete') {
      console.log('fetching attestation......')
      const response = await fetch(
        `https://iris-api-sandbox.circle.com/attestations/${messageHash}`,
      )
      attestationResponse = await response.json()
      await new Promise((r) => setTimeout(r, 4000))
    }

    const attestationSignature = attestationResponse.attestation
    console.log(`Signature: ${attestationSignature}`)

    return attestationSignature
  }

  // cross chain USDC
  public async destinationUSDC(
    messageBytes: string,
    attestationSignature: string,
    user: string,
    destinationChain: string,
  ) {
    const {
      rpcURL: destinationRpcURL,
      contractAddress: autoSwapContractAddress,
    } = this.getBlockChainConfig(destinationChain)

    const provider = new ethers.JsonRpcProvider(destinationRpcURL)
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider)

    const autoSwap = new ethers.Contract(
      autoSwapContractAddress,
      contract_ABI.AutoSwap,
      deployerWallet,
    )

    const tx = await autoSwap.destinationUSDC(
      messageBytes,
      attestationSignature,
      user,
    )

    const txReceipt = await tx.wait()

    if (txReceipt.status === 0) {
      console.log('Failed to call destinationUSDC()')
    } else if (txReceipt.status === 1) {
      console.log('Success to call destinationUSDC()')
    }

    return txReceipt
  }

  // cross chain USDC and swap
  public async destinationUSDCAndSwap(
    messageBytes: string,
    attestationSignature: string,
    token0: string,
    token1: string,
    fee: number,
    tickSpacing: number,
    hookAddr: string,
    zeroForOne: boolean,
    hookData: string,
    user: string,
    destinationChain: string,
  ) {
    const {
      rpcURL: destinationRpcURL,
      contractAddress: autoSwapContractAddress,
    } = this.getBlockChainConfig(destinationChain)

    const provider = new ethers.JsonRpcProvider(destinationRpcURL)
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider)

    const autoSwap = new ethers.Contract(
      autoSwapContractAddress,
      contract_ABI.AutoSwap,
      deployerWallet,
    )

    const tx = await autoSwap.destinationUSDCAndSwap(
      messageBytes,
      attestationSignature,
      token0,
      token1,
      fee,
      tickSpacing,
      hookAddr,
      zeroForOne,
      hookData,
      user,
    )

    const txReceipt = await tx.wait()

    if (txReceipt.status === 0) {
      console.log('Failed to call destinationUSDCAndSwap()')
    } else if (txReceipt.status === 1) {
      console.log('Success to call destinationUSDCAndSwap()')
    }

    return txReceipt
  }

  // multi chain swap
  public async multiChainSwap(
    token0: string,
    token1: string,
    fee: number,
    tickSpacing: number,
    hookAddr: string,
    amountSpecified: bigint,
    zeroForOne: boolean,
    hookData: string,
    destinationDomain: number,
    destinationRecipient: string,
    departureMessenger: string,
  ) {
    const provider = new ethers.JsonRpcProvider(
      this.getBlockChainConfig('ETH').rpcURL,
    )
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider)

    const autoSwap = new ethers.Contract(
      this.getBlockChainConfig('ETH').contractAddress,
      contract_ABI.AutoSwap,
      deployerWallet,
    )

    const tx = await autoSwap.multiChainSwap(
      token0,
      token1,
      fee,
      tickSpacing,
      hookAddr,
      amountSpecified,
      zeroForOne,
      hookData,
      destinationDomain,
      destinationRecipient,
      departureMessenger,
    )

    const txReceipt = await tx.wait()

    if (txReceipt.status === 0) {
      console.log('Failed to call multiChainSwap()')
    } else if (txReceipt.status === 1) {
      console.log('Success to call multiChainSwap()')
    }

    return txReceipt
  }

  // auto swap
  public async autoSwap(
    walletAddress: string,
    srcChain: string,
    dstChain: string,
    srcToken: string,
    destToken: string,
  ) {
    console.log(srcChain, dstChain, srcToken, destToken)
    const {
      rpcURL: departureRpcURL,
      contractAddress: srcAutoSwapContractAddress,
      tokenAddress: srcTokenAddress,
    } = this.getBlockChainConfig(srcChain, srcToken)
    const {
      rpcURL: destinationRpcURL,
      contractAddress: destAutoSwapContractAddress,
      tokenAddress: destTokenAddress,
    } = this.getBlockChainConfig(dstChain, destToken)

    const provider = new ethers.JsonRpcProvider(departureRpcURL)
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider)
    const autoSwap = new ethers.Contract(
      srcAutoSwapContractAddress,
      contract_ABI.AutoSwap,
      deployerWallet,
    )

    // use in product mode
    // const ethProvider = new ethers.JsonRpcProvider(departureRpcURL)
    // const token0 = new ethers.Contract(
    //   this.getBlockChainConfig('ETH', 'USDC').tokenAddress,
    //   contract_ABI.ERC20,
    //   ethProvider,
    // )
    // const token0Balance = await token0.balanceOf(walletAddress)

    // STEP 1: Approve messenger contract to withdraw from our active eth address
    // STEP 2: Burn USDC

    if (srcChain !== dstChain) {
      const tx = await autoSwap.autoMultiChainSwap(
        this.getBlockChainConfig('ETH', 'USDC').tokenAddress,
        this.getBlockChainConfig('ETH', 'UNI').tokenAddress,
        3000,
        60,
        ethers.ZeroAddress,
        -ethers.parseEther('0.00001'),
        false,
        '0x',
        3,
        destAutoSwapContractAddress,
        walletAddress
      )

      await tx.wait()

      // STEP 3: Retrieve message bytes from logs
      const web3 = new Web3(departureRpcURL)
      const txReceiptWithLogs = await web3.eth.getTransactionReceipt(tx.hash)
      const eventTopic = web3.utils.keccak256('MessageSent(bytes)')
      const log = txReceiptWithLogs.logs.find((l) => {
        if (l.topics) {
          return l.topics[0] === eventTopic
        }
      })
      const messageBytes = web3.eth.abi.decodeParameters(
        ['bytes'],
        log!.data!,
      )[0] as string
      const messageHash = web3.utils.keccak256(messageBytes)

      // STEP 4: Fetch attestation signature
      const attestationSignature = await this.fetchAttestation(messageHash)

      // STEP 5: Using the message bytes and signature receive the funds on destination chain and address
      // TODO: input to define only receive USDC or received USDC than swap
      if (destToken === 'USDC') {
        await this.destinationUSDC(
          messageBytes,
          attestationSignature,
          walletAddress,
          dstChain,
        )
      } else {
        await this.destinationUSDCAndSwap(
          messageBytes,
          attestationSignature,
          this.getBlockChainConfig('ETH', 'USDC').tokenAddress as string,
          this.getBlockChainConfig('ETH', 'UNI').tokenAddress as string, // TODO: define destChain pool's token
          3000,
          60,
          ethers.ZeroAddress,
          true,
          '0x',
          walletAddress,
          dstChain,
        )
      }
    } else {
      const tx = await autoSwap.autoSingleChainSwap(
        this.getBlockChainConfig('ETH', 'USDC').tokenAddress,
        this.getBlockChainConfig('ETH', 'UNI').tokenAddress,
        3000,
        60,
        ethers.ZeroAddress,
        -ethers.parseEther('0.00001'),
        false,
        '0x',
        walletAddress
      )
      const txReceipt = await tx.wait()

      if (txReceipt.status === 0) {
        console.log('Failed to call autoSingleChainSwap()')
      } else if (txReceipt.status === 1) {
        console.log('Success to call autoSingleChainSwap()')
      }
    }
  }

  private getBlockChainConfig(chain: string, token?: string) {
    let rpcURL
    let contractAddress
    let tokenAddress
    if (chain === 'ETH') {
      rpcURL = process.env.ETH_RPC_URL
      contractAddress = contract_address.ETH.AutoSwap
      if (token === 'USDC') {
        tokenAddress = contract_address.ETH.Token.USDC
      } else if (token === 'UNI') {
        tokenAddress = contract_address.ETH.Token.UNI
      }
    } else if (chain === 'ARB') {
      rpcURL = process.env.ARB_RPC_URL
      contractAddress = contract_address.ARB.AutoSwap
      if (token === 'USDC') {
        tokenAddress = contract_address.ARB.Token.USDC
      } else if (token === 'UNI') {
        tokenAddress = contract_address.ARB.Token.UNI
      }
    } else {
      throw Error('Not support this chain')
    }
    return { rpcURL, contractAddress, tokenAddress }
  }
}

export const swapService = new SwapService()
