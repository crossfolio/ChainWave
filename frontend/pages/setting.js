import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { formatAddress } from '../utils/util';
import { queryAttestationsId } from '../utils/signProtocol';
import { SignProtocolClient, SpMode, EvmChains } from '@ethsign/sp-sdk';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [worldcoinId, setWorldcoinId] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [revokeConfirmation, setRevokeConfirmation] = useState('');
  const [isMessageSigned, setIsMessageSigned] = useState(false);
  const [isAttestationCreated, setIsAttestationCreated] = useState(false);
  const [schemaId, setSchemaId] = useState('0x14e');
  let [username, setUsername] = useState('');
  const { isDarkMode } = useTheme();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUserInfo = async () => {
      const savedAddress = Cookies.get('newAccount');
      const savedWorldcoinId = Cookies.get('worldcoinId');
      if (savedWorldcoinId) {
        setWorldcoinId(savedWorldcoinId);
      }

      const userInfo = await getUserInfo(savedAddress);
      if (userInfo && userInfo.name) {
        setUsername(userInfo.name);
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
        alert('Please install MetaMask to connect your wallet.');
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const updatedProfileImage = `https://noun-api.com/beta/pfp?name=${encodeURIComponent(username)}`;
    setProfileImage(updatedProfileImage);
  }, [username]);

  const handleSave = async () => {
    const savedAddress = Cookies.get('newAccount');
    if (worldcoinId) {
      await updateUserInfo(savedAddress);
    }
    setIsEditing(false);
  };

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
  });

  const createAttestation = async () => {
    const worldcoinId = Cookies.get('worldcoinId');
    if (!window.ethereum || !accountAddress || !schemaId || !worldcoinId) {
      alert(
        'Please ensure all fields are filled in, and MetaMask is connected',
      );
      return;
    }

    try {
      const message = JSON.stringify({
        worldcoinId: worldcoinId,
      });

      const signedMessage = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accountAddress],
      });

      setIsMessageSigned(true);

      const attestationData = {
        worldcoinSign: signedMessage,
      };

      const attestationRes = await client.createAttestation({
        schemaId: schemaId,
        data: attestationData,
      });

      setIsAttestationCreated(true);

      console.log('Attestation Created:', attestationRes);
      alert('Attestation Created', attestationRes);
    } catch (error) {
      console.error('Failed to create attestation:', error);
      alert('Failed to create attestation');
    }
  };

  const revokeAttestation = async () => {
    if (!revokeConfirmation || revokeConfirmation !== worldcoinId) {
      alert('Please enter worldcoin ID to confirm revoke');
      return;
    }

    try {
      const querySchemaId = 'onchain_evm_421614_0x14e';
      const attestationId = await queryAttestationsId(
        querySchemaId,
        worldcoinId,
      );
      console.log('Revoke Attestation ID:', attestationId);
      const response = await client.revokeAttestation(attestationId, {
        reason: 'User requested revocation',
      });
      console.log('Attestation Revoked:', response);
      alert('Attestation has been successfully revoked.');
    } catch (error) {
      console.error('Failed to revoke attestation:', error);
      alert('Failed to revoke attestation. Check the console for details.');
    }
  };

  const getUserInfo = async (wallet_address) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/users/${wallet_address}`,
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

  const updateUserInfo = async (wallet_address) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/users/${wallet_address}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: username,
          }),
        },
      );

      const data = await response.json();
      if (data.code === 200) {
        alert('Changes saved!');
        window.location.reload();
        console.log('Update user successfully');
      } else {
        alert('Error during update user info!');
      }
    } catch (error) {
      console.error('Error during update user info:', error);
      alert('Error during update user info!');
    }
  };

  return (
    <div
      className={`w-full min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
    >
      <h2 className="text-3xl font-bold mb-10 text-center">Account Settings</h2>

      <div
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg mx-auto w-full max-w-4xl mb-10`}
      >
        {/* Profile Image Section */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className={`flex items-center justify-center text-2xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  JD
                </span>
              )}
            </div>
          </div>
          <div>
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
          >
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-blue-500`}
              placeholder="Enter your username"
            />
          ) : (
            <p
              className={`text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
            >
              {username}
            </p>
          )}
        </div>

        {/* Worldcoin ID */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
          >
            Worldcoin ID
          </label>
          <p
            className={`text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
          >
            {worldcoinId}
          </p>
        </div>

        {/* Account Address */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
          >
            Account Address
          </label>
          <p
            className={`text-lg break-words ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
          >
            {accountAddress ? formatAddress(accountAddress) : 'Not connected'}
          </p>
        </div>

        {/* Edit and Save Buttons */}
        <div className="flex space-x-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-white py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ backgroundColor: '#007EA7' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
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
              className="text-white py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ backgroundColor: '#007EA7' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Create Attestation Section */}
      <div
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg mx-auto w-full max-w-4xl mb-10`}
      >
        <h3 className="text-2xl font-semibold mb-6">Create Attestation</h3>
        <div className="flex items-center mb-4">
          <p
            className={`mr-2 ${isMessageSigned ? 'text-green-500' : 'text-gray-500'}`}
          >
            Sign message
          </p>
          {isMessageSigned ? (
            <span className="text-green-500 font-semibold">✔</span>
          ) : (
            <span className="text-gray-500 font-semibold">✗</span>
          )}
        </div>

        <div className="flex items-center mb-4">
          <p
            className={`mr-2 ${isAttestationCreated ? 'text-green-500' : 'text-gray-500'}`}
          >
            Create Attestation
          </p>
          {isAttestationCreated ? (
            <span className="text-green-500 font-semibold">✔</span>
          ) : (
            <span className="text-gray-500 font-semibold">✗</span>
          )}
        </div>

        <button
          onClick={createAttestation}
          className="text-white py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ backgroundColor: '#007EA7' }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
        >
          Create Attestation
        </button>
      </div>

      {/* Revoke Attestation Section */}
      <div
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg mx-auto w-full max-w-4xl`}
      >
        <h3 className="text-2xl font-semibold mb-6">Revoke Attestation</h3>
        <label
          className={`block text-sm font-small mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}
        >
          Please enter the worldcoin ID to revoke
        </label>
        <input
          type="text"
          value={revokeConfirmation}
          onChange={(e) => setRevokeConfirmation(e.target.value)}
          className={`w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-blue-500 mb-4`}
          placeholder="Enter worldcoin ID"
        />
        <button
          onClick={() => revokeAttestation(revokeConfirmation, worldcoinId)}
          className="bg-red-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Revoke Attestation
        </button>
      </div>
    </div>
  );
}
