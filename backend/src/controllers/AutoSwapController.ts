import { Controller, Route, Tags, Post, Body } from 'tsoa'
import { ResponseModel, sendOk, sendClientError } from '../utils/routeHelp'
import Web3 from 'web3'
import {
  DestinationUsdcDTO,
  DestinationUsdcAndSwapDTO,
} from '../interfaces/AutoSwapDTO'
import { swapService } from '../services/SwapService'

@Route('autoswap')
@Tags('AutoSwap')
export class AutoSwapController extends Controller {
  @Post('/destinationUSDC')
  public async destinationUSDC(
    @Body() data: DestinationUsdcDTO,
  ): Promise<ResponseModel> {
    try {
      let departureRpcURL

      if (data.departureChain === 'ETH') {
        departureRpcURL = process.env.ETH_RPC_URL
      } else if (data.departureChain === 'ARB') {
        departureRpcURL = process.env.ARB_RPC_URL
      } else {
        return sendClientError('Not support this departure chain')
      }

      const web3 = new Web3(departureRpcURL)
      const txReceiptWithLogs = await web3.eth.getTransactionReceipt(
        data.txHash,
      )
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

      const attestationSignature =
        await swapService.fetchAttestation(messageHash)

      await swapService.destinationUSDC(
        messageBytes,
        attestationSignature,
        data.userWallet,
        data.destinationChain,
      )
    } catch (error: any) {
      console.log(error)
      return sendClientError(error.message)
    }

    return sendOk()
  }

  @Post('/destinationUSDCAndSwap')
  public async destinationUSDCAndSwap(
    @Body() data: DestinationUsdcAndSwapDTO,
  ): Promise<ResponseModel> {
    try {
      let departureRpcURL

      if (data.departureChain === 'ETH') {
        departureRpcURL = process.env.ETH_RPC_URL
      } else if (data.departureChain === 'ARB') {
        departureRpcURL = process.env.ARB_RPC_URL
      } else {
        return sendClientError('Not support this departure chain')
      }

      const web3 = new Web3(departureRpcURL)
      const txReceiptWithLogs = await web3.eth.getTransactionReceipt(
        data.txHash,
      )
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

      const attestationSignature =
        await swapService.fetchAttestation(messageHash)

      await swapService.destinationUSDCAndSwap(
        messageBytes,
        attestationSignature,
        data.token0,
        data.token1,
        data.fee,
        data.tickSpacing,
        data.hookAddr,
        data.zeroForOne,
        data.hookData,
        data.userWallet,
        data.destinationChain,
      )
    } catch (error: any) {
      console.log(error)
      return sendClientError(error.message)
    }

    return sendOk()
  }
}
