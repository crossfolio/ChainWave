import Cookies from 'js-cookie';
import { queryAttestations } from './signProtocol';
import { ethers } from 'ethers';
import { getUserInfo } from './util';

export const connectMetaMask = async (
  setAccount,
  setIsAuthenticated,
  showCreateAccountDialog,
) => {
  if (!window.ethereum) {
    alert('Please install the MetaMask wallet!');
    return;
  }

  try {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const newAccount = await signer.getAddress();
    console.log('Current MetaMask account:', newAccount);
    setAccount(newAccount);
    Cookies.set('newAccount', newAccount, { expires: 1 });

    const querySchemaId = 'onchain_evm_421614_0x14e';
    const worldcoinId = Cookies.get('worldcoinId');
    const isValid = await queryAttestations(querySchemaId, worldcoinId);

    if (isValid.revoked === true) {
      showCreateAccountDialog();
    } else if (isValid.result === true) {
      setIsAuthenticated(true);
      localStorage.setItem('account', newAccount);
      localStorage.setItem('isAuthenticated', 'true');
      console.log('Verified successfully');
      const userInfo = await getUserInfo(newAccount);
      if (userInfo && userInfo.name) {
        console.log('metamask connect success');
        console.log('User info:', userInfo);
      } else {
        showCreateAccountDialog();
      }
    } else {
      setIsAuthenticated(false);
      console.log('Verification failed');
      alert('Account verification failed, please try again');
    }
  } catch (error) {
    console.error('Connection MetaMask error:', error);
  }
};
