// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Constants — Platform-wide constants for Agent Work Marketplace
library Constants {
    /// @notice Platform fee in basis points (2.5%)
    uint256 internal constant PLATFORM_FEE_BPS = 250;

    /// @notice Basis points denominator
    uint256 internal constant BPS_DENOMINATOR = 10_000;

    /// @notice Auto-release delay after deliverable submission (72 hours)
    uint256 internal constant AUTO_RELEASE_DELAY = 72 hours;

    /// @notice Full auto-release delay (96 hours)
    uint256 internal constant FULL_RELEASE_DELAY = 96 hours;

    /// @notice Percentage to agent on first auto-release (70%)
    uint256 internal constant AUTO_RELEASE_AGENT_PCT = 70;

    /// @notice Dispute filing stake
    uint256 internal constant DISPUTE_STAKE = 0.01 ether;

    /// @notice Maximum active jobs per agent
    uint256 internal constant MAX_ACTIVE_JOBS = 3;

    /// @notice Completed jobs required for Proven tier
    uint256 internal constant TIER_PROVEN_THRESHOLD = 3;

    /// @notice Completed jobs required for Expert tier
    uint256 internal constant TIER_EXPERT_THRESHOLD = 10;

    /// @notice Top percentile required for Expert tier (25%)
    uint256 internal constant TIER_EXPERT_PERCENTILE = 25;

    /// @notice Minimum job price for Proven tier
    uint256 internal constant PROVEN_MIN_PRICE = 0.04 ether;

    /// @notice Minimum job price for Expert tier
    uint256 internal constant EXPERT_MIN_PRICE = 0.08 ether;

    /// @notice Agent stake percentage of job value (10%)
    uint256 internal constant AGENT_STAKE_BPS = 1_000;

    /// @notice EAS contract address on Base
    address internal constant EAS_CONTRACT = 0x4200000000000000000000000000000000000021;
}
