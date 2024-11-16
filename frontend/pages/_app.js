// _app.js
import "../styles/globals.css";
import { useState, useEffect, createContext, useContext } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import CreateAccountDialog from "../components/CreateAccountDialog";
import { useRouter } from "next/router";
import { connectMetaMask } from "../utils/metamask";
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateAccountDialog, setShowCreateAccountDialog] = useState(false); // 控制建立帳號對話框
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          connectMetaMask(
            setAccount,
            setIsAuthenticated,
            showCreateAccountDialogHandler
          );
        } else {
          onLogout();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectMetaMask);
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

  const showCreateAccountDialogHandler = () => {
    setShowCreateAccountDialog(true);
  };

  const handleAccountCreation = async (username) => {
    const response = await fetch("/api/createAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
      }),
    });

    const data = await response.json();
    console.log("Account creation response:", data);
    setShowCreateAccountDialog(false);
    setIsAuthenticated(true);
    localStorage.setItem("account", account);
    localStorage.setItem("isAuthenticated", "true");
    console.log("Created account successfully");
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
    onWalletConnected: () =>
      connectMetaMask(
        setAccount,
        setIsAuthenticated,
        showCreateAccountDialogHandler
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
            !isLoginPage && (isSidebarCollapsed ? "ml-20" : "ml-64")
          } flex-1 transition-all duration-300`}
        >
          {!isLoginPage && (
            <div className="flex justify-between items-center">
              <Header
                account={account}
                onWalletConnected={() =>
                  connectMetaMask(
                    setAccount,
                    setIsAuthenticated,
                    showCreateAccountDialogHandler
                  )
                }
                onLogout={onLogout}
              />
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
