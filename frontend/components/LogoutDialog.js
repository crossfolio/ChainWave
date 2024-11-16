// components/LogoutDialog.js
export default function LogoutDialog({ confirmLogout, cancelLogout }) {
  return (
    <div className="logout-dialog-overlay">
      <div className="logout-dialog">
        <p>Are you sure you want to logout?</p>
        <div className="dialog-buttons">
          <button onClick={confirmLogout} className="confirm-btn">
            Confirm
          </button>
          <button onClick={cancelLogout} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
