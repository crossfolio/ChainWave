import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import {
  fetchAssetsFromBlockscout,
  calculateTokenAmount,
  getPrices,
} from '../utils/getTokenList';
import { chains } from '../utils/chainsConfig';

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
    autoSwapChain: '',
    autoSwapToken: '',
    autoSwapSourceChains: [],
  });
  const [viewMode, setViewMode] = useState('aggregated');

  const router = useRouter();

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
      autoSwapChain: '',
      autoSwapToken: '',
      autoSwapSourceChains: [],
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

  const handleSubmit = async () => {
    console.log(`Notification set for ${selectedToken.symbol}:`, notification);

    if (notification.autoSwap && window.ethereum) {
      try {
        const message = `Approve auto-swap from source chains: ${notification.autoSwapSourceChains.join(', ')} to target chain: ${notification.autoSwapChain} for ${selectedToken.symbol} to ${notification.autoSwapToken} when the price reaches $${notification.price}.`;
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        });
        console.log('Signature:', signature);
      } catch (error) {
        console.error('Signature request failed:', error);
        alert('Signature request failed. Auto-swap will not be activated.');
      }
    }

    closeDialog();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Multi-Chain Assets Query
      </h2>
      <p className="text-gray-500 mb-6">
        Track and manage your assets across multiple chains with ease.
      </p>

      <div className="mt-4">
        <button
          onClick={() =>
            setViewMode(viewMode === 'aggregated' ? 'separate' : 'aggregated')
          }
          className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
        >
          {viewMode === 'aggregated' ? 'Show Separate' : 'Show Aggregated'}
        </button>
      </div>

      {loading && (
        <p className="text-blue-500 text-lg mt-4">Loading assets...</p>
      )}
      {error && <p className="text-red-500 text-lg mt-4">Error: {error}</p>}

      {!loading &&
        !error &&
        (viewMode === 'aggregated' ? (
          <table className="w-full max-w-4xl mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Add to Notification</th>
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
                        <summary className="text-blue-500 cursor-pointer">
                          View Details
                        </summary>
                        <ul className="pl-4">
                          {details.map((detail, i) => (
                            <li key={i} className="text-sm text-gray-600">
                              {detail.chain}: {detail.amount}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td className="text-center flex justify-center px-4 py-2">
                      <button
                        onClick={() => openDialog(symbol, price)}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-all"
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
              className="w-full max-w-4xl mt-8 bg-white shadow-lg rounded-lg overflow-hidden mb-6"
            >
              <h3 className="bg-blue-500 text-white px-4 py-2 text-lg font-semibold">
                {chain.displayName}
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200 text-blue-700">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Symbol</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Add to Notification</th>
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
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-all"
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              Set Notification for {selectedToken.symbol}
            </h3>
            <p className="text-gray-500 mb-4">
              Current Price: ${selectedToken.price}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Condition:
                </label>
                <select
                  name="condition"
                  value={notification.condition}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price:
                </label>
                <input
                  type="number"
                  name="price"
                  value={notification.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="w-full border rounded-lg p-2"
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
                  <span className="text-sm text-gray-700">Auto Swap</span>
                </label>
              </div>
              {notification.autoSwap && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Chain:
                    </label>
                    <select
                      name="autoSwapChain"
                      value={notification.autoSwapChain}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2"
                    >
                      {chains.map((chain) => (
                        <option key={chain.name} value={chain.name}>
                          {chain.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target Token:
                    </label>
                    <input
                      type="text"
                      name="autoSwapToken"
                      value={notification.autoSwapToken}
                      onChange={handleInputChange}
                      placeholder="Enter target token symbol"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  {viewMode === 'aggregated' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Source Chains:
                      </label>
                      <select
                        name="autoSwapSourceChains"
                        value={notification.autoSwapSourceChains}
                        onChange={handleSourceChainsChange}
                        className="w-full border rounded-lg p-2"
                        multiple
                      >
                        {chains
                          .filter(
                            (chain) =>
                              chain.name !== notification.autoSwapChain &&
                              blockscoutData[chain.name]?.tokens?.some(
                                (token) => token.symbol === selectedToken.symbol
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
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Confirm
                </button>
                <button
                  onClick={closeDialog}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
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