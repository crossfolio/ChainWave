// Header.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LogoutDialog from './LogoutDialog';
import {
  resolveENS,
  checkMetaMaskAvailability,
  formatAddress,
} from '../utils/util';

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (account) {
        try {
          const savedWorldcoinId = Cookies.get('worldcoinId');
          if (savedWorldcoinId) {
            const userInfo = await getUserInfo(savedWorldcoinId);
            if (userInfo && userInfo.name) {
              const imageUrl = `https://noun-api.com/beta/pfp?name=${encodeURIComponent(userInfo.name)}`;
              setProfileImage(imageUrl);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      } else {
        setProfileImage(null);
      }
    };

    fetchUserProfile();
  }, [account]);

  const getUserInfo = async (worldcoinId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${worldcoinId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log(data);

      return data;
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

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
              className="w-16 h-16 rounded-full cursor-pointer"
              onClick={openLogoutDialog}
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
      {showLogoutDialog && (
        <LogoutDialog
          confirmLogout={confirmLogout}
          cancelLogout={closeLogoutDialog}
        />
      )}
    </div>
  );
}
