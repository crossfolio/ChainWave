// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolSwapTest} from "lib/v4-core/src/test/PoolSwapTest.sol";
import "lib/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "lib/v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "lib/v4-core/src/libraries/TickMath.sol";
import {BalanceDelta} from "lib/v4-core/src/types/BalanceDelta.sol";
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
    /// @param fee the pool LP fee
    /// @param tickSpacing ticks that involve positions must be a multiple of tick spacing
    /// @param hookAddr the hooks of the pool, which can exact specified logic
    /// @param amountSpecified the amount of tokens to swap. Negative is an exact-input swap
    /// @param zeroForOne whether the swap is token0 -> token1 or token1 -> token0
    /// @param hookData any data to be passed to the pool's hook, no hook data on the hookless pool, give bytes(0)
    function _swap(
        address token0,
        address token1,
        uint24 fee,
        int24 tickSpacing,
        address hookAddr,
        int256 amountSpecified,
        bool zeroForOne,
        bytes memory hookData,
        uint256 ethAmount
    ) internal returns (BalanceDelta delta) {
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hookAddr)
        });

        uint160 MIN_PRICE_LIMIT = TickMath.MIN_SQRT_PRICE + 1;
        uint160 MAX_PRICE_LIMIT = TickMath.MAX_SQRT_PRICE - 1;
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: amountSpecified,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });

        PoolSwapTest.TestSettings memory testSettings = PoolSwapTest
            .TestSettings({takeClaims: false, settleUsingBurn: false});

        delta = swapRouter.swap{value: ethAmount}(
            key,
            params,
            testSettings,
            hookData
        );
    }

    /// @notice Burn USDC by CCTP
    /// @param destinationDomain specify which chain to receive USDC
    /// @param destinationRecipient specify the USDC recipient
    function _burnUSDC(
        uint256 amount,
        uint32 destinationDomain,
        address destinationRecipient
    ) internal returns (uint64 nonce) {
        USDC.approve(address(tokenMessenger), amount);

        bytes32 mintRecipientBytes32 = bytes32(
            uint256(uint160(destinationRecipient))
        );

        bytes32 depositForBurnWithCallerBytes32 = mintRecipientBytes32;

        nonce = tokenMessenger.depositForBurnWithCaller(
            amount,
            destinationDomain,
            mintRecipientBytes32,
            address(USDC),
            depositForBurnWithCallerBytes32
        );
    }

    /// @notice Mint USDC by CCTP
    function _mintUSDC(
        bytes calldata messageBytes,
        bytes calldata attestationSignature
    ) internal returns (bool success) {
        success = messageTransmitter.receiveMessage(
            messageBytes,
            attestationSignature
        );
    }

    /// @notice Transfer tokens from user to this contract
    function _transferTokenIn(
        address token,
        address user,
        uint256 amount
    ) internal {
        IERC20(token).transferFrom(user, address(this), amount);
    }

    /// @notice Transfer tokens from contract to user
    function _transferTokenOut(
        address token,
        address user,
        uint256 amount
    ) internal returns (bool result) {
        result = IERC20(token).transfer(user, amount);
    }

    /// @notice [cross-chain] send USDC only
    function departureUSDC(
        address user,
        uint256 amount,
        uint32 destinationDomain,
        address destinationRecipient
    ) public returns (uint64 nonce) {
        _transferTokenIn(address(USDC), user, amount);
        nonce = _burnUSDC(amount, destinationDomain, destinationRecipient);
    }

    /// @notice [cross-chain] receive USDC only
    function destinationUSDC(
        bytes calldata messageBytes,
        bytes calldata attestationSignature,
        address user
    ) public onlyOwner returns (bool result) {
        _mintUSDC(messageBytes, attestationSignature);
        uint256 usdcAmount = USDC.balanceOf(address(this));
        result = _transferTokenOut(address(USDC), user, usdcAmount);
    }
}
