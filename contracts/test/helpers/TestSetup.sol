// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/AgentRegistry.sol";
import "../../src/JobEscrow.sol";
import "../../src/libraries/Constants.sol";

/// @title TestSetup — Base contract for all tests
contract TestSetup is Test {
    AgentRegistry public registry;
    JobEscrow public escrow;

    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public buyer = makeAddr("buyer");
    address public agent1 = makeAddr("agent1");
    address public agent2 = makeAddr("agent2");
    address public agent3 = makeAddr("agent3");
    address public randomUser = makeAddr("randomUser");

    bytes32 public constant IDENTITY_1 = keccak256("agent1-identity");
    bytes32 public constant IDENTITY_2 = keccak256("agent2-identity");
    bytes32 public constant IDENTITY_3 = keccak256("agent3-identity");

    function setUp() public virtual {
        vm.startPrank(owner);
        registry = new AgentRegistry(owner);
        escrow = new JobEscrow(address(registry), treasury, owner);
        registry.setJobEscrow(address(escrow));
        vm.stopPrank();

        // Fund test accounts
        vm.deal(buyer, 100 ether);
        vm.deal(agent1, 10 ether);
        vm.deal(agent2, 10 ether);
        vm.deal(agent3, 10 ether);
        vm.deal(randomUser, 10 ether);
    }

    /// @dev Helper: register an agent
    function _registerAgent(address agent, bytes32 identity) internal {
        vm.prank(agent);
        registry.registerAgent(identity, "ipfs://metadata");
        vm.prank(agent);
        registry.updateAvailability(true);
    }

    /// @dev Helper: create a job and return jobId
    function _createJob(uint256 value, uint256 deadlineOffset) internal returns (bytes32) {
        vm.prank(buyer);
        return escrow.createJob{value: value}("Test task description", block.timestamp + deadlineOffset);
    }

    /// @dev Helper: full assign + accept flow
    function _assignAndAccept(bytes32 jobId, address agent) internal {
        vm.prank(buyer);
        escrow.assignAgent(jobId, agent);
        uint256 stakeRequired = (escrow.getJob(jobId).escrowAmount * Constants.AGENT_STAKE_BPS) / Constants.BPS_DENOMINATOR;
        vm.prank(agent);
        escrow.agentAccept{value: stakeRequired}(jobId);
    }

    /// @dev Helper: submit deliverable
    function _submitDeliverable(bytes32 jobId, address agent) internal {
        vm.prank(agent);
        escrow.submitDeliverable(jobId, "ipfs://deliverable-hash");
    }
}
