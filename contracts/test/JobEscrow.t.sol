// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestSetup.sol";

contract JobEscrowTest is TestSetup {
    // ── Job Creation ──

    function test_createJob_success() public {
        bytes32 jobId = _createJob(1 ether, 7 days);
        IJobEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(job.buyer, buyer);
        assertEq(job.escrowAmount, 1 ether);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Open));
        assertTrue(job.deadline > block.timestamp);
    }

    function test_createJob_revert_zeroValue() public {
        vm.prank(buyer);
        vm.expectRevert("JobEscrow: escrow amount must be greater than 0");
        escrow.createJob{value: 0}("Task", block.timestamp + 1 days);
    }

    function test_createJob_revert_pastDeadline() public {
        vm.prank(buyer);
        vm.expectRevert("JobEscrow: deadline must be in the future");
        escrow.createJob{value: 1 ether}("Task", block.timestamp - 1);
    }

    function test_createJob_revert_emptyDescription() public {
        vm.prank(buyer);
        vm.expectRevert("JobEscrow: task description required");
        escrow.createJob{value: 1 ether}("", block.timestamp + 1 days);
    }

    // ── Agent Assignment ──

    function test_assignAgent_success() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);

        vm.prank(buyer);
        escrow.assignAgent(jobId, agent1);

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.agent, agent1);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Assigned));
        assertEq(registry.getActiveJobs(agent1), 1);
    }

    function test_assignAgent_revert_notBuyer() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);

        vm.prank(randomUser);
        vm.expectRevert("JobEscrow: caller is not buyer");
        escrow.assignAgent(jobId, agent1);
    }

    function test_assignAgent_revert_notRegistered() public {
        bytes32 jobId = _createJob(1 ether, 7 days);
        vm.prank(buyer);
        vm.expectRevert("JobEscrow: agent not registered");
        escrow.assignAgent(jobId, randomUser);
    }

    function test_assignAgent_revert_notAvailable() public {
        vm.prank(agent1);
        registry.registerAgent(IDENTITY_1, "ipfs://metadata");
        // NOT setting availability

        bytes32 jobId = _createJob(1 ether, 7 days);
        vm.prank(buyer);
        vm.expectRevert("JobEscrow: agent not available");
        escrow.assignAgent(jobId, agent1);
    }

    // ── Agent Accept ──

    function test_agentAccept_success() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);

        vm.prank(buyer);
        escrow.assignAgent(jobId, agent1);

        uint256 stakeRequired = (1 ether * Constants.AGENT_STAKE_BPS) / Constants.BPS_DENOMINATOR;
        vm.prank(agent1);
        escrow.agentAccept{value: stakeRequired}(jobId);

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.InProgress));
        assertEq(job.stakeAmount, stakeRequired);
    }

    function test_agentAccept_revert_wrongStake() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        vm.prank(buyer);
        escrow.assignAgent(jobId, agent1);

        vm.prank(agent1);
        vm.expectRevert("JobEscrow: incorrect stake amount");
        escrow.agentAccept{value: 0.05 ether}(jobId);
    }

    // ── Submit Deliverable ──

    function test_submitDeliverable_success() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);

        vm.prank(agent1);
        escrow.submitDeliverable(jobId, "ipfs://result");

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Delivered));
        assertEq(job.deliverableURI, "ipfs://result");
        assertTrue(job.deliveredAt > 0);
    }

    function test_submitDeliverable_revert_notAgent() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);

        vm.prank(buyer);
        vm.expectRevert("JobEscrow: caller is not agent");
        escrow.submitDeliverable(jobId, "ipfs://result");
    }

    // ── Confirm Delivery ──

    function test_confirmDelivery_success() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        uint256 agentBalBefore = agent1.balance;
        uint256 treasuryBalBefore = treasury.balance;

        vm.prank(buyer);
        escrow.confirmDelivery(jobId);

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Complete));

        // Fee math: 2.5% to treasury, rest + stake to agent
        uint256 platformFee = (1 ether * Constants.PLATFORM_FEE_BPS) / Constants.BPS_DENOMINATOR;
        uint256 agentPayout = 1 ether - platformFee;
        uint256 stakeAmount = (1 ether * Constants.AGENT_STAKE_BPS) / Constants.BPS_DENOMINATOR;

        assertEq(treasury.balance - treasuryBalBefore, platformFee);
        assertEq(agent1.balance - agentBalBefore, agentPayout + stakeAmount);

        // Agent job stats updated
        assertEq(registry.getAgentProfile(agent1).completedJobs, 1);
        assertEq(registry.getActiveJobs(agent1), 0);
    }

    function test_confirmDelivery_revert_notBuyer() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        vm.prank(randomUser);
        vm.expectRevert("JobEscrow: caller is not buyer");
        escrow.confirmDelivery(jobId);
    }

    // ── Auto-Release ──

    function test_autoRelease_partial() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        // Warp past 72h
        vm.warp(block.timestamp + 72 hours + 1);

        uint256 agentBalBefore = agent1.balance;
        escrow.initiateAutoRelease(jobId);

        uint256 expectedPartial = (1 ether * Constants.AUTO_RELEASE_AGENT_PCT) / 100;
        assertEq(agent1.balance - agentBalBefore, expectedPartial);

        // Job should still be Delivered (partial release)
        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Delivered));
    }

    function test_autoRelease_full() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        // Warp past 96h
        vm.warp(block.timestamp + 96 hours + 1);

        vm.prank(randomUser);
        escrow.initiateAutoRelease(jobId);

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Complete));
        assertEq(registry.getAgentProfile(agent1).completedJobs, 1);
    }

    function test_autoRelease_revert_tooEarly() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        vm.expectRevert("JobEscrow: auto-release not yet available");
        escrow.initiateAutoRelease(jobId);
    }

    // ── File Dispute ──

    function test_fileDispute_success() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        vm.prank(buyer);
        escrow.fileDispute{value: Constants.DISPUTE_STAKE}(jobId);

        IJobEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(IJobEscrow.JobStatus.Disputed));
    }

    function test_fileDispute_revert_insufficientStake() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);
        _submitDeliverable(jobId, agent1);

        vm.prank(buyer);
        vm.expectRevert("JobEscrow: insufficient dispute stake");
        escrow.fileDispute{value: 0.005 ether}(jobId);
    }

    // ── Cancel Job ──

    function test_cancelJob_open() public {
        bytes32 jobId = _createJob(1 ether, 7 days);
        uint256 balBefore = buyer.balance;

        vm.prank(buyer);
        escrow.cancelJob(jobId);

        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Cancelled));
        assertEq(buyer.balance - balBefore, 1 ether);
    }

    function test_cancelJob_assigned() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        vm.prank(buyer);
        escrow.assignAgent(jobId, agent1);

        vm.prank(buyer);
        escrow.cancelJob(jobId);

        assertEq(uint8(escrow.getJob(jobId).status), uint8(IJobEscrow.JobStatus.Cancelled));
        assertEq(registry.getActiveJobs(agent1), 0);
    }

    function test_cancelJob_revert_inProgress() public {
        _registerAgent(agent1, IDENTITY_1);
        bytes32 jobId = _createJob(1 ether, 7 days);
        _assignAndAccept(jobId, agent1);

        vm.prank(buyer);
        vm.expectRevert("JobEscrow: cannot cancel job in current status");
        escrow.cancelJob(jobId);
    }
}
