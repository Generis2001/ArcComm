// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ITreasuryVault} from "./interfaces/ITreasuryVault.sol";

contract ArcPaymentRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    ITreasuryVault public immutable vault;

    address public feeRecipient;
    uint256 public platformFeeBps;
    uint256 public constant MAX_FEE_BPS = 1500; // 15% hard cap

    // Prevents payment ID replay across different callers
    mapping(bytes32 => bool) public processedPayments;

    enum PaymentType {
        SUBSCRIPTION_INITIAL,
        SUBSCRIPTION_RENEWAL,
        CONTENT_PURCHASE,
        PRODUCT_PURCHASE
    }

    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed from,
        address indexed creator,
        uint256 grossAmount,
        uint256 platformFee,
        uint256 netAmount,
        PaymentType paymentType
    );
    event FeeUpdated(uint256 oldBps, uint256 newBps);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    error AlreadyProcessed(bytes32 paymentId);
    error ZeroAmount();
    error ZeroAddress();
    error FeeTooHigh(uint256 requested, uint256 max);

    constructor(
        address _usdc,
        address _vault,
        address _feeRecipient,
        uint256 _feeBps
    ) Ownable(msg.sender) {
        if (_usdc == address(0) || _vault == address(0) || _feeRecipient == address(0))
            revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh(_feeBps, MAX_FEE_BPS);

        usdc = IERC20(_usdc);
        vault = ITreasuryVault(_vault);
        feeRecipient = _feeRecipient;
        platformFeeBps = _feeBps;
    }

    function pay(
        bytes32 paymentId,
        address creator,
        uint256 amount,
        PaymentType paymentType
    ) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (creator == address(0)) revert ZeroAddress();
        if (processedPayments[paymentId]) revert AlreadyProcessed(paymentId);

        processedPayments[paymentId] = true;

        uint256 platformFee = (amount * platformFeeBps) / 10_000;
        uint256 netAmount = amount - platformFee;

        // Pull full amount from caller
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Forward platform fee
        if (platformFee > 0) {
            usdc.safeTransfer(feeRecipient, platformFee);
        }

        // Deposit net amount to vault
        usdc.forceApprove(address(vault), netAmount);
        vault.deposit(creator, netAmount);

        emit PaymentReceived(
            paymentId,
            msg.sender,
            creator,
            amount,
            platformFee,
            netAmount,
            paymentType
        );
    }

    function setFeeBps(uint256 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert FeeTooHigh(newBps, MAX_FEE_BPS);
        emit FeeUpdated(platformFeeBps, newBps);
        platformFeeBps = newBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }
}
