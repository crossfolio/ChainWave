import { IndexService, decodeOnChainData } from '@ethsign/sp-sdk';
import { verifyMessage, ethers } from 'ethers';

export async function queryAttestations(querySchemaId, worldcoinId) {
  if (!querySchemaId) {
    console.error('Please enter a schema id to query attestations');
    return false;
  }

  try {
    const indexService = new IndexService('testnet');
    console.log('Querying attestations with schemaId:', querySchemaId);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAccount = await signer.getAddress();
    console.log('Current MetaMask account:', currentAccount);

    const response = await indexService.queryAttestationList({
      schemaId: querySchemaId,
      page: 1,
      mode: 'onchain',
      attester: currentAccount,
    });

    console.log('Query response:', response);

    if (response.rows.length === 0 || response.rows[0].revoked === true) {
      console.log('No attestations found or attestation has been revoked');
      return { result: true, revoked: true };
    }

    const att = response.rows[0]?.data;

    if (att) {
      const schemaData =
        '[{"name":"worldcoinSign","type":"string","required":true}]';

      const worldcoinSign = decodeOnChainData(att, JSON.parse(schemaData));
      console.log('Decoded data:', worldcoinSign);

      if (!worldcoinSign) {
        console.error('worldcoinSign is undefined in decoded data');
        return false;
      }

      const originalMessage = JSON.stringify({ worldcoinId: worldcoinId });
      console.log('Original message:', originalMessage);

      const signerAddress = verifyMessage(originalMessage, worldcoinSign);
      console.log('Signer address:', signerAddress);

      if (signerAddress.toLowerCase() === currentAccount.toLowerCase()) {
        console.log(
          "Signature verification successful. The signer's address matches the current MetaMask address.",
        );
        return { result: true, revoked: false };
      } else {
        console.log(
          "Signature verification failed. The signer's address did not matches the current MetaMask address.",
        );
        return { result: false, revoked: false };
      }
    } else {
      console.error('No attestations found or failed to decode data');
      return false;
    }
  } catch (error) {
    console.error('Failed to query attestations:', error.message || error);
    return false;
  }
}

export async function queryAttestationsId(querySchemaId, worldcoinId) {
  if (!querySchemaId) {
    console.error('Please enter a schema id to query attestations');
    return false;
  }

  try {
    const indexService = new IndexService('testnet');
    console.log('Querying attestations with schemaId:', querySchemaId);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAccount = await signer.getAddress();
    console.log('Current MetaMask account:', currentAccount);

    const response = await indexService.queryAttestationList({
      schemaId: querySchemaId,
      page: 1,
      mode: 'onchain',
      attester: currentAccount,
    });

    console.log('Query response:', response);

    if (response.rows[0].revoked === true || response.rows.length === 0) {
      console.log('No attestations found or attestation has been revoked');
      return { result: true, revoked: true };
    }

    const attestationId = response.rows[0]?.attestationId;

    if (attestationId) {
      return attestationId;
    } else {
      console.error('No attestations found or failed to decode data');
      return null;
    }
  } catch (error) {
    console.error('Failed to query attestations:', error.message || error);
    return null;
  }
}
