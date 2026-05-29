// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TreasuryVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public router;

    // creator address → USDC balance (6 decimals)
    mapping(address => uint256) public balances;

    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    event RouterUpdated(address indexed oldRouter, address indexed newRouter);
    event Deposited(address indexed creator, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed creator, address indexed to, uint256 amount);

    error OnlyRouter();
    error InsufficientBalance(uint256 requested, uint256 available);
    error ZeroAmount();
    error ZeroAddress();

    modifier onlyRouter() {
        if (msg.sender != router) revert OnlyRouter();
        _;
    }

    constructor(address _usdc) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    function setRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert ZeroAddress();
        emit RouterUpdated(router, _router);
        router = _router;
    }

    // Called by PaymentRouter after transferring USDC to this contract
    function deposit(address creator, uint256 amount) external onlyRouter nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (creator == address(0)) revert ZeroAddress();

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        balances[creator] += amount;
        totalDeposited += amount;

        emit Deposited(creator, amount, balances[creator]);
    }

    // Called by platform operator to fulfill a payout request
    function withdraw(
        address creator,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (to == address(0)) revert ZeroAddress();
        if (balances[creator] < amount) {
            revert InsufficientBalance(amount, balances[creator]);
        }

        balances[creator] -= amount;
        totalWithdrawn += amount;
        usdc.safeTransfer(to, amount);

        emit Withdrawn(creator, to, amount);
    }

    // Creator can self-withdraw, bypassing the platform payout queue
    function selfWithdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance(amount, balances[msg.sender]);
        }

        balances[msg.sender] -= amount;
        totalWithdrawn += amount;
        usdc.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, msg.sender, amount);
    }

    function balanceOf(address creator) external view returns (uint256) {
        return balances[creator];
    }

    function contractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
