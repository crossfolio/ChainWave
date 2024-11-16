import "../styles/globals.css";
import { useState, useEffect, createContext, useContext } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useRouter } from "next/router";
import { queryAttestations } from "../utils/signProtocol";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsAuthenticated(true);
          localStorage.setItem("account", accounts[0]);
          localStorage.setItem("isAuthenticated", "true");
        } else {
          onLogout();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", onWalletConnected);
      }
    };
  }, []);

  const checkAuthentication = () => {
    const savedAccount = localStorage.getItem("account");
    const savedAuth = localStorage.getItem("isAuthenticated");

    if (savedAccount && savedAuth === "true") {
      setAccount(savedAccount);
      setIsAuthenticated(true);
    }
  };

  const onWalletConnected = (newAccount) => {
    setAccount(newAccount);
    setIsAuthenticated(true);
    localStorage.setItem("account", newAccount);
    localStorage.setItem("isAuthenticated", "true");
  };

  const onLogout = () => {
    setAccount(null);
    setIsAuthenticated(false);
    localStorage.removeItem("account");
    localStorage.removeItem("isAuthenticated");
    router.replace("/login");
  };

  const isLoginPage = router.pathname === "/login";

  const authContextValue = {
    account,
    isAuthenticated,
    onWalletConnected,
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
            !isLoginPage && (isSidebarCollapsed ? "ml-20" : "ml-64")
          } flex-1 transition-all duration-300`}
        >
          {/* 在登入頁面隱藏 Header 和 ThemeToggle */}
          {!isLoginPage && (
            <div className="flex justify-between items-center p-4">
              <Header account={account} onWalletConnected={onWalletConnected} onLogout={onLogout} />
              <ThemeToggle />
            </div>
          )}

          <main
            className={`flex-1 p-6 overflow-y-auto ${
              isLoginPage ? "flex items-center justify-center" : ""
            }`}
          >
            {isLoginPage || isAuthenticated ? (
              <Component {...pageProps} account={account} />
            ) : (
              <div className="flex flex-1 items-center justify-center text-center">
                <div>
                  <h1 className="text-3xl font-bold">Welcome!</h1>
                  <p className="text-lg mt-2">
                    Connect your MetaMask wallet to start your adventure.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default MyApp;