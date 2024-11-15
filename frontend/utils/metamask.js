// connectMetaMask.js
import Cookies from 'js-cookie';
import { queryAttestations } from './signProtocol';

export const connectMetaMask = async (
  setAccount,
  setIsAuthenticated,
  showCreateAccountDialog,
) => {
  if (!window.ethereum) {
    alert('Please Install MetaMask Wallet！');
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const newAccount = accounts[0];
    setAccount(newAccount);
    Cookies.set('newAccount', newAccount, { expires: 1 }); // cookie 有效期為 1 天

    // 執行 queryAttestations 驗證
    const querySchemaId = 'onchain_evm_421614_0x14e'; // 替換為您的 Schema ID
    const worldcoinId = Cookies.get('worldcoinId'); // 替換為您的 Worldcoin ID
    const isValid = await queryAttestations(querySchemaId, worldcoinId);

    if (isValid.revoked === true) {
      showCreateAccountDialog();
    } else if (isValid.result === true) {
      setIsAuthenticated(true);
      localStorage.setItem('account', newAccount);
      localStorage.setItem('isAuthenticated', 'true');
      console.log('Verified successfully');
    } else {
      setIsAuthenticated(false);
      console.log('Verification failed');
      alert('Account verification failed, please try again');
    }
  } catch (error) {
    console.error('Connection MetaMask error:', error);
  }
};
