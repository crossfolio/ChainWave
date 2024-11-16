import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LogoutDialog from './LogoutDialog';

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showDialog, setShowDialog] = useState(false);
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

  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };

  const confirmLogout = () => {
    if (typeof onLogout === 'function') { // 確認 onLogout 是否為函數
      onLogout();
    }
    setShowDialog(false);
  };

  const cancelLogout = () => {
    setShowDialog(false);
  };

  return (
    <div className="fixed top-4 right-4">
      <button
        onClick={account ? toggleDialog : connectWallet}
        className={`px-4 py-2 rounded-full font-semibold text-white transition ${
          account ? 'button-connected' : 'button-notConnected'
        } shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {account
          ? (ensName || `${account.substring(0, 6)}...${account.slice(-4)}`)
          : 'Connect MetaMask'}
      </button>

      {/* 登出對話框 */}
      {showDialog && (
        <LogoutDialog
          confirmLogout={confirmLogout}
          cancelLogout={cancelLogout}
        />
      )}
    </div>
  );
}