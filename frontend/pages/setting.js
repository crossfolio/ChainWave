import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { formatAddress } from "../utils/util";

export default function SettingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("John Doe");
  const [worldcoinId, setWorldcoinId] = useState("");
  const [accountAddress, setAccountAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const savedWorldcoinId = Cookies.get("worldcoinId");
    if (savedWorldcoinId) {
      setWorldcoinId(savedWorldcoinId);
    }

    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          setAccountAddress(accounts[0]);
        })
        .catch((error) => {
          console.error("Error connecting to MetaMask:", error);
        });
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  }, []);

  const toggleEditing = () => setIsEditing(!isEditing);

  const handleSave = () => {
    alert("Changes saved!");
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Account Settings</h2>

      <div className="bg-white p-8 rounded-lg shadow-lg mx-auto w-full max-w-4xl">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Profile Information</h3>

        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center text-2xl font-semibold text-gray-500">JD</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <span className="text-xs">Edit</span>
            </label>
          </div>
          <div>
            <p className="text-gray-600">Profile Picture (Click to change)</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
            />
          ) : (
            <p className="text-lg text-gray-800">{username}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Worldcoin ID</label>
          <p className="text-lg text-gray-800">{worldcoinId}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Account Address</label>
          <p className="text-lg text-gray-800 break-words">
            {accountAddress ? formatAddress(accountAddress) : "Not connected"}
          </p>
        </div>

        <div className="flex space-x-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Save Changes
              </button>
              <button
                onClick={toggleEditing}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={toggleEditing}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}