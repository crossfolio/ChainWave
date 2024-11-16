import { ethers } from 'ethers';
import {
  FaWallet,
  FaBell,
  FaExchangeAlt,
  FaBars,
  FaTimes,
  FaCog,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { formatAddress } from "../utils/util";

export default function Sidebar({ account, isCollapsed, toggleSidebar }) {
  const router = useRouter();

  const navLinks = [
    { name: "Assets", path: "/multi-chain-assets", icon: <FaWallet /> },
    { name: "Alerts", path: "/notification", icon: <FaBell /> },
    { name: "X-Swap", path: "/crosschain-swap", icon: <FaExchangeAlt /> },
    { name: "Setting", path: "/setting", icon: <FaCog /> },
  ];

  const handleNavigation = (path) => router.push(path);

  const [ensName, setEnsName] = useState(account);
  useEffect(() => {
    const resolveENS = async (address) => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          const ens = await provider.lookupAddress(address);
          setEnsName(ens || address);
        } catch (error) {
          console.error('Failed to resolve ENS', error);
        }
      }
    };
    if (account) {
      resolveENS(account);
    }
  }, [account]);

  return (
    <nav
      className={classNames(
        "fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg flex flex-col justify-between transition-all duration-300",
        {
          "w-64": !isCollapsed,
          "w-20": isCollapsed,
        }
      )}
    >
      <button
        onClick={toggleSidebar}
        className={classNames("p-3 text-white hover:bg-gray-800 transition", {
          "self-end mr-4": !isCollapsed,
          "self-center": isCollapsed,
        })}
      >
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </button>

      <ul className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
          <li
            key={link.path}
            onClick={() => handleNavigation(link.path)}
            className={classNames(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              {
                "bg-gray-700": router.pathname === link.path,
                "hover:bg-gray-800": router.pathname !== link.path,
              }
            )}
          >
            <span className="text-lg">{link.icon}</span>
            {!isCollapsed && <span className="font-medium">{link.name}</span>}
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <p>Connected as:</p>
            <p className="font-semibold truncate">

              {account
                ? (ensName || formatAddress(account))
                : 'Not connected'}
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}