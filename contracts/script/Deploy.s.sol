// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { AgentRegistry } from "../src/AgentRegistry.sol";
import { JobEscrow } from "../src/JobEscrow.sol";

/// @title Deploy — Deploys all contracts for Agent Work Marketplace
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address owner = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        AgentRegistry registry = new AgentRegistry(owner);
        console.log("AgentRegistry deployed at:", address(registry));

        JobEscrow escrow = new JobEscrow(address(registry), treasury, owner);
        console.log("JobEscrow deployed at:", address(escrow));

        registry.setJobEscrow(address(escrow));
        console.log("JobEscrow set on AgentRegistry");

        vm.stopBroadcast();
    }
}
