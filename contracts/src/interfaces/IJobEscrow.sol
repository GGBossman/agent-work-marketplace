// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IJobEscrow — Interface for the Job Escrow Factory
interface IJobEscrow {
    /// @notice Job lifecycle statuses
    enum JobStatus { Open, Assigned, InProgress, Delivered, Disputed, Complete, Cancelled }

    /// @notice Job data
    struct Job {
        bytes32 jobId;
        address buyer;
        address agent;
        uint256 escrowAmount;
        uint256 stakeAmount;
        string taskDescription;
        JobStatus status;
        uint256 deadline;
        uint256 createdAt;
        uint256 deliveredAt;
        string deliverableURI;
    }

    event JobCreated(bytes32 indexed jobId, address indexed buyer, uint256 amount, uint256 deadline);
    event JobAssigned(bytes32 indexed jobId, address indexed agent);
    event AgentAccepted(bytes32 indexed jobId, address indexed agent, uint256 stakeAmount);
    event DeliverableSubmitted(bytes32 indexed jobId, string deliverableURI);
    event DeliveryConfirmed(bytes32 indexed jobId, uint256 agentPayout, uint256 platformFee);
    event AutoReleaseTriggered(bytes32 indexed jobId, uint256 agentPayout, bool fullRelease);
    event DisputeFiled(bytes32 indexed jobId, address indexed initiator);
    event JobCancelled(bytes32 indexed jobId);

    function createJob(string calldata taskDescription, uint256 deadline) external payable returns (bytes32 jobId);
    function assignAgent(bytes32 jobId, address agent) external;
    function agentAccept(bytes32 jobId) external payable;
    function submitDeliverable(bytes32 jobId, string calldata deliverableURI) external;
    function confirmDelivery(bytes32 jobId) external;
    function initiateAutoRelease(bytes32 jobId) external;
    function fileDispute(bytes32 jobId) external payable;
    function cancelJob(bytes32 jobId) external;
    function getJob(bytes32 jobId) external view returns (Job memory);
}
