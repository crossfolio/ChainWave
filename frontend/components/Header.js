// components/Header.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const [ensName, setEnsName] = useState(account);

  useEffect(() => {
    const resolveENS = async (address) => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          const ens = await provider.lookupAddress(address);
          setEnsName(ens || address);
        } catch (error) {
          console.error('Failed to resolve ENS', error);
        }
      }
    };

    if (account) {
      resolveENS(account);
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        onWalletConnected(account);
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('MetaMask is not installed');
    }
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  const logout = () => {
    onLogout();
    setShowLogout(false);
  };

  return (
    <header className="header">
      {typeof account === 'string' && account ? (
        <button onClick={toggleLogout} className="metamask-btn">
          {ensName ? ensName : `${account.substring(0, 6)}...${account.slice(-4)}`}
        </button>
      ) : (
        <button onClick={connectWallet} className="metamask-btn">
          Connect MetaMask
        </button>
      )}
      {showLogout && (
        <div className="logout-popup">
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
