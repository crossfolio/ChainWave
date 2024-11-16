// _app.js
import '../styles/globals.css';
import { useState, useEffect, createContext, useContext } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import CreateAccountDialog from '../components/CreateAccountDialog';
import { useRouter } from 'next/router';
import { connectMetaMask } from '../utils/metamask';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false); // 控制建立帳號對話框
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connectMetaMask(
            setAccount,
            setIsAuthenticated,
            showCreateAccountDialogHandler,
          );
        } else {
          onLogout();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connectMetaMask);
      }
    };
  }, []);

  const checkAuthentication = () => {
    const savedAccount = localStorage.getItem('account');
    const savedAuth = localStorage.getItem('isAuthenticated');

    if (savedAccount && savedAuth === 'true') {
      setAccount(savedAccount);
      setIsAuthenticated(true);
    }
  };

  const showCreateAccountDialogHandler = () => {
    setShowCreateAccountDialog(true);
  };

  const handleAccountCreation = async (username, worldcoinId, address) => {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress: address,
        name: username,
        worldId: worldcoinId,
        alarms: [],
        createdAt: '2024-11-08T07:55:02.417Z',
        updatedAt: '2024-11-08T07:55:02.417Z'
      })
    });

    const data = await response.json();
    console.log('Account creation response:', data);
    setShowCreateAccountDialog(false);
    setIsAuthenticated(true);
    localStorage.setItem('account', account);
    localStorage.setItem('isAuthenticated', 'true');
    console.log('Created account successfully');
  };

  const onLogout = () => {
    setAccount(null);
    setIsAuthenticated(false);
    localStorage.removeItem('account');
    localStorage.removeItem('isAuthenticated');
    router.replace('/login');
  };

  const isLoginPage = router.pathname === '/login';

  const authContextValue = {
    account,
    isAuthenticated,
    onWalletConnected: () =>
      connectMetaMask(
        setAccount,
        setIsAuthenticated,
        showCreateAccountDialogHandler,
      ),
    onLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div id="app" className="min-h-screen flex">
        {!isLoginPage && (
          <Sidebar
            account={account}
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        <div
          className={`flex flex-col ${
            !isLoginPage && (isSidebarCollapsed ? 'ml-20' : 'ml-64')
          } flex-1 transition-all duration-300`}
        >
          {!isLoginPage && (
            <div className="flex justify-between items-center z-10 relative">
              <Header
                account={account}
                onWalletConnected={() =>
                  connectMetaMask(
                    setAccount,
                    setIsAuthenticated,
                    showCreateAccountDialogHandler,
                  )
                }
                onLogout={onLogout}
              />
              <ThemeToggle />
            </div>
          )}

          <main>
            {isLoginPage || isAuthenticated ? (
              <Component {...pageProps} account={account} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
                {/* Main Title and Subtitle */}
                <h1 className="text-5xl font-bold mb-4">
                  Welcome to ChainWave!
                </h1>
                <p className="text-lg mb-8 max-w-xl text-center">
                  ChainWave is a powerful tool that helps you monitor assets
                  across multiple chains, offering token price tracking and
                  automated secure cross-chain functionality to fully protect
                  your assets.
                </p>

                {/* Button Section */}
                <div className="flex space-x-4">
                  <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-100 transition-all duration-300">
                    Get Started
                  </button>
                  <button className="bg-blue-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <CreateAccountDialog
        isOpen={showCreateAccountDialog}
        onClose={() => setShowCreateAccountDialog(false)}
        onCreate={handleAccountCreation}
        account={account}
      />
    </AuthContext.Provider>
  );
}

export default MyApp;
