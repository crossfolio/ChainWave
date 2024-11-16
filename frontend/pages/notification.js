import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationList() {
  const [alarms, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAlarm, setEditNotification] = useState(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [swapDetails, setSwapDetails] = useState(null);

  const worldcoinid = Cookies.get('worldcoinId');
  const savedAddress = Cookies.get('newAccount');
  const { isDarkMode } = useTheme();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (worldcoinid) {
      fetchNotifications();
    }
  }, [worldcoinid]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlarms(savedAddress);
      console.log(data)
      setNotifications(data);
    } catch (err) {
      setError('Failed to load alarms.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const newAlarms = alarms.filter((alarm) => alarm._id !== id);
      const response = await fetch(
        `${apiBaseUrl}/api/users/${savedAddress}/alarms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAlarms),
        },
      );

      const data = await response.json();
      console.log('API response:', data);

      setNotifications(alarms.filter((alarm) => alarm._id !== id));
      alert('Delete notification successfully.');
    } catch (error) {
      console.error('Error deleting alarm:', error);
      alert('Failed to delete notification.');
    }
  };

  const openEditDialog = (alarm) => {
    setEditNotification(alarm);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditNotification(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const updatedAlarms = alarms.map((alarm) => {
        if (alarm._id === editAlarm._id) {
          const { _id, ...rest } = alarm;
          return {
            ...rest,
            condition: editAlarm.condition,
            price: parseFloat(editAlarm.price),
          };
        }
        const { _id, ...rest } = alarm;
        return rest;
      });

      console.log(updatedAlarms)

      const response = await fetch(
        `${apiBaseUrl}/api/users/${savedAddress}/alarms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedAlarms),
        },
      );

      const data = await response.json();
      console.log('API response:', data);

      setNotifications((prev) =>
        prev.map((notif) => (notif._id === editAlarm._id ? editAlarm : notif)),
      );
      closeEditDialog();
      alert('Update notification successfully.');
    } catch (error) {
      console.error('Error updating alarm:', error);
      alert('Failed to update notification.');
    }
  };

  const getAlarms = async (wallet_address) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/users/${wallet_address}/alarms`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error during get user info:', error);
    }
  };

  const openSwapDialog = (alarm) => {
    setSwapDetails(alarm);
    setIsSwapDialogOpen(true);
  };

  const closeSwapDialog = () => {
    setIsSwapDialogOpen(false);
    setSwapDetails(null);
  };

  return (
    <div
      className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Notification List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={`w-full max-w-5xl mx-auto shadow-md rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <thead
              className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
            >
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Symbol</th>
                <th className="py-3 px-4 text-left">Condition</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">AutoSwap</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(alarms) && alarms.length > 0 ? (
                alarms.map((alarm, index) => (
                  <tr
                    key={alarm._id}
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-b'}`}
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold">{alarm.symbol}</td>
                    <td className="py-3 px-4">
                      {alarm.condition === 'greater than' ? '>' : '<'}
                    </td>
                    <td className="py-3 px-4">${alarm.price}</td>
                    <td className="py-3 px-4">{alarm.status === 'active' ? 'Active' : 'Notified'}</td>
                    <td className="py-3 px-4 text-center">
                      {alarm.isSwap === true ? (
                        <button
                          onClick={() => openSwapDialog(alarm)}
                          className={`px-3 py-1 rounded text-white mr-2`}
                          style={{ backgroundColor: '#007EA7' }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
                        >
                          View
                        </button>
                      ) : (
                        '❌'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openEditDialog(alarm)}
                        className={`px-3 py-1 rounded text-white mr-2`}
                        style={{ backgroundColor: '#007EA7' }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(alarm._id)}
                        className={'px-3 py-1 rounded text-white bg-red-500'}
                        style={{ transition: 'background-color 0.3s' }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#F87171')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#EF4444')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No alarms found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            <h3 className="text-xl font-bold mb-4">Edit Notification</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={editAlarm.symbol}
                onChange={handleEditChange}
                className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Condition</label>
              <select
                name="condition"
                value={editAlarm.condition}
                onChange={handleEditChange}
                className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
              >
                <option value="greater than">Greater than</option>
                <option value="less than">Less than</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={editAlarm.price}
                onChange={handleEditChange}
                className={`w-full border rounded-lg p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleEditSubmit}
                className="text-white py-2 px-4 rounded"
                style={{ backgroundColor: '#007EA7' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
              >
                Confirm
              </button>
              <button
                onClick={closeEditDialog}
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
      )}

      {isSwapDialogOpen && swapDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            <h3 className="text-xl font-bold mb-4">Swap Details</h3>
            <div className="mb-4">
              <p><strong>Source Chain:</strong> {swapDetails.srcChain}</p>
              <p><strong>Destination Chain:</strong> {swapDetails.dstChain}</p>
              <p><strong>Source Token:</strong> {swapDetails.symbol}</p>
              <p><strong>Destination Token:</strong> {swapDetails.destToken}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeSwapDialog}
                className={`px-4 py-2 rounded-md font-medium focus:outline-none transition-colors ${isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
