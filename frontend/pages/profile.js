import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// ERC-1155 ABI to interact with NFT contracts
const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function uri(uint256 id) view returns (string)',
];

export default function ProfilePage() {
  const [account, setAccount] = useState(null);
  const [nft, setNft] = useState(null);
  const [error, setError] = useState(null);

  // Connect to MetaMask and get the user's account
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } catch (err) {
        setError('Failed to connect MetaMask');
      }
    } else {
      setError('MetaMask is not installed');
    }
  };

  const replaceIdInUri = (uri, tokenId) => {
    return uri.replace('{id}', tokenId);
  };

  const fetchERC1155NFT = async (contractAddress, tokenId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);

      const balance = await contract.balanceOf(account, tokenId);
      let uri = await contract.uri(tokenId);

      // 替換 {id} 並將 IPFS URI 轉換為 HTTP URL
      uri = replaceIdInUri(uri, tokenId);
      if (uri.startsWith('ipfs://')) {
        uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      // 嘗試獲取元數據
      const response = await fetch(uri);
      const metadata = await response.json();

      if (metadata.image) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      setNft({ tokenId, balance: balance.toString(), metadata });
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
      setError('Failed to fetch NFT');
    }
  };

  // Trigger fetching NFT for the specific ERC-1155 contract and token ID
  useEffect(() => {
    if (account) {
      const nftContractAddress = '0x8FC845D0A2766D4E12D2263549972994DBEC6F68'; // Your ERC-1155 contract address
      const tokenId = 1; // Your token ID
      fetchERC1155NFT(nftContractAddress, tokenId);
    }
  }, [account]);

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      {!account ? (
        <button onClick={connectMetaMask}>Connect MetaMask</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="nft-section">
        <h3>ERC-1155 NFT</h3>
        {nft ? (
          <div>
            <p>Name: {nft.metadata?.name || 'N/A'}</p>
            <p>Token ID: {nft.tokenId}</p>
            <p>Balance: {nft.balance}</p>
            {nft.metadata?.image && (
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                width={200}
              />
            )}
          </div>
        ) : (
          <p>NFT Not Found...</p>
        )}
      </div>
    </div>
  );

}
