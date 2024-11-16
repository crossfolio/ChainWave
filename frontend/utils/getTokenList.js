import axios from 'axios';
import { chains } from './chainsConfig';

const getChainConfig = (chainName) => {
  return chains.find((chain) => chain.name === chainName);
};

export const fetchAssetsFromBlockscout = async (chain, account) => {
  const chainConfig = getChainConfig(chain);
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const { baseUrl, nativeDecimals, nativeSymbol } = chainConfig;

  try {
    const [tokenResponse, nativeResponse] = await Promise.all([
      fetch(`${baseUrl}?module=account&action=tokenlist&address=${account}`),
      fetch(`${baseUrl}?module=account&action=balance&address=${account}`),
    ]);

    if (!tokenResponse.ok || !nativeResponse.ok) {
      throw new Error(
        `Failed to fetch data from ${chainConfig.displayName} Blockscout`,
      );
    }

    let tokens = (await tokenResponse.json()).result || [];
    const nativeBalance = parseFloat(
      (await nativeResponse.json()).result || '0',
    );

    const native = {
      symbol: nativeSymbol || 'Native',
      balance: nativeBalance.toString(),
      decimals: nativeDecimals,
      contractAddress: null,
    };

    tokens = tokens.filter(
      (token) => token.contractAddress && token.symbol && token.decimals,
    );

    tokens.unshift(native);

    return { tokens };
  } catch (error) {
    console.error(
      `Error fetching assets from ${chainConfig.displayName}:`,
      error,
    );
    throw new Error(`Error fetching assets: ${error.message}`);
  }
};

export const calculateTokenAmount = (balance, decimals) => {
  const parsedBalance =
    typeof balance === 'bigint' ? balance : parseFloat(balance);

  const parsedDecimals = Number(decimals);
  if (!Number.isInteger(parsedDecimals) || parsedDecimals < 0) {
    console.warn('Invalid decimals:', decimals);
    return 0;
  }

  const factor = Math.pow(10, parsedDecimals);
  const amount = parsedBalance / factor;

  return parseFloat(amount.toFixed(5));
};

export const getPrices = async (cryptocurrencies) => {
  const pricePromises = cryptocurrencies.map(async (crypto) => {
    try {
      const response = await axios.get(
        `/api/cryptocurrency?symbol=${crypto.symbol}`,
      );
      crypto.price = response.data.data[crypto.symbol].quote.USD.price;
    } catch (error) {
      console.error(`Error fetching price for ${crypto.symbol}:`, error);
      crypto.price = null;
      crypto.error = error.message;
    }
  });

  await Promise.all(pricePromises);
  return cryptocurrencies;
};
