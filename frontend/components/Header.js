// Header.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LogoutDialog from './LogoutDialog';
import { resolveENS, checkMetaMaskAvailability, formatAddress } from '../utils/util';

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (account) {
      const name = 'John Doe';
      const imageUrl = `https://noun-api.com/beta/pfp?name=${encodeURIComponent(name)}`;
      setProfileImage(imageUrl);
    } else {
      setProfileImage(null);
    }
  }, [account]);

  const connectWallet = async () => {
    if (!checkMetaMaskAvailability()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      onWalletConnected(account);
    } catch (error) {
      console.error('User denied account access or an error occurred');
    }
  };

  const confirmLogout = async () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }

    localStorage.removeItem('account');
    localStorage.removeItem('isAuthenticated');

    if (!checkMetaMaskAvailability()) return;

    closeLogoutDialog();

    window.location.reload();
  };

  const openLogoutDialog = () => setShowLogoutDialog(true);
  const closeLogoutDialog = () => setShowLogoutDialog(false);

  return (
    <div className="fixed top-4 right-4">
      {account ? (
        <div className="flex items-center space-x-2">
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={openDialog}
            />
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded-full font-semibold text-white transition button-notConnected shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Connect MetaMask
        </button>
      )}

      {/* 登出對話框 */}
      {showLogoutDialog && <LogoutDialog confirmLogout={confirmLogout} cancelLogout={closeLogoutDialog} />}
    </div>
  );
}
