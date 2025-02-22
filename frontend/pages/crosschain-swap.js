import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  contractAddress,
  contractABI,
  UNIAddress,
  UNIContractABI,
  USDCAddress,
  USDCContractABI,
  arbitrumContractAddress
} from '../constants/crossChainSwapContract';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';

export default function CrossChainSwapPage() {
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('ethereum');
  const [fromToken, setFromToken] = useState('UNI');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState(0);
  const [swapStatus, setSwapStatus] = useState('');
  const [showError, setShowError] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const { isDarkMode } = useTheme();
  const [totalAmounts, setTotalAmounts] = useState({ UNI: 0, USDC: 0 });
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (fromToken === 'UNI') {
      setToToken('USDC');
    } else {
      setToToken('UNI');
    }

    const uniAmount = localStorage.getItem('totalAmount_UNI');
    const usdcAmount = localStorage.getItem('totalAmount_USDC');
    setTotalAmounts({
      UNI: uniAmount ? parseFloat(uniAmount) : 0,
      USDC: usdcAmount ? parseFloat(usdcAmount) : 0,
    });
  }, [fromToken]);

  const initiateSwap = async () => {
    if (fromChain === toChain) {
      await onlySwap();
    } else {
      await crossChainSwap();
    }
  };
  const onlySwap = async () => {
    try {
      if (amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!window.ethereum) {
        alert('Please install MetaMask to proceed with the transaction');
        return;
      }

      setSwapStatus('Initiating cross-chain swap, please wait...');
      setShowError(false);
      setFadeOut(false);

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const UNIContract = new ethers.Contract(
        UNIAddress,
        UNIContractABI,
        signer,
      );

      const USDCContract = new ethers.Contract(
        USDCAddress,
        USDCContractABI,
        signer,
      );

      const tokenAmount = ethers.parseUnits(
        amount.toString(),
        fromToken === 'UNI' ? 18 : 6,
      );
      setSwapStatus('Approving token...');

      const approveTx =
        fromToken === 'UNI'
          ? await UNIContract.approve(contractAddress, tokenAmount)
          : await USDCContract.approve(contractAddress, tokenAmount);
      await approveTx.wait();

      setSwapStatus('Token approved. Initiating swap...');

      const sepoliaContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const token0 = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
      const token1 = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
      const fee = 3000;
      const tickSpacing = 60;
      const hookAddr = '0x0000000000000000000000000000000000000000';
      const amountSpecified = -tokenAmount;
      const zeroForOne = fromToken === 'UNI' ? false : true;
      const hookData = '0x';

      const tx = await sepoliaContract.singleChainSwap(
        token0,
        token1,
        fee,
        tickSpacing,
        hookAddr,
        amountSpecified,
        zeroForOne,
        hookData,
      );

      setSwapStatus('Transaction initiated, awaiting confirmation...');
      await tx.wait();
      setTotalAmounts((prevAmounts) => ({
        ...prevAmounts,
        [fromToken]: prevAmounts[fromToken] - amount,
      }));

      setSwapStatus(`Swap Succeeded!`);
    } catch (error) {
      console.error('Swap failed', error);
      setSwapStatus('Swap failed, please try again later');
      setShowError(true);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowError(false);
        }, 1000);
      }, 2000);
    }
  };
  const crossChainSwap = async () => {
    try {
      if (amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!window.ethereum) {
        alert('Please install MetaMask to proceed with the transaction');
        return;
      }

      setSwapStatus('Initiating cross-chain swap, please wait...');
      setShowError(false);
      setFadeOut(false);

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const UNIContract = new ethers.Contract(
        UNIAddress,
        UNIContractABI,
        signer,
      );

      const tokenAmount = ethers.parseUnits(amount.toString(), 18);

      setSwapStatus('Approving token...');

      const approveTx =
        fromToken === 'UNI'
          ? await UNIContract.approve(contractAddress, tokenAmount)
          : await USDCContract.approve(contractAddress, tokenAmount);
      await approveTx.wait();

      setSwapStatus('Token approved. Initiating swap...');

      const sepoliaContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      const amountSpecified = -1 * parseFloat(tokenAmount);
      const zeroForOne = fromToken === 'UNI' ? false : true;
      const tx1 = await sepoliaContract.multiChainSwap(
        USDCAddress,
        UNIAddress,
        3000,
        60,
        '0x0000000000000000000000000000000000000000',
        amountSpecified,
        zeroForOne,
        '0x',
        3,
        arbitrumContractAddress,
      );

      const txHash1 = tx1.hash;
      console.log('Transaction Hash for Step 1:', txHash1);

      setSwapStatus(
        'Cross-chain swap in progress. Awaiting confirmation... (1)',
      );

      const receipt1 = await tx1.wait();
      if (receipt1.status === 1) {
        setSwapStatus(
          'Cross-chain swap in progress. Awaiting confirmation... (2)',
        );

        let doDestinationUSDCRes = await doDestinationUSDC(txHash1);
        if (doDestinationUSDCRes) {
          setTotalAmounts((prevAmounts) => ({
            ...prevAmounts,
            [fromToken]: prevAmounts[fromToken] - amount,
          }));
          setSwapStatus(
            'Cross Chain Swap Succeeded',
          );
        } else {
          setSwapStatus('Swap failed, please try again later');
        }
      }
    } catch (error) {
      console.error('Swap failed', error);
      setSwapStatus('Swap failed, please try again later');
      setShowError(true);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowError(false);
        }, 1000);
      }, 2000);
    }
  };

  const doDestinationUSDC = async (txHash) => {
    const savedAddress = Cookies.get('newAccount');
    try {
      const response = await fetch(`${apiBaseUrl}/api/autoswap/destinationUSDC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash,
          departureChain: "ETH",
          destinationChain: "ARB",
          userWallet: savedAddress,
          additionalProp1: {}
        }),
      });

      const data = await response.json();
      console.log('API response:', data);

      return true
    } catch (error) {
      console.error('Error during API call:', error);
      return false
    }
  };


  return (
    <div
      className={`w-full min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
    >
      <h2 className="text-4xl font-bold mb-6 text-center">Cross-Chain Swap</h2>

      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-lg shadow-md mx-auto w-full max-w-lg`}
      >
        <div className="mb-6">
          <label
            htmlFor="fromChain"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            From Chain
          </label>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            id="fromChain"
            className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="ethereum">Ethereum</option>
            {/* <option value="arbitrum">Arbitrum</option> */}
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="toChain"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            To Chain
          </label>
          <select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            id="toChain"
            className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="ethereum">Ethereum</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="fromToken"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            From Token
          </label>
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            id="fromToken"
            className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="UNI">UNI</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="toToken"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            To Token
          </label>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            id="toToken"
            className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
          >
            <option value="UNI">UNI</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <label
              htmlFor="amount"
              className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Amount
            </label>
            <span
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {totalAmounts[fromToken] || 0} {fromToken}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            id="amount"
            className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
            placeholder="Enter amount to swap"
          />
        </div>

        <div className="flex items-center justify-between">
          {showError && (
            <div
              className={`mr-4 ${isDarkMode ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'} border ${isDarkMode ? 'border-red-600' : 'border-red-400'} px-3 py-2 rounded-md shadow-lg transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            >
              <p className="text-sm">Swap failed, please try again later</p>
            </div>
          )}

          <button
            onClick={initiateSwap}
            className={`py-3 px-6 rounded-md font-medium ml-auto text-white focus:outline-none focus:ring-2 focus:ring-blue-400`}
            style={{ backgroundColor: '#007EA7' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
          >
            Swap
          </button>
        </div>
      </div>

      {swapStatus && (
        <div
          className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg shadow-md mx-auto w-full max-w-lg mt-10 text-center`}
        >
          <p className="text-lg font-semibold">{swapStatus}</p>
        </div>
      )}
    </div>
  );
}
