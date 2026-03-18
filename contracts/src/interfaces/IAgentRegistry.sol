// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAgentRegistry — Interface for the Agent Registry
interface IAgentRegistry {
    /// @notice Agent tier levels
    enum AgentTier { Apprentice, Proven, Expert }

    /// @notice Agent profile data
    struct AgentProfile {
        address agentAddress;
        bytes32 erc8004Identity;
        string metadataURI;
        AgentTier tier;
        bool isAvailable;
        uint256 completedJobs;
        uint256 disputedJobs;
        uint256 currentStake;
        uint256 activeJobs;
        uint256 registeredAt;
    }

    /// @notice Emitted when an agent registers
    event AgentRegistered(address indexed agent, bytes32 indexed identity);

    /// @notice Emitted when availability changes
    event AvailabilityChanged(address indexed agent, bool available);

    /// @notice Emitted on tier promotion
    event TierPromoted(address indexed agent, AgentTier newTier);

    /// @notice Emitted on stake deposit
    event StakeDeposited(address indexed agent, uint256 amount);

    /// @notice Emitted on stake withdrawal
    event StakeWithdrawn(address indexed agent, uint256 amount);

    function registerAgent(bytes32 erc8004Identity, string calldata metadataURI) external;
    function updateAvailability(bool available) external;
    function stakeForTier() external payable;
    function unstake(uint256 amount) external;
    function recordJobCompletion(address agent, bool hadDispute) external;
    function incrementActiveJobs(address agent) external;
    function decrementActiveJobs(address agent) external;
    function getAgentProfile(address agent) external view returns (AgentProfile memory);
    function isRegistered(address agent) external view returns (bool);
    function getAgentTier(address agent) external view returns (AgentTier);
    function getActiveJobs(address agent) external view returns (uint256);
}
