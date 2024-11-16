// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IMessageTransmitterContract {
    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success);
}
