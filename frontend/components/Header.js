import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LogoutDialog from "./LogoutDialog";
import { resolveENS, checkMetaMaskAvailability, formatAddress } from "../utils/util";

export default function Header({ account, onWalletConnected, onLogout }) {
  const [showDialog, setShowDialog] = useState(false);
  const [ensName, setEnsName] = useState(null);

  useEffect(() => {
    if (account) {
      resolveENS(account, setEnsName);
    } else {
      setEnsName(null);
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
      console.error("User denied account access or an error occurred");
    }
  };

  const confirmLogout = async () => {
    if (typeof onLogout === "function") {
      onLogout();
    }

    localStorage.removeItem("account");
    localStorage.removeItem("isAuthenticated");

    if (!checkMetaMaskAvailability()) return;

    closeDialog();

    window.location.reload();
  };

  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  return (
    <div className="fixed top-4 right-4">
      <button
        onClick={account ? openDialog : connectWallet}
        className={`px-4 py-2 rounded-full font-semibold text-white transition ${
          account ? "button-connected" : "button-notConnected"
        } shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {account ? ensName || formatAddress(account) : "Connect MetaMask"}
      </button>

      {showDialog && (
        <LogoutDialog confirmLogout={confirmLogout} cancelLogout={closeDialog} />
      )}
    </div>
  );
}