// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISubscriptionManager {
    function createSubscription(
        bytes32 subId,
        address subscriber,
        address creator,
        bytes32 tierId,
        uint256 periodEnd
    ) external;

    function renewSubscription(bytes32 subId, uint256 newPeriodEnd) external;
    function cancelSubscription(bytes32 subId) external;
    function isSubscribed(address subscriber, bytes32 tierId) external view returns (bool);
}
