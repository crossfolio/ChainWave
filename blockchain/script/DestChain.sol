// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {ChainWave} from "../src/ChainWave.sol";

contract DestChainScript is Script {
    address public USDC_BASE_CONTRACT_ADDRESS =
        0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address public ASCEND_BASE_CONTRACT_ADDRESS =
        0xb23E177B86a6Da4D078204ae3Ca326c4cb1dfe9E;

    address public BASE_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5;
    address public BASE_TOKEN_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        0x7865fAfC2db2093669d92c0F33AeEF291086BEFD;

    address public BASE_UNI_ROUTER_V4_CONTRACT_ADDRESS =
        0x96E3495b712c6589f1D2c50635FDE68CF17AC83c;

    address public BASE_CHAIN_WAVE_CONTRACT_ADDRESS =
        0xF9c39b98618F8c30c3edB127f41b75B395De6BE6;

    function setUp() public {}

    function run() public {
        bytes
            memory messageBytes = hex"00000000000000000000000600000000000406820000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa50000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa5000000000000000000000000f9c39b98618f8c30c3edb127f41b75b395de6be6000000000000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238000000000000000000000000f9c39b98618f8c30c3edb127f41b75b395de6be6000000000000000000000000000000000000000000000000000000000000000100000000000000000000000036ada81c3436f8c75a243425b9ebd3320858c313";
        bytes
            memory attestationSignature = hex"58eaf866fd4b9ec02f038213fa8398171baf14e6b039d77a82a006fc048919c771e50c1b8e620e45e2a5d781a9a715221212910513cbb36436941dfb5db6ea221be54300fcecffa0c5be36fcf462de7c7d936f73fe6aaa8a1f267bd9f10894ede51d411079f92d4cfb8079f72e4a777fdc8e31a024bf20e274cfa8899801b9172e1c";
        address user = address(0xAbCDefA067FF1201719867f10e497dEEAc78CC67);

        address token0 = USDC_BASE_CONTRACT_ADDRESS;
        address token1 = ASCEND_BASE_CONTRACT_ADDRESS;
        uint24 fee = 15000;
        int24 tickSpacing = 60;
        address hookAddr = 0xA788031C591B6824c032a0EFe74837EE5eaeC080;
        bool zeroForOne = true;
        int256 amountSpecified = -0.00001 ether;
        bytes memory hookData = new bytes(0); // 0x

        vm.startBroadcast();

        // ChainWave chainWave = new ChainWave(
        //     address(0),
        //     ARB_TOKEN_MESSENGER_CONTRACT_ADDRESS,
        //     ARB_MESSAGE_TRANSIMITTER_CONTRACT_ADDRESS,
        //     USDC_ARB_CONTRACT_ADDRESS
        // );

        ChainWave(BASE_CHAIN_WAVE_CONTRACT_ADDRESS).destinationUSDCAndSwap(
            messageBytes,
            attestationSignature,
            token0,
            token1,
            fee,
            tickSpacing,
            hookAddr,
            zeroForOne,
            hookData,
            user
        );

        vm.stopBroadcast();
    }
}
