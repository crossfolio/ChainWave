import "../styles/globals.css";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const onWalletConnected = (newAccount) => {
    setAccount(newAccount);
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    router.push("/"); // 登入成功後跳轉到主頁
  };

  const onLogout = () => {
    setAccount(null);
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    router.replace("/login"); // 登出後回到登入頁
  };

  // 判斷是否在登入頁
  const isLoginPage = router.pathname === "/login";

  return (
    <div id="app" className="min-h-screen flex">
      {/* 如果不是登入頁面，才顯示 Sidebar */}
      {!isLoginPage && (
        <Sidebar 
          account={account} 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}

      {/* 右側主內容區域 */}
      <div
        className={`flex flex-col ${
          !isLoginPage && (isSidebarCollapsed ? "ml-20" : "ml-64")
        } flex-1 transition-all duration-300`}
      >
        {/* 如果不是登入頁面，才顯示 Header 和 ThemeToggle */}
        {!isLoginPage && (
          <div className="flex justify-between items-center p-4">
            <Header
              account={account}
              onWalletConnected={onWalletConnected}
              onLogout={onLogout}
            />
            <ThemeToggle />
          </div>
        )}

        {/* 主內容 */}
        <main
          className={`flex-1 p-6 overflow-y-auto ${
            isLoginPage ? "flex items-center justify-center" : ""
          }`}
        >
          {/* 根據登入狀態和頁面條件性渲染 */}
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
  );
}

export default MyApp;