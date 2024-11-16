export const contract_ABI = {
  ERC20: [
    // Read-Only Functions
    'function balanceOf(address owner) view returns (uint256)',

    // Write Functions
    'function transfer(address to, uint amount) returns (bool)',
    'function deposit() public payable',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function withdraw(uint256 wad) public',
  ],
  AutoSwap: [
    // Write Functions
    'function singleChainSwap(address token0, address token1, uint24 fee, int24 tickSpacing, address hookAddr, int256 amountSpecified, bool zeroForOne, bytes memory hookData) public payable',
    'function multiChainSwap(address token0, address token1, uint24 fee, int24 tickSpacing, address hookAddr, int256 amountSpecified, bool zeroForOne, bytes memory hookData, uint32 destinationDomain, address destinationRecipient) public payable',
    'function autoSingleChainSwap(address token0, address token1, uint24 fee, int24 tickSpacing, address hookAddr, int256 amountSpecified, bool zeroForOne, bytes memory hookData, address user) public',
    'function autoMultiChainSwap(address token0, address token1, uint24 fee, int24 tickSpacing, address hookAddr, int256 amountSpecified, bool zeroForOne, bytes memory hookData, uint32 destinationDomain, address destinationRecipient, address user) public',
    'function destinationUSDC(bytes calldata messageBytes, bytes calldata attestationSignature, address user) public',
    'function destinationUSDCAndSwap(bytes calldata messageBytes, bytes calldata attestationSignature, address token0, address token1, uint24 fee, int24 tickSpacing, address hookAddr, bool zeroForOne, bytes memory hookData, address user)'
  ],
}

export const contract_address = {
  ETH: {
    CCTP: {
      Token_Messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
      Message_Transmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
      Message: '0x80537e4e8bAb73D21096baa3a8c813b45CA0b7c9',
    },

    UNI: {
      Swap_Test: '0xe49d2815C231826caB58017e214Bed19fE1c2dD4',
    },

    Token: {
      USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },

    ChainWave: '0x36Ada81c3436F8C75A243425B9Ebd3320858c313',
  },

  ARB: {
    CCTP: {
      Token_Messenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
      Message_Transmitter: '0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872',
      Message: '0x0',
    },

    UNI: {
      Swap_Test: '0x0',
    },

    Token: {
      USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      UNI: '0x0',
    },

    ChainWave: '0xdc8cFDE4E25df84562D32E5Bd5F0e78E432b9c17',
  },

  UNI: {
    CCTP: {
      Token_Messenger: '0x0',
      Message_Transmitter: '0x0',
      Message: '0x0',
    },

    UNI: {
      Swap_Test: '0xe437355299114d35Ffcbc0c39e163B24A8E9cBf1',
    },

    Token: {
      USDC: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
      UNI: '0x0',
    },

    ChainWave: '0xF9c39b98618F8c30c3edB127f41b75B395De6BE6',
  },
}
