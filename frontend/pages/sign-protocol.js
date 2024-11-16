import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Header from "../components/Header";
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";

export default function SignProtocol({ account }) {
  const [deviceId, setDeviceId] = useState("");
  const [deviceSignature, setDeviceSignature] = useState("");
  const [verifyDeviceRes, setVerifyDeviceRes] = useState("");
  const [schemaId, setSchemaId] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [schemaData, setSchemaData] = useState(
    '[{"name":"worldcoinId","type":"string","required":true},{"name":"ethereumAddress","type":"address","required":true},{"name":"timestamp","type":"uint256","required":true},{"name":"signature","type":"string","required":true,"description":"由 Ethereum 地址對訊息進行的數位簽名"}]'
  );
  const [query, setQuery] = useState(null);

  const [worldcoinId, setWorldcoinId] = useState("");
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    if (!account) connectWallet();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else {
      alert("MetaMask is not installed");
    }
  };

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.sepolia,
  });

  const createSchema = async () => {
    if (!window.ethereum || !account) {
      alert("MetaMask is not installed or not connected");
      return;
    }
    try {
      const createSchemaRes = await client.createSchema({
        name: schemaName,
        data: JSON.parse(schemaData),
        signatureRules: {
          method: "eth_sign",
          fieldsToSign: ["worldcoinId", "ethereumAddress", "timestamp"],
        },
      });
      console.log("Schema created successfully:", createSchemaRes);
      setSchemaId(createSchemaRes.schemaId);
    } catch (error) {
      console.error("Failed to create schema:", error);
    }
  };

  const getSchema = async () => {
    if (!window.ethereum || !account || !schemaId) {
      alert("Please ensure MetaMask is connected and enter a schema id");
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
    if (
      !window.ethereum ||
      !account ||
      !schemaId ||
      !worldcoinId ||
      !ethereumAddress
    ) {
      alert(
        "Please ensure all fields are filled in, and MetaMask is connected"
      );
      return;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);

      const message = JSON.stringify({
        worldcoinId: worldcoinId,
        ethereumAddress: ethereumAddress,
        timestamp: timestamp,
      });

      const signedMessage = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      const attestationData = {
        worldcoinId: worldcoinId,
        ethereumAddress: ethereumAddress,
        timestamp: timestamp,
        signature: signedMessage,
      };

      const attestationRes = await client.createAttestation({
        schemaId: schemaId,
        data: attestationData,
      });
      console.log("Attestation Created:", attestationRes);
    } catch (error) {
      console.error("Failed to create attestation:", error);
    }
  };



  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Header account={account} />
      <h2 className="text-2xl font-semibold my-6">Sign Protocol</h2>

      <div className="space-y-6">
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
          <label className="block font-medium mb-1">Ethereum Address</label>
          <input
            type="text"
            value={ethereumAddress}
            onChange={(e) => setEthereumAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter Ethereum Address"
          />
          <button
            onClick={createAttestation}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Create Attestation
          </button>
        </div>
        
      </div>
    </div>
  );
}
