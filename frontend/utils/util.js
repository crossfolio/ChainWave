import { ethers } from 'ethers';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function resolveENS(address, setEnsName) {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    try {
      const ens = await provider.lookupAddress(address);
      setEnsName(ens || null);
    } catch (error) {
      console.error('Failed to resolve ENS', error);
      setEnsName(null);
    }
  }
}

export function checkMetaMaskAvailability() {
  if (!window.ethereum) {
    alert('MetaMask is not installed');
    return false;
  }
  return true;
}

export function formatAddress(address) {
  return `${address.substring(0, 6)}......${address.slice(-4)}`;
}

export async function getUserInfo(wallet_address) {
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

    if(response.status === 204){
      return null;
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error during verification:', error);
  }
};

export function createAccount() { }
