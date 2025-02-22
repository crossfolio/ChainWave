import { useState } from 'react';
import { SignProtocolClient, SpMode, EvmChains } from '@ethsign/sp-sdk';
import Cookies from 'js-cookie';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';

export default function CreateAccountDialog({
  isOpen,
  onClose,
  onCreate,
  account,
}) {
  const [name, setName] = useState('');
  const [schemaId, setSchemaId] = useState('0x14e');

  const [isMessageSigned, setIsMessageSigned] = useState(false);
  const [isAttestationCreated, setIsAttestationCreated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen) return null;

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
  });

  const handleCreateAccount = async () => {
    if (!name) {
      alert('Please enter your name.');
      return;
    }
    if (!isMessageSigned) {
      alert('Please sign the message before proceeding.');
      return;
    }
    if (!isAttestationCreated) {
      alert('Please create an attestation before proceeding.');
      return;
    }
    if (!isSubscribed) {
      alert('Please subscribe channel before proceeding.');
      return;
    }

    const worldcoinId = Cookies.get('worldcoinId');
    const address = Cookies.get('newAccount');
    console.log('Creating account with name:', name);
    console.log('Creating account with worldcoinId:', worldcoinId);
    console.log('Creating account with address:', address);

    onCreate(name, worldcoinId, address);
    onClose();
  };

  const createAttestation = async () => {
    const worldcoinId = Cookies.get('worldcoinId');
    if (!window.ethereum || !account || !schemaId || !worldcoinId) {
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
        params: [message, account],
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
    } catch (error) {
      console.error('Failed to create attestation:', error);
    }
  };

  const subscribeChannel = async () => {
    try {
      const ethMainnetParams = { chainId: '0x1' };
      const sepoliaParams = { chainId: '0xaa36a7' };

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [ethMainnetParams],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userDvp = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.PROD,
      });

      const response = await userDvp.notification.subscribe(
        `eip155:1:${'0xf73Dc2BdeB8855af9dc2B862C78DBB1F679b95c2'}`,
      );

      setIsSubscribed(true);
      console.log('Successfully subscribed to channel:', response);

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [sepoliaParams],
      });
    } catch (error) {
      console.error('Failed to subscribe channel or switch networks:', error);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      } catch (switchBackError) {
        console.error('Failed to switch back to Sepolia:', switchBackError);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Create Account
        </h2>

        {/* Name Input Field */}
        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-black mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Create Attestation Section */}
        <div className="flex items-center justify-center mb-4">
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

        <div className="flex items-center justify-center mb-4">
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

        <div className="flex items-center justify-center mb-4">
          <p
            className={`mr-2 ${isSubscribed ? 'text-green-500' : 'text-gray-500'}`}
          >
            Subscribe Channel
          </p>
          {isSubscribed ? (
            <span className="text-green-500 font-semibold">✔</span>
          ) : (
            <span className="text-gray-500 font-semibold">✗</span>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={createAttestation}
            className="text-white py-2 px-4 rounded focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#007EA7' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
          >
            Create Attestation
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={subscribeChannel}
            className="text-white py-2 px-4 rounded focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#007EA7' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
          >
            Subscribe Channel
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCreateAccount}
            className="text-white py-2 px-4 rounded focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#007EA7' }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#34B4CC')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007EA7')}
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
