import { useState } from 'react';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([
    { symbol: 'ETH', price: '1500', condition: 'greater' },
    { symbol: 'BTC', price: '30000', condition: 'less' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [notification, setNotification] = useState({ symbol: '', price: '', condition: 'greater' });

  const openDialog = (index) => {
    setEditIndex(index);
    setNotification(notifications[index]);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNotification({ symbol: '', price: '', condition: 'greater' });
    setEditIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const updatedNotifications = [...notifications];
    updatedNotifications[editIndex] = notification;
    setNotifications(updatedNotifications);
    closeDialog();
  };

  const handleDelete = (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    setNotifications(updatedNotifications);
  };

  return (
    <div className="notification-container">
      <h2>Notification List</h2>

      <table className="notification-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            {/* <th>Condition</th>
            <th>Price</th> */}
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{notification.symbol}</td>
              {/* <td>{notification.condition}</td>
              <td>{notification.price}</td> */}
              <td>
                <button onClick={() => openDialog(index)}>Edit</button>
              </td>
              <td>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDialogOpen && (
        <div className="notification-dialog-overlay">
          <div className="notification-dialog">
            <h3>Edit Notification</h3>
            <div className="notification-input-group">
              <label>
                Symbol:
                <input
                  type="text"
                  name="symbol"
                  value={notification.symbol}
                  onChange={handleInputChange}
                  disabled
                />
              </label>
            </div>
            <div className="notification-input-group">
              <label>
                Condition:
                <select
                  name="condition"
                  value={notification.condition}
                  onChange={handleInputChange}
                >
                  <option value="greater">Greater than</option>
                  <option value="less">Less than</option>
                </select>
              </label>
            </div>
            <div className="notification-input-group">
              <label>
                Price:
                <input
                  type="number"
                  name="price"
                  value={notification.price}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="notification-dialog-buttons">
              <button onClick={handleSubmit}>Confirm</button>
              <button onClick={closeDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}