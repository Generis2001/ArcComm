// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SubscriptionManager is Ownable {
    struct Subscription {
        address subscriber;
        address creator;
        bytes32 tierId;
        uint256 startedAt;
        uint256 currentPeriodEnd;
        bool active;
    }

    mapping(bytes32 => Subscription) public subscriptions;
    mapping(address => bytes32[]) public userSubscriptionIds;
    // subscriber => tierId => subId (tracks the active sub for a given tier)
    mapping(address => mapping(bytes32 => bytes32)) public activeSubs;

    address public router;

    event SubscriptionCreated(
        bytes32 indexed subId,
        address indexed subscriber,
        address indexed creator,
        bytes32 tierId,
        uint256 periodEnd
    );
    event SubscriptionRenewed(bytes32 indexed subId, uint256 newPeriodEnd);
    event SubscriptionCancelled(bytes32 indexed subId);

    error OnlyRouter();
    error AlreadyExists(bytes32 subId);
    error NotActive(bytes32 subId);
    error Unauthorized();

    modifier onlyRouter() {
        if (msg.sender != router) revert OnlyRouter();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    function createSubscription(
        bytes32 subId,
        address subscriber,
        address creator,
        bytes32 tierId,
        uint256 periodEnd
    ) external onlyRouter {
        if (subscriptions[subId].startedAt != 0) revert AlreadyExists(subId);

        subscriptions[subId] = Subscription({
            subscriber: subscriber,
            creator: creator,
            tierId: tierId,
            startedAt: block.timestamp,
            currentPeriodEnd: periodEnd,
            active: true
        });

        userSubscriptionIds[subscriber].push(subId);
        activeSubs[subscriber][tierId] = subId;

        emit SubscriptionCreated(subId, subscriber, creator, tierId, periodEnd);
    }

    function renewSubscription(bytes32 subId, uint256 newPeriodEnd) external onlyRouter {
        Subscription storage sub = subscriptions[subId];
        if (!sub.active) revert NotActive(subId);
        sub.currentPeriodEnd = newPeriodEnd;
        emit SubscriptionRenewed(subId, newPeriodEnd);
    }

    function cancelSubscription(bytes32 subId) external {
        Subscription storage sub = subscriptions[subId];
        if (sub.subscriber != msg.sender && msg.sender != owner()) revert Unauthorized();
        sub.active = false;
        delete activeSubs[sub.subscriber][sub.tierId];
        emit SubscriptionCancelled(subId);
    }

    function isSubscribed(address subscriber, bytes32 tierId) external view returns (bool) {
        bytes32 subId = activeSubs[subscriber][tierId];
        if (subId == bytes32(0)) return false;
        Subscription storage sub = subscriptions[subId];
        return sub.active && sub.currentPeriodEnd > block.timestamp;
    }

    function getUserSubscriptions(address subscriber) external view returns (bytes32[] memory) {
        return userSubscriptionIds[subscriber];
    }
}
