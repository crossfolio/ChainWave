// pages/uniswap-swap.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AlphaRouter, Trade, CurrencyAmount, TradeType } from '@uniswap/sdk';
import Header from '../components/Header';
import { Token } from '@uniswap/sdk-core';

export default function UniswapSwap({ account }) {
  const [amountIn, setAmountIn] = useState('');
  const [transactionHash, setTransactionHash] = useState(null);

  useEffect(() => {
    if (!account) {
      connectWallet();
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('MetaMask is not installed');
    }
  };

  const initiateSwap = async () => {
    if (!window.ethereum || !account) {
      alert('MetaMask is not installed or not connected');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

    const tokenIn = new Token(1, ethers.ZeroAddress, 18, 'ETH', 'Ethereum');
    const tokenOut = new Token(
      1,
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      6,
      'USDT',
      'Tether USD',
    );
    const amountInParsed = ethers.parseUnits(amountIn);

    const route = await new AlphaRouter().route(
      CurrencyAmount.fromRawAmount(tokenIn, amountInParsed.toString()),
      tokenOut,
      TradeType.EXACT_INPUT,
      {
        recipient: account,
        slippageTolerance: 0.5,
      },
    );

    const swapTransaction = {
      data: route.methodParameters.calldata,
      to: route.router,
      value: route.methodParameters.value,
      from: account,
      gasLimit: ethers.utils.hexlify(1000000),
    };

    try {
      const tx = await signer.sendTransaction(swapTransaction);
      setTransactionHash(tx.hash);
    } catch (error) {
      console.error('Swap failed', error);
    }
  };

  return (
    <div className="uniswap-swap-page">
      <Header account={account} />
      <h2>Uniswap V3 Swap</h2>
      <div className="swap-section">
        <label>Amount In (ETH):</label>
        <input
          type="text"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
        />
        <button onClick={initiateSwap}>Swap to USDT</button>
      </div>
      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
}
