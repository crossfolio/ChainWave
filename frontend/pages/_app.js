import "../styles/globals.css";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // 控制 Sidebar 展開/收合
  const router = useRouter();

  const onWalletConnected = (newAccount) => setAccount(newAccount);
  const onLogout = () => {
    setAccount(null);
    router.replace("/");
  };

  return (
    <div id="app" className="min-h-screen flex">
      {/* 左側 Sidebar */}
      <Sidebar 
        account={account} 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      {/* 右側主內容區域 */}
      <div className={`flex flex-col ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex-1 transition-all duration-300`}>
        {/* Header 和 ThemeToggle */}
        <div className="flex justify-between items-center p-4">
          <Header
            account={account}
            onWalletConnected={onWalletConnected}
            onLogout={onLogout}
          />
          <ThemeToggle />
        </div>

        {/* 主內容 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {account ? (
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