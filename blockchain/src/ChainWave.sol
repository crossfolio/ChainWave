// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolSwapTest} from "lib/v4-core/src/test/PoolSwapTest.sol";
import {ITokenMessengerContract} from "src/interface/ITokenMessengerContract.sol";
import {IMessageTransmitterContract} from "src/interface/IMessageTransmitterContract.sol";

contract ChainWave is Ownable2Step {
    PoolSwapTest private swapRouter;
    ITokenMessengerContract private tokenMessenger;
    IMessageTransmitterContract private messageTransmitter;
    IERC20 private USDC;

    constructor(
        address _swapRouter,
        address _tokenMessenger,
        address _messageTransmitter,
        address _usdc
    ) Ownable(msg.sender) {
        swapRouter = PoolSwapTest(_swapRouter);
        tokenMessenger = ITokenMessengerContract(_tokenMessenger);
        messageTransmitter = IMessageTransmitterContract(_messageTransmitter);
        USDC = IERC20(_usdc);
    }

    /// @notice Call DEX to swap tokens
    function _swap() internal {}

    /// @notice Burn USDC by CCTP
    function _burnUSDC() internal {}

    /// @notice Mint USDC by CCTP
    function _mintUSDC() internal {}
}
