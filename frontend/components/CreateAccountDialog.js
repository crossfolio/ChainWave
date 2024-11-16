import { useState } from "react";
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
} from "@ethsign/sp-sdk";
import Cookies from "js-cookie";

export default function CreateAccountDialog({
  isOpen,
  onClose,
  onCreate,
  account,
}) {
  const [name, setName] = useState("");
  const [schemaId, setSchemaId] = useState("0x14e");

  const [isMessageSigned, setIsMessageSigned] = useState(false);
  const [isAttestationCreated, setIsAttestationCreated] = useState(false);

  if (!isOpen) return null;

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.arbitrumSepolia,
  });

  const handleCreateAccount = () => {
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    if (!isMessageSigned) {
      alert("Please sign the message before proceeding.");
      return;
    }
    if (!isAttestationCreated) {
      alert("Please create an attestation before proceeding.");
      return;
    }

    console.log("Creating account with name:", name);
    onCreate(name);
    onClose();
  };

  const createAttestation = async () => {
    const worldcoinId = Cookies.get("worldcoinId");
    if (!window.ethereum || !account || !schemaId || !worldcoinId) {
      alert(
        "Please ensure all fields are filled in, and MetaMask is connected"
      );
      return;
    }

    try {
      const message = JSON.stringify({
        worldcoinId: worldcoinId,
      });

      const signedMessage = await window.ethereum.request({
        method: "personal_sign",
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

      console.log("Attestation Created:", attestationRes);
    } catch (error) {
      console.error("Failed to create attestation:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Create Attestation Section */}
        <div className="flex items-center justify-center mb-4">
          <p className={`mr-2 ${isMessageSigned ? 'text-green-500' : 'text-gray-500'}`}>
            Sign message
          </p>
          {isMessageSigned ? (
            <span className="text-green-500 font-semibold">✔</span>
          ) : (
            <span className="text-gray-500 font-semibold">✗</span>
          )}
        </div>

        <div className="flex items-center justify-center mb-4">
          <p className={`mr-2 ${isAttestationCreated ? 'text-green-500' : 'text-gray-500'}`}>
            Create Attestation
          </p>
          {isAttestationCreated ? (
            <span className="text-green-500 font-semibold">✔</span>
          ) : (
            <span className="text-gray-500 font-semibold">✗</span>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={createAttestation}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Create Attestation
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCreateAccount}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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