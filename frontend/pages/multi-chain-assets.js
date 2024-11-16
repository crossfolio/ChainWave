import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotification } from '../contexts/NotificationContext';
import {
  fetchAssetsFromBlockscout,
  calculateTokenAmount,
  getPrices,
} from '../utils/getTokenList';
import { chains } from '../utils/chainsConfig';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';
import {
  contractAddress,
  UNIAddress,
  UNIContractABI,
  USDCAddress,
  USDCContractABI,
} from '../constants/crossChainSwapContract';
import { ethers } from 'ethers';

export default function MultiChainAssets() {
  const [account, setAccount] = useState('');
  const [blockscoutData, setBlockscoutData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({ symbol: '', price: '' });
  const [notification, setNotification] = useState({
    condition: 'greater',
    price: '',
    autoSwap: false,
    autoSwapChain: 'ETH',
    autoSwapToken: '',
    autoSwapSourceChains: ['ETH'],
  });
  const [viewMode, setViewMode] = useState('aggregated');

  const { addNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          setAccount(accounts[0]);
        })
        .catch((error) => {
          console.error('Error connecting to MetaMask:', error);
        });
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  }, []);

  useEffect(() => {
    if (account) {
      handleFetchAssets();
    }
  }, [account, router.pathname]);

  const handleSubmit = async () => {
    const savedAddress = Cookies.get('newAccount');
    const alarms = await getAlarms(savedAddress);
    const simplifiedAlarms = []
    if (alarms.status === 200) {
      alarms.map(({ symbol, condition, price,
        status, isSwap, srcChain,
        dstChain, srcToken, destToken }) => ({
          symbol,
          condition,
          price,
          status,
          isSwap,
          srcChain,
          dstChain,
          srcToken,
          destToken
        }));
    }
    simplifiedAlarms.push({
      symbol: selectedToken.symbol,
      condition: notification.condition === 'greater' ? 'greater than' : 'less than',
      price: parseFloat(notification.price),
      status: "active",
      isSwap: notification.autoSwap,
      srcChain: notification.autoSwapSourceChains[0],
      dstChain: notification.autoSwapChain,
      srcToken: selectedToken.symbol,
      destToken: notification.autoSwapToken
    });

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${savedAddress}/alarms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simplifiedAlarms),
      });

      const data = await response.json();
      console.log('API response:', data);

      const notificationMessage = `Notification set for ${selectedToken.symbol} when price ${notification.condition === 'greater' ? '>' : '<'} $${notification.price}`;
      addNotification(notificationMessage);

      console.log(notificationMessage);
      alert('Alarm set successfully.');
    } catch (error) {
      console.error('Error during API call:', error);
      alert('Fail to set alarm.');
    }

    if (notification.autoSwap && window.ethereum) {
      try {
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

        let tokenAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
        if (selectedToken.symbol === 'UNI') {
          await UNIContract.approve(contractAddress, tokenAmount);
        } else if (selectedToken.symbol === 'USDC') {
          await USDCContract.approve(contractAddress, tokenAmount);
        } else {
          console.log('No approval needed for this token');
        }
        alert('approve successfully.');
      } catch (error) {
        console.error('request failed:', error);
        alert('request failed. Auto-swap will not be activated.');
      }
    }

    closeDialog();
  };

  const handleFetchAssets = async () => {
    if (account) {
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await Promise.all(
          chains.map((chain) => fetchAssetsFromBlockscout(chain.name, account)),
        );

        const blockscoutData = chains.reduce((acc, chain, index) => {
          acc[chain.name] = fetchedData[index];
          return acc;
        }, {});

        let tokensToFetch = [];
        chains.forEach((chain) => {
          blockscoutData[chain.name].tokens.forEach((token) => {
            if (!['NameWrapper', 'MyCollection'].includes(token.name)) {
              tokensToFetch.push({ symbol: token.symbol });
            }
          });
        });

        const tokensWithPrices = await getPrices(tokensToFetch);
        const updatedData = { ...blockscoutData };
        chains.forEach((chain) => {
          updatedData[chain.name].tokens.forEach((token) => {
            const tokenWithPrice = tokensWithPrices.find(
              (t) => t.symbol === token.symbol,
            );
            if (tokenWithPrice) {
              token.price = tokenWithPrice.price;
            }
          });
        });

        setBlockscoutData(updatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const aggregateTokens = () => {
    const aggregated = {};
    chains.forEach((chain) => {
      blockscoutData[chain.name]?.tokens.forEach((token) => {
        if (['NameWrapper', 'MyCollection'].includes(token.name)) return;
        const key = token.symbol;
        if (!aggregated[key]) {
          aggregated[key] = { total: 0, details: [], price: token.price || 0 };
        }
        const amount = calculateTokenAmount(token.balance, token.decimals);
        aggregated[key].total += amount;
        aggregated[key].details.push({ chain: chain.displayName, amount });
      });
    });

    if (aggregated['UNI']) {
      localStorage.setItem('totalAmount_UNI', aggregated['UNI'].total);
    }
    if (aggregated['USDC']) {
      localStorage.setItem('totalAmount_USDC', aggregated['USDC'].total);
    }

    return aggregated;
  };

  const aggregatedTokens = aggregateTokens();

  const openDialog = (symbol, price) => {
    setSelectedToken({ symbol, price });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNotification({
      condition: 'greater',
      price: '',
      autoSwap: false,
      autoSwapChain: 'ETH',
      autoSwapToken: '',
      autoSwapSourceChains: ['ETH'],
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotification((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSourceChainsChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    setNotification((prev) => ({
      ...prev,
      autoSwapSourceChains: options.map((option) => option.value),
    }));
  };

  const getAlarms = async (wallet_address) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/users/${wallet_address}/alarms`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during get user info:', error);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
    >
      <h2 className="text-3xl font-bold mb-4">Multi-Chain Assets Query</h2>
      <p className="mb-6">
        Track and manage your assets across multiple chains with ease.
      </p>

      <div className="mt-4">
        <button
          onClick={() =>
            setViewMode(viewMode === 'aggregated' ? 'separate' : 'aggregated')
          }
          className="font-semibold px-4 py-2 rounded-lg transition-all text-white"
          style={{
            backgroundColor: isDarkMode ? '#34B4CC' : '#007EA7',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? '#2CA3B7' : '#34B4CC')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = isDarkMode ? '#34B4CC' : '#007EA7')}
        >
          {viewMode === 'aggregated' ? 'Show Separate' : 'Show Aggregated'}
        </button>
      </div>

      {loading && (
        <p className="text-lg mt-4" style={{ color: '#007EA7' }}>Loading assets...</p>
      )}
      {error && <p className="text-red-500 text-lg mt-4">Error: {error}</p>}

      {!loading &&
        !error &&
        (viewMode === 'aggregated' ? (
          <table
            className={`w-full max-w-4xl mt-8 shadow-lg rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
          >
            <thead
              className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
            >
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Symbol</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Total Amount</th>
                <th className="px-4 py-2 text-center">Details</th>
                <th className="px-4 py-2 text-center">Add to Notification</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(aggregatedTokens).map(
                ([symbol, { total, details, price }], index) => (
                  <tr key={symbol} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-semibold">{symbol}</td>
                    <td className="px-4 py-2">${price.toFixed(2)}</td>
                    <td className="px-4 py-2">{total}</td>
                    <td className="px-4 py-2">
                      <details>
                        <summary className="cursor-pointer" style={{ color: '#007EA7' }}>
                          View Details
                        </summary>
                        <ul className="pl-4">
                          {details.map((detail, i) => (
                            <li key={i} className="text-sm">
                              {detail.chain}: {detail.amount}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td className="text-center flex justify-center px-4 py-2">
                      <button
                        onClick={() => openDialog(symbol, price)}
                        className="px-3 py-1 rounded-full transition-all text-white"
                        style={{
                          backgroundColor: isDarkMode ? '#34B4CC' : '#007EA7',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? '#2CA3B7' : '#34B4CC')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = isDarkMode ? '#34B4CC' : '#007EA7')}
                      >
                        Add Notification
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        ) : (
          chains.map((chain) => (
            <div
              key={chain.name}
              className={`w-full max-w-4xl mt-8 shadow-lg rounded-lg overflow-hidden mb-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
            >
              <h3
                className={`text-white px-4 py-2 text-lg font-semibold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-800 '}`}
              >
                {chain.displayName}
              </h3>
              <table className="w-full">
                <thead
                  className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
                >
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-center">Add to Notification</th>
                  </tr>
                </thead>
                <tbody>
                  {blockscoutData[chain.name]?.tokens.map((token, index) => (
                    <tr
                      key={`${chain.name}-${token.symbol}`}
                      className="border-b"
                    >
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2 font-semibold">
                        {token.symbol}
                      </td>
                      <td className="px-4 py-2">
                        ${(token.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {calculateTokenAmount(token.balance, token.decimals)}
                      </td>
                      <td className="text-center flex justify-center px-4 py-2">
                        <button
                          onClick={() =>
                            openDialog(token.symbol, token.price || 0)
                          }
                          className="px-3 py-1 rounded-full transition-all text-white"
                          style={{
                            backgroundColor: isDarkMode ? '#34B4CC' : '#007EA7',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? '#2CA3B7' : '#34B4CC')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = isDarkMode ? '#34B4CC' : '#007EA7')}
                        >
                          Add Notification
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ))}

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            <h3 className="text-xl font-bold mb-4">
              Set Notification for {selectedToken.symbol}
            </h3>
            <p className="mb-4">Current Price: ${selectedToken.price.toFixed(2)}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Condition:</label>
                <select
                  name="condition"
                  value={notification.condition}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                >
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Price:</label>
                <input
                  type="number"
                  name="price"
                  value={notification.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="autoSwap"
                    checked={notification.autoSwap}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span className="text-sm">Auto Swap</span>
                </label>
              </div>
              {notification.autoSwap && (
                <>
                  <div>
                    <label className="block text-sm font-medium">
                      Target Chain:
                    </label>
                    <select
                      name="autoSwapChain"
                      value={notification.autoSwapChain}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      {chains.map((chain) => (
                        <option key={chain.name} value={chain.name}>
                          {chain.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Target Token:
                    </label>
                    <input
                      type="text"
                      name="autoSwapToken"
                      value={notification.autoSwapToken}
                      onChange={handleInputChange}
                      placeholder="Enter target token symbol"
                      className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    />
                  </div>
                  {viewMode === 'aggregated' && (
                    <div>
                      <label className="block text-sm font-medium">
                        Source Chains:
                      </label>
                      <select
                        name="autoSwapSourceChains"
                        value={notification.autoSwapSourceChains}
                        onChange={handleSourceChainsChange}
                        className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                        multiple
                      >
                        {chains
                          .filter((chain) =>
                            blockscoutData[chain.name]?.tokens?.some(
                              (token) => token.symbol === selectedToken.symbol,
                            )
                          )
                          .map((chain) => (
                            <option key={chain.name} value={chain.name}>
                              {chain.displayName}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg font-medium transition-all text-white"
                  style={{
                    backgroundColor: isDarkMode ? '#34B4CC' : '#007EA7'
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = isDarkMode ? '#2CA3B7' : '#34B4CC')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = isDarkMode ? '#34B4CC' : '#007EA7')}
                >
                  Confirm
                </button>
                <button
                  onClick={closeDialog}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
