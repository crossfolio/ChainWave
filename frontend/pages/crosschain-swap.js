import { useState } from 'react';
import { ethers } from 'ethers';
import {
  contractAddress,
  contractABI,
} from '../constants/crossChainSwapContract';

export default function CrossChainSwapPage() {
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('arbitrum');
  const [fromToken, setFromToken] = useState('LINK');
  const [toToken, setToToken] = useState('UNI');
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [gasFee, setGasFee] = useState(0);
  const [swapStatus, setSwapStatus] = useState('');
  const [showError, setShowError] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const initiateSwap = async () => {
    try {
      if (amount <= 0) {
        alert('Please enter a valid quantity.');
        return;
      }

      if (!window.ethereum) {
        alert('Please install MetaMask to proceed with transactions.');
        return;
      }

      setSwapStatus('Initiating cross-chain swap, please wait…');
      setShowError(false);
      setFadeOut(false);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const crossChainSwapContract = new ethers.Contract(contractAddress, contractABI, signer);
      const tokenAmount = ethers.utils.parseUnits(amount.toString(), 18);

      const tx = await crossChainSwapContract.swapTokensAcrossChains(
        fromChain,
        toChain,
        fromToken,
        toToken,
        tokenAmount,
      );

      setSwapStatus('Transaction initiated, awaiting confirmation…');

      const receipt = await tx.wait();

      const estimatedConvertedAmount = amount * 0.95;
      const estimatedGasFee = 0.005;

      setConvertedAmount(estimatedConvertedAmount);
      setGasFee(estimatedGasFee);

      setSwapStatus(`Swap successful: Transaction hash ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Swap failed.', error);
      setSwapStatus('Swap failed, please try again later.');
      setShowError(true);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowError(false);
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Cross-Chain Swap</h2>

      <div className="bg-white p-8 rounded-lg shadow-md mx-auto w-full max-w-lg">
        <div className="mb-6">
          <label htmlFor="fromChain" className="block text-sm font-medium text-gray-700">
            From Chain
          </label>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            id="fromChain"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="ethereum">Ethereum</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="toChain" className="block text-sm font-medium text-gray-700">
            To Chain
          </label>
          <select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            id="toChain"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="arbitrum">Arbitrum</option>
            <option value="ethereum">Ethereum</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="fromToken" className="block text-sm font-medium text-gray-700">
            From Token
          </label>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            id="fromToken"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="LINK">LINK</option>
            <option value="UNI">UNI</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="toToken" className="block text-sm font-medium text-gray-700">
            To Token
          </label>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            id="toToken"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="LINK">LINK</option>
            <option value="UNI">UNI</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            id="amount"
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter amount to swap"
          />
        </div>

        <div className="flex items-center justify-between">
          {showError && (
            <div
              className={`mr-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md shadow-lg transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
            >
              <p className="text-sm">Swap failed, please try again later.</p>
            </div>
          )}

          <button
            onClick={initiateSwap}
            className="bg-blue-500 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ml-auto"
          >
            Swap
          </button>
        </div>

        {convertedAmount > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md shadow-md">
            <p className="text-gray-700">
              <strong>Converted Amount:</strong> {convertedAmount} {toToken}
            </p>
            <p className="text-gray-700">
              <strong>Estimated Gas Fee:</strong> {gasFee} ETH
            </p>
          </div>
        )}
      </div>

      {swapStatus && (
        <div className="bg-white p-6 rounded-lg shadow-md mx-auto w-full max-w-lg mt-10 text-center">
          <p className="text-lg font-semibold text-gray-700">{swapStatus}</p>
        </div>
      )}
    </div>
  );
}