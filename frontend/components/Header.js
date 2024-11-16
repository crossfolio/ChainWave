import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import LogoutDialog from './LogoutDialog';
import { checkMetaMaskAvailability, formatAddress } from '../utils/util';
import { useNotification } from '../contexts/NotificationContext';
import Cookies from 'js-cookie';

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const { notifications, markAsRead, hasUnreadNotifications } =
    useNotification();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getUserInfo = async (worldcoinId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${worldcoinId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 ease-in-out"
            >
              <span className="material-icons text-gray-600">
                notifications
              </span>
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full mt-2 right-0 w-72 bg-white shadow-lg rounded-xl p-4 z-50">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">
                  通知
                </h3>
                <ul className="space-y-2">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-2 rounded-lg text-blue-900 shadow-sm transition duration-150 cursor-pointer ${
                        notification.isRead
                          ? 'bg-gray-200'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      {notification.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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

      {showLogoutDialog && (
        <LogoutDialog
          confirmLogout={confirmLogout}
          cancelLogout={closeLogoutDialog}
        />
      )}
    </div>
  );
}
