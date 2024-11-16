// pages/crosschain-swap.js
import { useState } from 'react';
import { ethers } from 'ethers';
import {
  contractAddress,
  contractABI,
} from '../constants/crossChainSwapContract';

export default function CrossChainSwapPage() {
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('arbitrum');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState(0);
  const [swapStatus, setSwapStatus] = useState('');

  const initiateSwap = async () => {
    try {
      if (!fromToken || !toToken || amount <= 0) {
        alert('請輸入有效的代幣和數量');
        return;
      }

      // 檢查是否存在 Web3 provider (MetaMask)
      if (!window.ethereum) {
        alert('請安裝 MetaMask 以進行交易');
        return;
      }

      setSwapStatus('正在發起跨鏈交換，請稍候...');

      // 使用 ethers.js 設置 provider 和 signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // 請求授權
      const signer = provider.getSigner();

      // 初始化跨鏈交換合約
      const crossChainSwapContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );

      // 將數量轉換為合約格式（假設 token 精度為 18 位）
      const tokenAmount = ethers.utils.parseUnits(amount.toString(), 18);

      // 調用合約中的交換方法
      const tx = await crossChainSwapContract.swapTokensAcrossChains(
        fromChain,
        toChain,
        fromToken,
        toToken,
        tokenAmount,
      );

      setSwapStatus('交易發起中，等待確認中...');

      // 等待交易被確認
      const receipt = await tx.wait();

      setSwapStatus(`交換成功: 交易哈希 ${receipt.transactionHash}`);
    } catch (error) {
      console.error('交換失敗', error);
      setSwapStatus('交換失敗，請稍後重試');
    }
  };

  return (
    <div className="cross-chain-swap-page">
      <h2> CrossChain - Swap </h2>
      <div className="swap-section">
        <label htmlFor="fromChain"> From Chain A: </label>
        <select
          value={fromChain}
          onChange={(e) => setFromChain(e.target.value)}
          id="fromChain"
        >
          <option value="ethereum"> Ethereum </option>
          <option value="arbitrum"> Arbitrum </option>
        </select>
        <label htmlFor="toChain"> To Chain B: </label>
        <select
          value={toChain}
          onChange={(e) => setToChain(e.target.value)}
          id="toChain"
        >
          <option value="arbitrum"> Arbitrum </option>
          <option value="ethereum"> Ethereum </option>
        </select>
        <label htmlFor="fromToken"> From Token A: </label>
        <input
          type="text"
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          id="fromToken"
        />
        <label htmlFor="toToken"> To Token B: </label>
        <input
          type="text"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          id="toToken"
        />
        <label htmlFor="amount"> Amount: </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          id="amount"
        />
        <button onClick={initiateSwap}> Swap </button>
      </div>
      {swapStatus && (
        <div className="swap-status">
          <p>{swapStatus}</p>
        </div>
      )}
    </div>
  );
}
