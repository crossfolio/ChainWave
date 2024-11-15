import { ethers } from 'ethers';

// 獨立的 ENS 解析函數
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

// 統一的 MetaMask 可用性檢查
export function checkMetaMaskAvailability() {
  if (!window.ethereum) {
    alert('MetaMask is not installed');
    return false;
  }
  return true;
}

// 地址格式化函數
export function formatAddress(address) {
  return `${address.substring(0, 6)}......${address.slice(-4)}`;
}

export function createAccount() {}