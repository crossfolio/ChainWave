import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from '../components/Header';
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  IndexService,
  decodeOnChainData,
} from '@ethsign/sp-sdk';

export default function SignProtocol({ account }) {
  const [deviceId, setDeviceId] = useState('');
  const [deviceSignature, setDeviceSignature] = useState('');
  const [verifyDeviceRes, setVerifyDeviceRes] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [schemaName, setSchemaName] = useState('');
  const [schemaData, setSchemaData] = useState(
    '[{"name":"worldcoinSign","type":"string","required":true}]',
  );
  const [query, setQuery] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [querySchemaId, setQuerySchemaId] = useState(
    'onchain_evm_421614_0x14e',
  );
  const [attestationId, setAttestationId] = useState('');

  const [worldcoinId, setWorldcoinId] = useState('');

  useEffect(() => {
    if (!account) connectWallet();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      alert('MetaMask is not installed');
    }
  };

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
  });

  const createSchema = async () => {
    if (!window.ethereum || !account) {
      alert('MetaMask is not installed or not connected');
      return;
    }
    try {
      const createSchemaRes = await client.createSchema({
        name: schemaName,
        data: JSON.parse(schemaData),
        signatureRules: {
          method: 'eth_sign',
          fieldsToSign: ['worldcoinId'],
        },
      });
      console.log('Schema created successfully:', createSchemaRes);
      setSchemaId(createSchemaRes.schemaId);
    } catch (error) {
      console.error('Failed to create schema:', error);
    }
  };

  const getSchema = async () => {
    if (!window.ethereum || !account || !schemaId) {
      alert('Please ensure MetaMask is connected and enter a schema id');
      return;
    }
    try {
      const res = await client.getSchema(schemaId);
      console.log(res);
      setQuery(res);
    } catch (error) {
      console.error(error);
    }
  };

  const createAttestation = async () => {
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

      const attestationData = {
        worldcoinSign: signedMessage,
      };

      const attestationRes = await client.createAttestation({
        schemaId: schemaId,
        data: attestationData,
      });
      console.log('Attestation Created:', attestationRes);
    } catch (error) {
      console.error('Failed to create attestation:', error);
    }
  };

  const revokeAttestation = async () => {
    if (!attestationId) {
      alert('Please enter a valid attestation ID to revoke');
      return;
    }

    try {
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

  const queryAttestations = async () => {
    if (!querySchemaId) {
      alert('Please enter a schema id to query attestations');
      return;
    }

    try {
      const indexService = new IndexService('testnet');
      console.log('Querying attestations with schemaId:', querySchemaId);

      const response = await indexService.queryAttestationList({
        schemaId: querySchemaId,
        page: 1,
        mode: 'onchain',
      });
      console.log('Query response:', response);

      const att = response.rows[0].data;

      const res = decodeOnChainData(
        att,
        // DataLocationOnChain.ONCHAIN,
        JSON.parse(schemaData),
      );

      console.log('Decoded data:', res);

      if (response) {
        console.log('Attestations found:', res);
        setQueryResults(res);
      } else {
        console.error(
          'Error querying attestations:',
          response ? response.message : 'Unknown error',
        );
      }
    } catch (error) {
      console.error('Failed to query attestations:', error.message || error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header account={account} />
      <h2 className="text-2xl font-semibold my-6">Sign Protocol</h2>

      <div className="space-y-6">
        {/* Create Schema Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Create Schema</h3>
          <label className="block font-medium mb-1">Schema Name</label>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema Name"
          />
          <label className="block font-medium mb-1">Schema Data</label>
          <input
            type="text"
            value={schemaData}
            onChange={(e) => setSchemaData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema Data"
          />
          <button
            onClick={createSchema}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Create Schema
          </button>
        </div>

        {/* Get Schema Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Get Schema</h3>
          <label className="block font-medium mb-1">Schema Id</label>
          <input
            type="text"
            value={schemaId}
            onChange={(e) => setSchemaId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema Id"
          />
          <button
            onClick={getSchema}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Get Schema
          </button>
          {query && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-gray-700">
              <p>Query Name: {query.name}</p>
              <p>Registrant: {query.registrant}</p>
              <p>Data: {JSON.stringify(query.data)}</p>
            </div>
          )}
        </div>

        {/* Create Attestation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Create Attestation</h3>
          <label className="block font-medium mb-1">Schema Id</label>
          <input
            type="text"
            value={schemaId}
            onChange={(e) => setSchemaId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema Id"
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
            onClick={createAttestation}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Create Attestation
          </button>
        </div>
        {/* Query Attestation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Query Attestations</h3>
          <label className="block font-medium mb-1">Schema Id</label>
          <input
            type="text"
            value={querySchemaId}
            onChange={(e) => setQuerySchemaId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Schema Id"
          />
          <button
            onClick={queryAttestations}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Query Attestations
          </button>
          {queryResults.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-gray-700">
              <h4 className="font-medium">Query Results:</h4>
              <div className="mt-2">
                <p>
                  <strong>Worldcoin signature:</strong> {queryResults}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Revoke Attestation Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Revoke Attestation</h3>
          <label className="block font-medium mb-1">Attestation ID</label>
          <input
            type="text"
            value={attestationId}
            onChange={(e) => setAttestationId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Attestation ID"
          />
          <button
            onClick={revokeAttestation}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Revoke Attestation
          </button>
        </div>
      </div>
    </div>
  );
}
