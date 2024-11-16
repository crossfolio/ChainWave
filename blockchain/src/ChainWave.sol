// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract ChainWave is Ownable2Step {
    constructor() Ownable(msg.sender) {}
}
