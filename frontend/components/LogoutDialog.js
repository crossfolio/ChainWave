export default function LogoutDialog({ confirmLogout, cancelLogout }) {
  return (
    <div className="logout-dialog-overlay z-10">
      <div className="logout-dialog">
        <p>Are you sure you want to logout?</p>
        <div className="dialog-buttons">
          <button
            onClick={() => {
              console.log('Confirm clicked');
              confirmLogout();
            }}
            className="confirm-btn"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              console.log('Cancel clicked');
              cancelLogout();
            }}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
