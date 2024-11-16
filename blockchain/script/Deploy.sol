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

contract DeployScript is Script {
    address public USDC_BASE_CONTRACT_ADDRESS =
        0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    address public BASE_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5;
    address public BASE_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        0x7865fAfC2db2093669d92c0F33AeEF291086BEFD;

    address public BASE_UNI_ROUTER_V4_CONTRACT_ADDRESS =
        0x96E3495b712c6589f1D2c50635FDE68CF17AC83c;

    address zeroAddress = address(0);

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        ChainWave chainWave = new ChainWave(
            BASE_UNI_ROUTER_V4_CONTRACT_ADDRESS,
            BASE_TOKEN_MESSENGER_CONTRACT_ADDRESS,
            BASE_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
            USDC_BASE_CONTRACT_ADDRESS
        );

        vm.stopBroadcast();
    }
}
