// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {ChainWave} from "../src/ChainWave.sol";

contract DestChainScript is Script {
    address public USDC_ARB_CONTRACT_ADDRESS =
        0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    address public ARB_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5;
    address public ARB_MESSAGE_TRANSIMITTER_CONTRACT_ADDRESS =
        0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872;
    address public ARB_CHAIN_WAVE_CONTRACT_ADDRESS =
        0xdc8cFDE4E25df84562D32E5Bd5F0e78E432b9c17;

    function setUp() public {}

    function run() public {
        bytes
            memory messageBytes = hex"000000000000000000000003000000000004066b0000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa50000000000000000000000009f3b8679c73c2fef8b59b4f3444d4e156fb70aa5000000000000000000000000dc8cfde4e25df84562d32e5bd5f0e78e432b9c17000000000000000000000000000000001c7d4b196cb0c7b01d743fbc6116a902379c7238000000000000000000000000dc8cfde4e25df84562d32e5bd5f0e78e432b9c17000000000000000000000000000000000000000000000000000000000000387600000000000000000000000036ada81c3436f8c75a243425b9ebd3320858c313";
        bytes
            memory attestationSignature = hex"d65b6623d873f1de5933661db8468bdc7ab83ef88f12b1220661494e436570276fa4b37b889d47e1677cc32fc23813c4ecae1f220de4c3ccac82ee55e9493d011b988d7071782a5d787bf04fb87ba0607bf92e9234af358a25b491e5574a2de9fd3b6dfa73b0441522298143bffe585a55cdde2d6d89da4b5ba8fef34485b0c57e1c";
        address user = address(0xAbCDefA067FF1201719867f10e497dEEAc78CC67);

        vm.startBroadcast();

        // ChainWave chainWave = new ChainWave(
        //     address(0),
        //     ARB_TOKEN_MESSENGER_CONTRACT_ADDRESS,
        //     ARB_MESSAGE_TRANSIMITTER_CONTRACT_ADDRESS,
        //     USDC_ARB_CONTRACT_ADDRESS
        // );

        ChainWave(ARB_CHAIN_WAVE_CONTRACT_ADDRESS).destinationUSDC(
            messageBytes,
            attestationSignature,
            user
        );

        vm.stopBroadcast();
    }
}
