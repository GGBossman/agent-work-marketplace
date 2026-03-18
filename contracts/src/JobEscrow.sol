// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IJobEscrow.sol";
import "./interfaces/IAgentRegistry.sol";
import "./libraries/Constants.sol";

/// @title JobEscrow — Escrow contract for AI agent jobs
/// @notice Handles job creation, assignment, delivery, and payment distribution
contract JobEscrow is IJobEscrow, ReentrancyGuardTransient, Ownable {
    /// @notice The agent registry contract
    IAgentRegistry public immutable agentRegistry;
    
    /// @notice The treasury address that receives platform fees
    address public treasury;
    
    /// @notice Counter for generating unique job IDs
    uint256 private _jobNonce;
    
    /// @notice Mapping from job ID to Job struct
    mapping(bytes32 => Job) private _jobs;

    /// @dev Modifier to ensure caller is the job buyer
    modifier onlyBuyer(bytes32 jobId) {
        require(_jobs[jobId].buyer == msg.sender, "JobEscrow: caller is not buyer");
        _;
    }

    /// @dev Modifier to ensure caller is the assigned agent
    modifier onlyAgent(bytes32 jobId) {
        require(_jobs[jobId].agent == msg.sender, "JobEscrow: caller is not agent");
        _;
    }

    /// @dev Modifier to ensure job exists
    modifier jobExists(bytes32 jobId) {
        require(_jobs[jobId].buyer != address(0), "JobEscrow: job does not exist");
        _;
    }

    /// @param _agentRegistry The address of the AgentRegistry contract
    /// @param _treasury The address that will receive platform fees
    /// @param initialOwner The initial owner of the contract
    constructor(
        address _agentRegistry,
        address _treasury,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_agentRegistry != address(0), "JobEscrow: invalid registry address");
        require(_treasury != address(0), "JobEscrow: invalid treasury address");
        
        agentRegistry = IAgentRegistry(_agentRegistry);
        treasury = _treasury;
    }

    /// @notice Create a new job with escrowed payment
    /// @param taskDescription Description of the task to be completed
    /// @param deadline Unix timestamp by which the task must be completed
    /// @return jobId The unique identifier for the created job
    /// @dev Requires msg.value > 0 and deadline must be in the future
    function createJob(
        string calldata taskDescription,
        uint256 deadline
    ) external payable override returns (bytes32 jobId) {
        require(msg.value > 0, "JobEscrow: escrow amount must be greater than 0");
        require(deadline > block.timestamp, "JobEscrow: deadline must be in the future");
        require(bytes(taskDescription).length > 0, "JobEscrow: task description required");

        jobId = keccak256(abi.encodePacked(msg.sender, _jobNonce++, block.timestamp));
        
        _jobs[jobId] = Job({
            jobId: jobId,
            buyer: msg.sender,
            agent: address(0),
            escrowAmount: msg.value,
            stakeAmount: 0,
            taskDescription: taskDescription,
            status: JobStatus.Open,
            deadline: deadline,
            createdAt: block.timestamp,
            deliveredAt: 0,
            deliverableURI: ""
        });

        emit JobCreated(jobId, msg.sender, msg.value, deadline);
    }

    /// @notice Assign an agent to an open job
    /// @param jobId The ID of the job to assign
    /// @param agent The address of the agent to assign
    /// @dev Only the buyer can assign an agent; agent must be registered and available
    function assignAgent(
        bytes32 jobId,
        address agent
    ) external override jobExists(jobId) onlyBuyer(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Open, "JobEscrow: job not open");
        require(agent != address(0), "JobEscrow: invalid agent address");
        require(agentRegistry.isRegistered(agent), "JobEscrow: agent not registered");
        
        IAgentRegistry.AgentProfile memory profile = agentRegistry.getAgentProfile(agent);
        require(profile.isAvailable, "JobEscrow: agent not available");

        agentRegistry.incrementActiveJobs(agent);
        
        job.agent = agent;
        job.status = JobStatus.Assigned;
        
        emit JobAssigned(jobId, agent);
    }

    /// @notice Agent accepts an assigned job by staking required amount
    /// @param jobId The ID of the job to accept
    /// @dev Only the assigned agent can accept; must stake AGENT_STAKE_BPS of escrow
    function agentAccept(bytes32 jobId) external payable override jobExists(jobId) onlyAgent(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Assigned, "JobEscrow: job not assigned");
        
        uint256 requiredStake = (job.escrowAmount * Constants.AGENT_STAKE_BPS) / Constants.BPS_DENOMINATOR;
        require(msg.value == requiredStake, "JobEscrow: incorrect stake amount");

        job.stakeAmount = msg.value;
        job.status = JobStatus.InProgress;
        
        emit AgentAccepted(jobId, msg.sender, msg.value);
    }

    /// @notice Submit deliverable for a job in progress
    /// @param jobId The ID of the job
    /// @param deliverableURI URI pointing to the deliverable (e.g., IPFS hash)
    /// @dev Only the assigned agent can submit; job must be in progress
    function submitDeliverable(
        bytes32 jobId,
        string calldata deliverableURI
    ) external override jobExists(jobId) onlyAgent(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.InProgress, "JobEscrow: job not in progress");
        require(bytes(deliverableURI).length > 0, "JobEscrow: deliverable URI required");

        job.deliverableURI = deliverableURI;
        job.deliveredAt = block.timestamp;
        job.status = JobStatus.Delivered;
        
        emit DeliverableSubmitted(jobId, deliverableURI);
    }

    /// @notice Buyer confirms delivery and releases payment
    /// @param jobId The ID of the job to confirm
    /// @dev Only the buyer can confirm; calculates and distributes payments
    function confirmDelivery(bytes32 jobId) external nonReentrant jobExists(jobId) onlyBuyer(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Delivered, "JobEscrow: job not delivered");

        uint256 platformFee = (job.escrowAmount * Constants.PLATFORM_FEE_BPS) / Constants.BPS_DENOMINATOR;
        uint256 agentPayout = job.escrowAmount - platformFee;
        
        job.status = JobStatus.Complete;

        agentRegistry.recordJobCompletion(job.agent, false);
        agentRegistry.decrementActiveJobs(job.agent);

        (bool successAgent, ) = payable(job.agent).call{value: agentPayout + job.stakeAmount}("");
        require(successAgent, "JobEscrow: agent payment failed");
        
        (bool successTreasury, ) = payable(treasury).call{value: platformFee}("");
        require(successTreasury, "JobEscrow: treasury payment failed");

        emit DeliveryConfirmed(jobId, agentPayout, platformFee);
    }

    /// @notice Trigger auto-release of funds after delivery timeout
    /// @param jobId The ID of the job
    /// @dev Releases funds to agent if buyer hasn't confirmed within timeout periods
    function initiateAutoRelease(bytes32 jobId) external nonReentrant jobExists(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Delivered, "JobEscrow: job not delivered");
        
        uint256 deliveredAt = job.deliveredAt;
        
        if (block.timestamp >= deliveredAt + Constants.FULL_RELEASE_DELAY) {
            // Full release: remaining escrow + stake to agent
            uint256 platformFee = (job.escrowAmount * Constants.PLATFORM_FEE_BPS) / Constants.BPS_DENOMINATOR;
            uint256 agentPayout = job.escrowAmount - platformFee;
            
            job.status = JobStatus.Complete;
            
            agentRegistry.recordJobCompletion(job.agent, false);
            agentRegistry.decrementActiveJobs(job.agent);

            (bool successAgent, ) = payable(job.agent).call{value: agentPayout + job.stakeAmount}("");
            require(successAgent, "JobEscrow: agent payment failed");
            
            (bool successTreasury, ) = payable(treasury).call{value: platformFee}("");
            require(successTreasury, "JobEscrow: treasury payment failed");

            emit AutoReleaseTriggered(jobId, agentPayout, true);
        } else if (block.timestamp >= deliveredAt + Constants.AUTO_RELEASE_DELAY) {
            // Partial release: 70% of escrow to agent
            uint256 agentPayout = (job.escrowAmount * Constants.AUTO_RELEASE_AGENT_PCT) / 100;
            
            (bool success, ) = payable(job.agent).call{value: agentPayout}("");
            require(success, "JobEscrow: agent payment failed");

            // Reduce escrow amount by released portion
            job.escrowAmount -= agentPayout;
            job.stakeAmount = 0; // Stake is held until full release

            emit AutoReleaseTriggered(jobId, agentPayout, false);
        } else {
            revert("JobEscrow: auto-release not yet available");
        }
    }

    /// @notice File a dispute for a delivered job
    /// @param jobId The ID of the job to dispute
    /// @dev Requires dispute stake; only buyer or agent can file on delivered jobs
    function fileDispute(bytes32 jobId) external payable override jobExists(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Delivered, "JobEscrow: job not delivered");
        require(msg.value >= Constants.DISPUTE_STAKE, "JobEscrow: insufficient dispute stake");
        require(msg.sender == job.buyer || msg.sender == job.agent, "JobEscrow: only buyer or agent can dispute");

        job.status = JobStatus.Disputed;

        emit DisputeFiled(jobId, msg.sender);
    }

    /// @notice Cancel an open or assigned job
    /// @param jobId The ID of the job to cancel
    /// @dev Only the buyer can cancel; refunds escrow and decrements active jobs if assigned
    function cancelJob(bytes32 jobId) external nonReentrant jobExists(jobId) onlyBuyer(jobId) {
        Job storage job = _jobs[jobId];
        require(job.status == JobStatus.Open || job.status == JobStatus.Assigned, "JobEscrow: cannot cancel job in current status");

        if (job.status == JobStatus.Assigned) {
            agentRegistry.decrementActiveJobs(job.agent);
        }

        job.status = JobStatus.Cancelled;

        (bool success, ) = payable(job.buyer).call{value: job.escrowAmount}("");
        require(success, "JobEscrow: refund failed");

        emit JobCancelled(jobId);
    }

    /// @notice Get job details by ID
    /// @param jobId The ID of the job to retrieve
    /// @return The Job struct containing all job data
    function getJob(bytes32 jobId) external view override returns (Job memory) {
        return _jobs[jobId];
    }

    /// @notice Update the treasury address
    /// @param _treasury The new treasury address
    /// @dev Only callable by the contract owner
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "JobEscrow: invalid treasury address");
        treasury = _treasury;
    }
}
