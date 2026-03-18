// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestSetup.sol";

contract AgentRegistryTest is TestSetup {
    // ── Registration ──

    function test_registerAgent_success() public {
        vm.prank(agent1);
        registry.registerAgent(IDENTITY_1, "ipfs://metadata");

        IAgentRegistry.AgentProfile memory profile = registry.getAgentProfile(agent1);
        assertEq(profile.agentAddress, agent1);
        assertEq(profile.erc8004Identity, IDENTITY_1);
        assertEq(uint8(profile.tier), uint8(IAgentRegistry.AgentTier.Apprentice));
        assertFalse(profile.isAvailable);
        assertEq(profile.completedJobs, 0);
        assertTrue(registry.isRegistered(agent1));
    }

    function test_registerAgent_revert_zeroIdentity() public {
        vm.prank(agent1);
        vm.expectRevert("AgentRegistry: invalid identity");
        registry.registerAgent(bytes32(0), "ipfs://metadata");
    }

    function test_registerAgent_revert_alreadyRegistered() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(agent1);
        vm.expectRevert("AgentRegistry: already registered");
        registry.registerAgent(IDENTITY_1, "ipfs://metadata2");
    }

    function test_registerAgent_revert_identityClaimed() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(agent2);
        vm.expectRevert("AgentRegistry: identity already claimed");
        registry.registerAgent(IDENTITY_1, "ipfs://metadata2");
    }

    // ── Availability ──

    function test_updateAvailability() public {
        _registerAgent(agent1, IDENTITY_1);
        assertTrue(registry.getAgentProfile(agent1).isAvailable);

        vm.prank(agent1);
        registry.updateAvailability(false);
        assertFalse(registry.getAgentProfile(agent1).isAvailable);
    }

    function test_updateAvailability_revert_notRegistered() public {
        vm.prank(randomUser);
        vm.expectRevert("AgentRegistry: agent not registered");
        registry.updateAvailability(true);
    }

    // ── Staking ──

    function test_stakeForTier() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(agent1);
        registry.stakeForTier{value: 1 ether}();
        assertEq(registry.getAgentProfile(agent1).currentStake, 1 ether);
    }

    function test_unstake() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(agent1);
        registry.stakeForTier{value: 2 ether}();

        uint256 balBefore = agent1.balance;
        vm.prank(agent1);
        registry.unstake(1 ether);
        assertEq(registry.getAgentProfile(agent1).currentStake, 1 ether);
        assertEq(agent1.balance, balBefore + 1 ether);
    }

    function test_unstake_revert_insufficient() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(agent1);
        vm.expectRevert("AgentRegistry: insufficient stake");
        registry.unstake(1 ether);
    }

    // ── Tier Promotion ──

    function test_tierPromotion_proven() public {
        _registerAgent(agent1, IDENTITY_1);
        assertEq(uint8(registry.getAgentTier(agent1)), uint8(IAgentRegistry.AgentTier.Apprentice));

        // Complete 3 jobs to reach Proven
        for (uint256 i = 0; i < 3; i++) {
            vm.prank(address(escrow));
            registry.recordJobCompletion(agent1, false);
        }
        assertEq(uint8(registry.getAgentTier(agent1)), uint8(IAgentRegistry.AgentTier.Proven));
    }

    function test_tierPromotion_expert() public {
        _registerAgent(agent1, IDENTITY_1);

        // Complete 10 jobs to reach Expert
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(address(escrow));
            registry.recordJobCompletion(agent1, false);
        }
        assertEq(uint8(registry.getAgentTier(agent1)), uint8(IAgentRegistry.AgentTier.Expert));
    }

    // ── Access Control ──

    function test_recordJobCompletion_revert_notEscrow() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(randomUser);
        vm.expectRevert("AgentRegistry: caller is not JobEscrow");
        registry.recordJobCompletion(agent1, false);
    }

    function test_incrementActiveJobs_enforceMax() public {
        _registerAgent(agent1, IDENTITY_1);

        for (uint256 i = 0; i < Constants.MAX_ACTIVE_JOBS; i++) {
            vm.prank(address(escrow));
            registry.incrementActiveJobs(agent1);
        }
        assertEq(registry.getActiveJobs(agent1), Constants.MAX_ACTIVE_JOBS);

        vm.prank(address(escrow));
        vm.expectRevert("AgentRegistry: max active jobs reached");
        registry.incrementActiveJobs(agent1);
    }

    function test_decrementActiveJobs() public {
        _registerAgent(agent1, IDENTITY_1);
        vm.prank(address(escrow));
        registry.incrementActiveJobs(agent1);
        vm.prank(address(escrow));
        registry.decrementActiveJobs(agent1);
        assertEq(registry.getActiveJobs(agent1), 0);
    }
}
