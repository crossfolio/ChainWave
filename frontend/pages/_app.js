// pages/_app.js
import '../styles/globals.css';
import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LogoutDialog from '../components/LogoutDialog';

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const onWalletConnected = (account) => {
    setAccount(account);
  };

  const onLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setAccount(null);
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div id="app">
      {' '}
      {/* Top Header with MetaMask Login Button */}{' '}
      <header className="header">
        <Header account={account} onWalletConnected={onWalletConnected} onLogout={onLogout} />{' '}
      </header>{' '}
      {/* Main Layout with Sidebar */}{' '}
      {account ? (
        <div className="main-layout">
          <aside className="sidebar">
            <Sidebar account={account} />{' '}
          </aside>{' '}
          <div className="content">
            <Component {...pageProps} account={account} />{' '}
          </div>{' '}
        </div>
      ) : (
        // Main Content (Before Login)
        <div className="main-content">
          <img src="/welcome.png" alt="Welcome Image" className="welcome-image" />
          <p> Please connect your MetaMask wallet to access. </p>{' '}
        </div>
      )}{' '}
      {/* Logout Dialog */}{' '}
      {showLogoutDialog && (
        <LogoutDialog confirmLogout={confirmLogout} cancelLogout={cancelLogout} />
      )}{' '}
    </div>
  );
}

export default MyApp;
