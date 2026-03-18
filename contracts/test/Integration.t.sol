// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestSetup.sol";

contract IntegrationTest is TestSetup {
    /// @dev Full job lifecycle: create → assign → accept → deliver → confirm
    function test_fullJobLifecycle() public {
        _registerAgent(agent1, IDENTITY_1);

        // Create job
        bytes32 jobId = _createJob(1 ether, 7 days);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Open));

        // Assign
        vm.prank(buyer);
        escrow.assignAgent(jobId, agent1);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Assigned));

        // Accept
        uint256 stakeRequired = (1 ether * Constants.AGENT_STAKE_BPS) / Constants.BPS_DENOMINATOR;
        vm.prank(agent1);
        escrow.agentAccept{value: stakeRequired}(jobId);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.InProgress));

        // Submit deliverable
        vm.prank(agent1);
        escrow.submitDeliverable(jobId, "ipfs://final-result");
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Delivered));

        // Confirm delivery
        vm.prank(buyer);
        escrow.confirmDelivery(jobId);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Complete));

        // Verify agent stats
        IAgentRegistry.AgentProfile memory profile = registry.getAgentProfile(agent1);
        assertEq(profile.completedJobs, 1);
        assertEq(profile.activeJobs, 0);
    }

    /// @dev Multiple jobs lead to tier promotion
    function test_multipleJobs_tierPromotion() public {
        _registerAgent(agent1, IDENTITY_1);

        // Complete 3 jobs → Proven
        for (uint256 i = 0; i < 3; i++) {
            bytes32 jobId = _createJob(0.5 ether, 7 days);
            _assignAndAccept(jobId, agent1);
            _submitDeliverable(jobId, agent1);
            vm.prank(buyer);
            escrow.confirmDelivery(jobId);
        }
        assertEq(uint8(registry.getAgentTier(agent1)), uint8(IAgentRegistry.AgentTier.Proven));

        // Complete 7 more → Expert (total 10)
        for (uint256 i = 0; i < 7; i++) {
            bytes32 jobId = _createJob(0.5 ether, 7 days);
            _assignAndAccept(jobId, agent1);
            _submitDeliverable(jobId, agent1);
            vm.prank(buyer);
            escrow.confirmDelivery(jobId);
        }
        assertEq(uint8(registry.getAgentTier(agent1)), uint8(IAgentRegistry.AgentTier.Expert));
    }

    /// @dev Max active jobs enforcement
    function test_maxActiveJobs_enforcement() public {
        _registerAgent(agent1, IDENTITY_1);

        bytes32[] memory jobIds = new bytes32[](3);
        for (uint256 i = 0; i < 3; i++) {
            jobIds[i] = _createJob(0.5 ether, 7 days);
            _assignAndAccept(jobIds[i], agent1);
        }

        assertEq(registry.getActiveJobs(agent1), 3);

        // 4th job should fail at assign
        bytes32 extraJob = _createJob(0.5 ether, 7 days);
        vm.prank(buyer);
        vm.expectRevert("AgentRegistry: max active jobs reached");
        escrow.assignAgent(extraJob, agent1);
    }

    /// @dev Cancel then re-create flow
    function test_cancelAndRecreate() public {
        _registerAgent(agent1, IDENTITY_1);

        bytes32 jobId1 = _createJob(1 ether, 7 days);
        vm.prank(buyer);
        escrow.assignAgent(jobId1, agent1);
        vm.prank(buyer);
        escrow.cancelJob(jobId1);

        assertEq(registry.getActiveJobs(agent1), 0);

        // Can create and assign again
        bytes32 jobId2 = _createJob(0.5 ether, 7 days);
        vm.prank(buyer);
        escrow.assignAgent(jobId2, agent1);
        assertEq(registry.getActiveJobs(agent1), 1);
    }

    /// @dev Auto-release full after 96h
    function test_autoRelease_fullLifecycle() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        // Warp 96h
        vm.warp(block.timestamp + 96 hours + 1);

        uint256 agentBal = agent1.balance;
        uint256 treasuryBal = treasury.balance;

        escrow.initiateAutoRelease(jobId);

        // Agent and treasury should have received funds
        assertTrue(agent1.balance > agentBal);
        assertTrue(treasury.balance > treasuryBal);
        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Complete));
    }
}
