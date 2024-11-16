import { useTheme } from '../contexts/ThemeContext';

export default function LogoutDialog({ confirmLogout, cancelLogout }) {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`p-6 rounded-lg shadow-lg w-full max-w-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      >
        <h3 className="text-xl font-semibold mb-4">
          Are you sure you want to logout?
        </h3>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={confirmLogout}
            className={`px-4 py-2 rounded-md font-medium focus:outline-none transition-colors text-white`}
            style={{
              backgroundColor: '#007EA7',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}

          >
            Confirm
          </button>
          <button
            onClick={cancelLogout}
            className={`px-4 py-2 rounded-md font-medium focus:outline-none transition-colors ${isDarkMode
              ? 'bg-gray-600 text-white hover:bg-gray-500'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
