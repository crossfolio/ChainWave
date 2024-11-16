import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { formatAddress } from '../utils/util';
import { queryAttestations } from "../utils/sign-protocol";

export default function SettingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('John Doe');
  const [worldcoinId, setWorldcoinId] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [querySchemaId, setQuerySchemaId] = useState("");
  const [queryResult, setQueryResult] = useState(null);

  useEffect(() => {
    const savedWorldcoinId = Cookies.get('worldcoinId');
    if (savedWorldcoinId) {
      setWorldcoinId(savedWorldcoinId);
    }

    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          setAccountAddress(accounts[0]);
        })
        .catch((error) => {
          console.error('Error connecting to MetaMask:', error);
        });
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }

    const defaultProfileImage = `https://noun-api.com/beta/pfp?name=${encodeURIComponent(username)}`;
    setProfileImage(defaultProfileImage);
  }, [username]);

  const handleSave = () => {
    alert('Changes saved!');
    setIsEditing(false);
  };

  const handleQuery = async () => {
    if (querySchemaId && worldcoinId) {
      const result = await queryAttestations(querySchemaId, worldcoinId);
      setQueryResult(result);
    } else {
      alert("Please enter Schema ID and Worldcoin ID");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Account Settings</h2>

      <div className="bg-white p-8 rounded-lg shadow-lg mx-auto w-full max-w-4xl">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Profile Information</h3>

        {/* Profile Image Section */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="flex items-center justify-center text-2xl font-semibold text-gray-500">
                  JD
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-600">Profile Picture</p>
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
            {accountAddress ? formatAddress(accountAddress) : '尚未連接'}
          </p>
        </div>

        <div className="mb-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Query Attestations</h3>

          <label className="block font-medium mb-1">Schema ID</label>
          <input
            type="text"
            value={querySchemaId}
            onChange={(e) => setQuerySchemaId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema ID"
          />

          <label className="block font-medium mb-1">Worldcoin ID</label>
          <input
            type="text"
            value={worldcoinId}
            onChange={(e) => setWorldcoinId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Worldcoin ID"
          />

          <button
            onClick={handleQuery}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Query
          </button>

          {queryResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-gray-700">
              <h4 className="font-medium">Query Result:</h4>
              <p><strong>Signer Address:</strong> {queryResult.signerAddress}</p>
              <p><strong>Decoded Data:</strong> {JSON.stringify(queryResult)}</p>
            </div>
          )}
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
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
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