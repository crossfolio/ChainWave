import { FaWallet, FaBell, FaExchangeAlt, FaBars, FaTimes } from 'react-icons/fa';
import classNames from 'classnames';
import { useRouter } from 'next/router';

export default function Sidebar({ account, isCollapsed, toggleSidebar }) {
  const router = useRouter();

  const navLinks = [
    { name: 'Assets', path: '/multi-chain-assets', icon: <FaWallet /> },
    { name: 'Alerts', path: '/notification', icon: <FaBell /> },
    { name: 'X-Swap', path: '/crosschain-swap', icon: <FaExchangeAlt /> },
  ];

  const handleNavigation = (path) => router.push(path);

  return (
    <nav
      className={classNames(
        "fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg flex flex-col justify-between transition-all duration-300",
        {
          'w-64': !isCollapsed, // 展開時寬度
          'w-20': isCollapsed,   // 收合時寬度
        }
      )}
    >
      {/* 收合按鈕 */}
      <button
        onClick={toggleSidebar}
        className={classNames(
          "p-3 text-white hover:bg-gray-800 transition",
          { 'self-end mr-4': !isCollapsed, 'self-center': isCollapsed }
        )}
      >
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </button>

      {/* 導航列表 */}
      <ul className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
          <li
            key={link.path}
            onClick={() => handleNavigation(link.path)}
            className={classNames(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
              {
                'bg-gray-700': router.pathname === link.path,
                'hover:bg-gray-800': router.pathname !== link.path,
              }
            )}
          >
            <span className="text-lg">{link.icon}</span>
            {!isCollapsed && <span className="font-medium">{link.name}</span>}
          </li>
        ))}
      </ul>

      {/* 帳戶資訊 */}
      <div className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
        {!isCollapsed && (
          <>
            <p>Connected as:</p>
            <p className="font-semibold truncate">{account || 'Not connected'}</p>
          </>
        )}
      </div>
    </nav>
  );
}