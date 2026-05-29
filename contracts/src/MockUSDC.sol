// SPDX-License-Identifier: MIT
// Testnet only — do not deploy to mainnet
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 1,000,000 USDC to deployer for testnet use
        _mint(msg.sender, 1_000_000 * 10 ** 6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // Anyone can mint on testnet — for development only
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
