// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {IPoolManager} from "lib/v4-core/src/interfaces/IPoolManager.sol";
import "lib/v4-core/src/types/PoolKey.sol";
import {PoolSwapTest} from "lib/v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "lib/v4-core/src/libraries/TickMath.sol";
import {ChainWave} from "../src/ChainWave.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SrcChainScript is Script {
    address public USDC_ETH_CONTRACT_ADDRESS =
        0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address public ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5;
    address public ETH_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        0x7865fAfC2db2093669d92c0F33AeEF291086BEFD;
    address public ETH_UNI_ROUTER_V4_CONTRACT_ADDRESS =
        0xe49d2815C231826caB58017e214Bed19fE1c2dD4;

    address zeroAddress = address(0);

    function setUp() public {}

    function run() public {
        address user = address(0xf73Dc2BdeB8855af9dc2B862C78DBB1F679b95c2);
        uint32 destinationDomain = 3;
        address destinationRecipient = address(0x123);

        vm.startBroadcast();

        ChainWave chainWave = new ChainWave(
            ETH_UNI_ROUTER_V4_CONTRACT_ADDRESS,
            ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS,
            ETH_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
            USDC_ETH_CONTRACT_ADDRESS
        );

        IERC20(USDC_ETH_CONTRACT_ADDRESS).approve(
            address(chainWave),
            type(uint256).max
        );

        chainWave.departureUSDC(
            user,
            100000,
            destinationDomain,
            destinationRecipient
        );

        vm.stopBroadcast();
    }
}
