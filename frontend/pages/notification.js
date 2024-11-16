import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function NotificationList({ worldcoinid }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNotification, setEditNotification] = useState(null);

  useEffect(() => {
    const worldcoinid = Cookies.get('worldcoinId');
    if (!worldcoinid) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/notifications?worldcoinid=${worldcoinid}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [worldcoinid]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${worldcoinid}/${id}`);
      setNotifications(
        notifications.filter((notification) => notification.id !== id),
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification.');
    }
  };

  const openEditDialog = (notification) => {
    setEditNotification(notification);
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
      await axios.put(
        `/api/notifications/${worldcoinid}/${editNotification.id}`,
        editNotification,
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === editNotification.id ? editNotification : notif,
        ),
      );
      closeEditDialog();
    } catch (err) {
      console.error('Error updating notification:', err);
      alert('Failed to update notification.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Notification List
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Symbol</th>
                <th className="py-3 px-4 text-left">Condition</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <tr key={notification.id} className="border-b">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">
                      {notification.symbol}
                    </td>
                    <td className="py-3 px-4">
                      {notification.condition === 'greater' ? '>' : '<'}
                    </td>
                    <td className="py-3 px-4">${notification.price}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openEditDialog(notification)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No notifications found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isEditDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Edit Notification
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                value={editNotification.symbol}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-2"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                name="condition"
                value={editNotification.condition}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-2"
              >
                <option value="greater">Greater than</option>
                <option value="less">Less than</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={editNotification.price}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleEditSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
              <button
                onClick={closeEditDialog}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
