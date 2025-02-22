// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {IPoolManager} from "lib/v4-core/src/interfaces/IPoolManager.sol";
import "lib/v4-core/src/types/PoolKey.sol";
import {PoolSwapTest} from "lib/v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "lib/v4-core/src/libraries/TickMath.sol";
import {ChainWave} from "../src/ChainWave.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPositionManager} from "lib/v4-periphery/src/interfaces/IPositionManager.sol";

contract SrcChainScript is Script {
    address public USDC_ETH_CONTRACT_ADDRESS =
        0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address public UNI_ETH_CONTRACT_ADDRESS =
        0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984;

    address public ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5;
    address public ETH_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        0x7865fAfC2db2093669d92c0F33AeEF291086BEFD;

    address public ETH_UNI_ROUTER_V4_CONTRACT_ADDRESS =
        0xe49d2815C231826caB58017e214Bed19fE1c2dD4;

    address public ETH_CHAIN_WAVE_CONTRACT_ADDRESS =
        0x36Ada81c3436F8C75A243425B9Ebd3320858c313;
    address public BASE_CHAIN_WAVE_CONTRACT_ADDRESS =
        0xF9c39b98618F8c30c3edB127f41b75B395De6BE6;

    address zeroAddress = address(0);

    function setUp() public {
        // vm.createSelectFork(
        //     "https://eth-sepolia.g.alchemy.com/v2/vH0O61Etz-4nHscME2FA6IWVfpB2sSQ3"
        // );
    }

    function run() public {
        address user = address(0xAbCDefA067FF1201719867f10e497dEEAc78CC67);
        uint32 destinationDomain = 6;
        address destinationRecipient = BASE_CHAIN_WAVE_CONTRACT_ADDRESS;

        address token0 = USDC_ETH_CONTRACT_ADDRESS;
        address token1 = UNI_ETH_CONTRACT_ADDRESS;
        uint24 fee = 3000;
        int24 tickSpacing = 60;
        address hookAddr = zeroAddress;
        bool zeroForOne = false;
        int256 amountSpecified = -0.00001 ether;
        bytes memory hookData = new bytes(0); // 0x

        vm.startBroadcast();

        // IPositionManager(0xB433cB9BcDF4CfCC5cAB7D34f90d1a7deEfD27b9)
        //     .getPoolAndPositionInfo(6);

        // ChainWave chainWave = new ChainWave(
        //     UNI_UNI_ROUTER_V4_CONTRACT_ADDRESS,
        //     zeroAddress,
        //     zeroAddress,
        //     USDC_UNI_CONTRACT_ADDRESS
        // );

        // vm.prank(user);
        // IERC20(token0).approve(
        //     address(ETH_CHAIN_WAVE_CONTRACT_ADDRESS),
        //     type(uint256).max
        // );

        // chainWave.departureUSDC(
        //     user,
        //     100000,
        //     destinationDomain,
        //     destinationRecipient
        // );

        ChainWave(ETH_CHAIN_WAVE_CONTRACT_ADDRESS).autoMultiChainSwap(
            token0,
            token1,
            fee,
            tickSpacing,
            hookAddr,
            amountSpecified,
            zeroForOne,
            hookData,
            destinationDomain,
            destinationRecipient,
            user
        );

        // ChainWave(ETH_CHAIN_WAVE_CONTRACT_ADDRESS).multiChainSwap(
        //     token0,
        //     token1,
        //     fee,
        //     tickSpacing,
        //     hookAddr,
        //     amountSpecified,
        //     zeroForOne,
        //     hookData,
        //     destinationDomain,
        //     destinationRecipient
        // );

        // chainWave.autoSingleChainSwap(
        //     token0,
        //     token1,
        //     fee,
        //     tickSpacing,
        //     hookAddr,
        //     amountSpecified,
        //     zeroForOne,
        //     hookData,
        //     user
        // );

        // chainWave.autoMultiChainSwap(
        //     token0,
        //     token1,
        //     fee,
        //     tickSpacing,
        //     hookAddr,
        //     amountSpecified,
        //     zeroForOne,
        //     hookData,
        //     destinationDomain,
        //     destinationRecipient,
        //     user
        // );

        vm.stopBroadcast();
    }
}
