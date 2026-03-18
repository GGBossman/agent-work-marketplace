// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuardTransient } from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import { IJobEscrow } from "./interfaces/IJobEscrow.sol";
import { IAgentRegistry } from "./interfaces/IAgentRegistry.sol";
import { Constants } from "./libraries/Constants.sol";

/// @title JobEscrow — Escrow factory with job mappings
/// @notice Manages job lifecycle: create, assign, deliver, confirm, dispute, cancel
contract JobEscrow is IJobEscrow, ReentrancyGuardTransient, Ownable {
    // Stub — full implementation in Phase 1
    IAgentRegistry public agentRegistry;
    address public treasury;
    uint256 private _jobNonce;
    mapping(bytes32 => Job) private _jobs;

    constructor(address _agentRegistry, address _treasury, address _owner) Ownable(_owner) {
        agentRegistry = IAgentRegistry(_agentRegistry);
        treasury = _treasury;
    }

    function createJob(string calldata taskDescription, uint256 deadline) external payable returns (bytes32 jobId) {}
    function assignAgent(bytes32 jobId, address agent) external {}
    function agentAccept(bytes32 jobId) external payable {}
    function submitDeliverable(bytes32 jobId, string calldata deliverableURI) external {}
    function confirmDelivery(bytes32 jobId) external {}
    function initiateAutoRelease(bytes32 jobId) external {}
    function fileDispute(bytes32 jobId) external payable {}
    function cancelJob(bytes32 jobId) external {}
    function getJob(bytes32 jobId) external view returns (Job memory) { return _jobs[jobId]; }
}
