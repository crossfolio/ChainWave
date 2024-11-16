// pages/crosschain-swap.js
import { useState } from 'react';

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

      setSwapStatus('正在發起跨鏈交換，請稍候...');

      // 發送交換請求到後端 API
      const response = await fetch('/api/crossChainSwap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromChain,
          toChain,
          fromToken,
          toToken,
          amount
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSwapStatus(`交換成功: 交易哈希 ${result.txHash}`);
      } else {
        setSwapStatus(`交換失敗: ${result.error}`);
      }
    } catch (error) {
      console.error('交換失敗', error);
      setSwapStatus('交換失敗，請稍後重試');
    }
  };

  return (
    <div className="cross-chain-swap-page">
      <h2> CrossChain - Swap </h2>{' '}
      <div className="swap-section">
        <label htmlFor="fromChain"> From Chain A: </label>{' '}
        <select value={fromChain} onChange={(e) => setFromChain(e.target.value)} id="fromChain">
          <option value="ethereum"> Ethereum </option> <option value="arbitrum"> Arbitrum </option>{' '}
        </select>{' '}
        <label htmlFor="toChain"> To Chain B: </label>{' '}
        <select value={toChain} onChange={(e) => setToChain(e.target.value)} id="toChain">
          <option value="arbitrum"> Arbitrum </option> <option value="ethereum"> Ethereum </option>{' '}
        </select>{' '}
        <label htmlFor="fromToken"> From Token A: </label>{' '}
        <input
          type="text"
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          id="fromToken"
        />
        <label htmlFor="toToken"> To Token B: </label>{' '}
        <input
          type="text"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          id="toToken"
        />
        <label htmlFor="amount"> Amount: </label>{' '}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          id="amount"
        />
        <button onClick={initiateSwap}> Swap </button>{' '}
      </div>{' '}
      {swapStatus && (
        <div className="swap-status">
          <p> {swapStatus} </p>{' '}
        </div>
      )}{' '}
    </div>
  );
}
