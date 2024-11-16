// pages/assets.js
import { useEffect, useState } from 'react';
import Web3 from 'web3';

export default function AssetsPage({ account }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const loadAssets = async () => {
      if (account && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const balanceWei = await web3.eth.getBalance(account);
        setAssets([
          {
            name: 'Ethereum',
            symbol: 'ETH',
            balance: web3.utils.fromWei(balanceWei, 'ether'),
          },
        ]);
      }
    };
    loadAssets();
  }, [account]);

  return (
    <div className="assets-page">
      <h2>Portfolio</h2>
      {assets.length > 0 ? (
        <ul>
          {assets.map((asset) => (
            <li key={asset.symbol}>
              {asset.name}: {asset.balance} {asset.symbol}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
