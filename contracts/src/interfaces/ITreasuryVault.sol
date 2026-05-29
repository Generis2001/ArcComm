// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITreasuryVault {
    function deposit(address creator, uint256 amount) external;
    function withdraw(address creator, address to, uint256 amount) external;
    function balanceOf(address creator) external view returns (uint256);
}
