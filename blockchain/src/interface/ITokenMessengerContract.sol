// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ITokenMessengerContract {
    function depositForBurnWithCaller(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 depositForBurnWithCaller
    ) external returns (uint64 _nonce);
}
