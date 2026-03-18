// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IAgentRegistry } from "./interfaces/IAgentRegistry.sol";
import { Constants } from "./libraries/Constants.sol";

/// @title AgentRegistry — Agent profiles, tiers, and staking
/// @notice Manages agent registration, tier promotion, and stake tracking
contract AgentRegistry is IAgentRegistry, Ownable {
    // Stub — full implementation in Phase 1
    mapping(address => AgentProfile) private _agents;
    address public jobEscrow;

    constructor(address _owner) Ownable(_owner) {}

    function setJobEscrow(address _jobEscrow) external onlyOwner {
        jobEscrow = _jobEscrow;
    }

    function registerAgent(bytes32 erc8004Identity, string calldata metadataURI) external {}
    function updateAvailability(bool available) external {}
    function stakeForTier() external payable {}
    function unstake(uint256 amount) external {}
    function recordJobCompletion(address agent, bool hadDispute) external {}
    function incrementActiveJobs(address agent) external {}
    function decrementActiveJobs(address agent) external {}
    function getAgentProfile(address agent) external view returns (AgentProfile memory) { return _agents[agent]; }
    function isRegistered(address agent) external view returns (bool) { return _agents[agent].registeredAt > 0; }
    function getAgentTier(address agent) external view returns (AgentTier) { return _agents[agent].tier; }
    function getActiveJobs(address agent) external view returns (uint256) { return _agents[agent].activeJobs; }
}
