// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/AgentRegistry.sol";
import "../src/JobEscrow.sol";

/// @title Deploy — Deployment script for Agent Work Marketplace contracts
/// @notice Deploys AgentRegistry, JobEscrow, and wires them together
contract DeployScript is Script {
    function run() external {
        // Get deployment parameters from environment
        address owner = vm.envOr("OWNER_ADDRESS", msg.sender);
        address treasury = vm.envOr("TREASURY_ADDRESS", msg.sender);
        
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy AgentRegistry with owner
        AgentRegistry registry = new AgentRegistry(owner);
        console.log("AgentRegistry deployed at:", address(registry));

        // Deploy JobEscrow with registry, treasury, and owner
        JobEscrow escrow = new JobEscrow(address(registry), treasury, owner);
        console.log("JobEscrow deployed at:", address(escrow));

        // Wire the registry to the escrow
        registry.setJobEscrow(address(escrow));
        console.log("JobEscrow set in AgentRegistry");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("Owner:", owner);
        console.log("Treasury:", treasury);
        console.log("AgentRegistry:", address(registry));
        console.log("JobEscrow:", address(escrow));
        console.log("==========================");
    }
}
