import { useState } from 'react';

const fetchAssetsFromBlockscout = async (chain, account) => {
  const baseUrl =
    chain === 'sepolia'
      ? 'https://eth-sepolia.blockscout.com/api'
      : 'https://arbitrum-sepolia.blockscout.com/api';

  const [tokenResponse, nativeResponse] = await Promise.all([
    fetch(`${baseUrl}?module=account&action=tokenlist&address=${account}`),
    fetch(`${baseUrl}?module=account&action=balance&address=${account}`),
  ]);

  if (!tokenResponse.ok || !nativeResponse.ok) {
    throw new Error(`Failed to fetch data from ${chain} Blockscout`);
  }

  const tokens = (await tokenResponse.json()).result || [];
  const native = (await nativeResponse.json()).result || '0';

  return { tokens, native };
};

const calculateTokenAmount = (balance, decimals) => {
  return parseFloat(balance) / Math.pow(10, decimals);
};

export default function MultiChainAssets() {
  const [account, setAccount] = useState('');
  const [blockscoutData, setBlockscoutData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({ symbol: '', price: '' });
  const [notification, setNotification] = useState({ condition: 'greater', price: '' });

  const handleAccountChange = (e) => setAccount(e.target.value);

  const handleFetchAssets = async () => {
    if (account) {
      setLoading(true);
      setError(null);
      try {
        const [sepoliaData, arbitrumData] = await Promise.all([
          fetchAssetsFromBlockscout('sepolia', account),
          fetchAssetsFromBlockscout('arbitrum', account),
        ]);

        setBlockscoutData({ sepolia: sepoliaData, arbitrum: arbitrumData });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const aggregateTokens = () => {
    const aggregated = {};

    ['sepolia', 'arbitrum'].forEach((chain) => {
      blockscoutData[chain]?.tokens.forEach((token) => {
        if (['NameWrapper', 'MyCollection'].includes(token.name)) return;

        const key = token.symbol;

        if (!aggregated[key]) {
          aggregated[key] = { total: 0, details: [], price: (Math.random() * 100).toFixed(2) };
        }

        const amount = calculateTokenAmount(token.balance, token.decimals);
        aggregated[key].total += amount;
        aggregated[key].details.push({ chain, amount });
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
    setNotification({ condition: 'greater', price: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(`Notification set for ${selectedToken.symbol}:`, notification);
    closeDialog();
  };

  return (
    <div className="multi-chain-assets">
      <h2>Multi-Chain Assets Query</h2>
      <div className="input-group">
        <input
          type="text"
          id="account"
          value={account}
          onChange={handleAccountChange}
          placeholder="Enter account address"
        />
      </div>
      <button onClick={handleFetchAssets} disabled={!account}>
        Fetch Assets
      </button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <table className="token-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Total Amount</th>
            <th>Details</th>
            <th>Add to Notification</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(aggregatedTokens).map(([symbol, { total, details, price }], index) => (
            <tr key={symbol}>
              <td>{index + 1}</td>
              <td>{symbol}</td>
              <td>${price}</td>
              <td>{total.toFixed(2)}</td>
              <td>
                <details>
                  <summary>View Details</summary>
                  <ul>
                    {details.map((detail, i) => (
                      <li key={i}>
                        {detail.chain}: {detail.amount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td>
                <button className="notification-btn" onClick={() => openDialog(symbol, price)}>
                  加入示警清單
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Set Notification for {selectedToken.symbol}</h3>
            <p>Current Price: ${selectedToken.price}</p>
            <div className="input-group">
              <label>
                Condition:
                <select name="condition" value={notification.condition} onChange={handleInputChange}>
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
              </label>
            </div>
            <div className="input-group">
              <label>
                Price:
                <input
                  type="number"
                  name="price"
                  value={notification.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                />
              </label>
            </div>
            <div className="dialog-buttons">
              <button onClick={handleSubmit}>Confirm</button>
              <button onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
