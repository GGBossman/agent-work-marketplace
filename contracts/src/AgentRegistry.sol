// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAgentRegistry.sol";
import "./libraries/Constants.sol";

/// @title AgentRegistry — Registry for AI agents on the marketplace
/// @notice Manages agent registration, tiers, staking, and job tracking
contract AgentRegistry is IAgentRegistry, Ownable {
    /// @notice Mapping from agent address to their profile
    mapping(address => AgentProfile) private _profiles;
    
    /// @notice Mapping from ERC-8004 identity to agent address
    mapping(bytes32 => address) private _identityToAgent;
    
    /// @notice Address of the JobEscrow contract (set by owner)
    address public jobEscrow;

    /// @dev Modifier to restrict calls to the JobEscrow contract only
    modifier onlyJobEscrow() {
        require(msg.sender == jobEscrow, "AgentRegistry: caller is not JobEscrow");
        _;
    }

    /// @dev Modifier to ensure agent is registered
    modifier onlyRegistered() {
        require(_profiles[msg.sender].agentAddress != address(0), "AgentRegistry: agent not registered");
        _;
    }

    /// @param initialOwner The initial owner of the contract
    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Register a new agent with their ERC-8004 identity
    /// @param erc8004Identity The ERC-8004 identity hash for the agent
    /// @param metadataURI URI pointing to agent metadata (skills, portfolio, etc.)
    /// @dev Requires non-zero identity and that the agent is not already registered
    function registerAgent(bytes32 erc8004Identity, string calldata metadataURI) external override {
        require(erc8004Identity != bytes32(0), "AgentRegistry: invalid identity");
        require(_profiles[msg.sender].agentAddress == address(0), "AgentRegistry: already registered");
        require(_identityToAgent[erc8004Identity] == address(0), "AgentRegistry: identity already claimed");

        _profiles[msg.sender] = AgentProfile({
            agentAddress: msg.sender,
            erc8004Identity: erc8004Identity,
            metadataURI: metadataURI,
            tier: AgentTier.Apprentice,
            isAvailable: false,
            completedJobs: 0,
            disputedJobs: 0,
            currentStake: 0,
            activeJobs: 0,
            registeredAt: block.timestamp
        });
        
        _identityToAgent[erc8004Identity] = msg.sender;
        
        emit AgentRegistered(msg.sender, erc8004Identity);
    }

    /// @notice Update agent's availability status
    /// @param available Whether the agent is available for new jobs
    /// @dev Only registered agents can update their availability
    function updateAvailability(bool available) external override onlyRegistered {
        _profiles[msg.sender].isAvailable = available;
        emit AvailabilityChanged(msg.sender, available);
    }

    /// @notice Stake ETH to improve tier standing
    /// @dev Staked amount adds to current stake balance
    function stakeForTier() external payable override onlyRegistered {
        require(msg.value > 0, "AgentRegistry: stake amount must be greater than 0");
        
        _profiles[msg.sender].currentStake += msg.value;
        
        emit StakeDeposited(msg.sender, msg.value);
    }

    /// @notice Withdraw staked ETH
    /// @param amount The amount of stake to withdraw
    /// @dev Reverts if agent has insufficient stake
    function unstake(uint256 amount) external override onlyRegistered {
        AgentProfile storage profile = _profiles[msg.sender];
        require(profile.currentStake >= amount, "AgentRegistry: insufficient stake");
        require(amount > 0, "AgentRegistry: amount must be greater than 0");
        
        profile.currentStake -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "AgentRegistry: transfer failed");
        
        emit StakeWithdrawn(msg.sender, amount);
    }

    /// @notice Record a job completion for an agent
    /// @param agent The address of the agent who completed the job
    /// @param hadDispute Whether the job had a dispute
    /// @dev Only callable by the JobEscrow contract
    function recordJobCompletion(address agent, bool hadDispute) external override onlyJobEscrow {
        require(_profiles[agent].agentAddress != address(0), "AgentRegistry: agent not registered");
        
        AgentProfile storage profile = _profiles[agent];
        profile.completedJobs += 1;
        
        if (hadDispute) {
            profile.disputedJobs += 1;
        }
        
        _checkAndPromote(agent);
    }

    /// @notice Increment the active job count for an agent
    /// @param agent The address of the agent
    /// @dev Only callable by the JobEscrow contract, enforces max active jobs limit
    function incrementActiveJobs(address agent) external override onlyJobEscrow {
        require(_profiles[agent].agentAddress != address(0), "AgentRegistry: agent not registered");
        
        AgentProfile storage profile = _profiles[agent];
        require(profile.activeJobs < Constants.MAX_ACTIVE_JOBS, "AgentRegistry: max active jobs reached");
        
        profile.activeJobs += 1;
    }

    /// @notice Decrement the active job count for an agent
    /// @param agent The address of the agent
    /// @dev Only callable by the JobEscrow contract
    function decrementActiveJobs(address agent) external override onlyJobEscrow {
        require(_profiles[agent].agentAddress != address(0), "AgentRegistry: agent not registered");
        require(_profiles[agent].activeJobs > 0, "AgentRegistry: no active jobs to decrement");
        
        _profiles[agent].activeJobs -= 1;
    }

    /// @notice Internal function to check and promote agent tier
    /// @param agent The address of the agent to check
    /// @dev Auto-promotes: >=3 completed -> Proven, >=10 completed -> Expert
    function _checkAndPromote(address agent) internal {
        AgentProfile storage profile = _profiles[agent];
        
        if (profile.completedJobs >= Constants.TIER_EXPERT_THRESHOLD && profile.tier != AgentTier.Expert) {
            profile.tier = AgentTier.Expert;
            emit TierPromoted(agent, AgentTier.Expert);
        } else if (profile.completedJobs >= Constants.TIER_PROVEN_THRESHOLD && profile.tier == AgentTier.Apprentice) {
            profile.tier = AgentTier.Proven;
            emit TierPromoted(agent, AgentTier.Proven);
        }
    }

    /// @notice Get the full profile of an agent
    /// @param agent The address of the agent
    /// @return The agent's profile struct
    function getAgentProfile(address agent) external view override returns (AgentProfile memory) {
        return _profiles[agent];
    }

    /// @notice Check if an agent is registered
    /// @param agent The address to check
    /// @return True if the agent is registered
    function isRegistered(address agent) external view override returns (bool) {
        return _profiles[agent].agentAddress != address(0);
    }

    /// @notice Get the tier of an agent
    /// @param agent The address of the agent
    /// @return The agent's current tier
    function getAgentTier(address agent) external view override returns (AgentTier) {
        return _profiles[agent].tier;
    }

    /// @notice Get the number of active jobs for an agent
    /// @param agent The address of the agent
    /// @return The number of active jobs
    function getActiveJobs(address agent) external view override returns (uint256) {
        return _profiles[agent].activeJobs;
    }

    /// @notice Set the JobEscrow contract address
    /// @param _jobEscrow The address of the JobEscrow contract
    /// @dev Only callable by the contract owner
    function setJobEscrow(address _jobEscrow) external onlyOwner {
        require(_jobEscrow != address(0), "AgentRegistry: invalid address");
        jobEscrow = _jobEscrow;
    }
}
