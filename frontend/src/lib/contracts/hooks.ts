// Contract interaction layer — real on-chain + mock fallback
// Uses @wagmi/core vanilla JS actions (NOT wagmi React hooks)

import { readContract, writeContract, waitForTransactionReceipt, getAccount, getPublicClient } from '@wagmi/core';
import type { Agent, Job } from '$lib/types';
import { AgentTier, JobStatus } from '$lib/types';
import { notify } from '$lib/stores/notifications.svelte';
import { JOB_ESCROW_ABI, AGENT_REGISTRY_ABI } from './abis';
import { getAddresses, CHAIN_IDS } from './addresses';
import { config } from './config';
import { createPublicClient, http, parseEventLogs, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// Direct public client for reads — doesn't depend on WalletConnect relay
const directClient = createPublicClient({
	chain: baseSepolia,
	transport: http('https://sepolia.base.org')
});

// Deployment block for AgentRegistry/JobEscrow on Base Sepolia
// Base Sepolia RPC limits eth_getLogs to 10,000 block range
const DEPLOY_BLOCK = 39041500n;

// Deployment block for AgentRegistry/JobEscrow on Base Sepolia
// Base Sepolia RPC limits eth_getLogs to 10,000 block range
const DEPLOY_BLOCK = 39041500n;

// ═══════════════════════════════════════════════
// Toggle: set false for real contract interactions
// ═══════════════════════════════════════════════
const USE_MOCK = false;

// Default chainId for reads (Base Sepolia)
const DEFAULT_CHAIN_ID = CHAIN_IDS.BASE_SEPOLIA;

function getChainId(): number {
	const account = getAccount(config);
	return account.chainId ?? DEFAULT_CHAIN_ID;
}

// ═══════════════════════════════════════════════
// READ: Fetch agents from on-chain events
// ═══════════════════════════════════════════════

export async function fetchAgents(): Promise<Agent[]> {
	if (USE_MOCK) return getMockAgents();

	try {
		const addresses = getAddresses(DEFAULT_CHAIN_ID);

		// Query AgentRegistered events from genesis using direct client
		const logs = await directClient.getLogs({
			address: addresses.agentRegistry,
			event: {
				type: 'event',
				name: 'AgentRegistered',
				inputs: [
					{ name: 'agent', type: 'address', indexed: true },
					{ name: 'identity', type: 'bytes32', indexed: true }
				]
			},
			fromBlock: DEPLOY_BLOCK,
			toBlock: 'latest'
		});

		if (logs.length === 0) return [];

		// Fetch profiles for each registered agent
		const agents: Agent[] = [];
		for (const log of logs) {
			const agentAddr = log.args.agent;
			if (!agentAddr) continue;

			try {
				const profile = await readContract(config, {
					address: addresses.agentRegistry,
					abi: AGENT_REGISTRY_ABI,
					functionName: 'getAgentProfile',
					args: [agentAddr],
					chainId: DEFAULT_CHAIN_ID
				}) as {
					agentAddress: `0x${string}`;
					erc8004Identity: `0x${string}`;
					metadataURI: string;
					tier: number;
					isAvailable: boolean;
					completedJobs: bigint;
					disputedJobs: bigint;
					currentStake: bigint;
					activeJobs: bigint;
					registeredAt: bigint;
				};

				agents.push({
					address: profile.agentAddress,
					erc8004Identity: profile.erc8004Identity,
					metadataURI: profile.metadataURI,
					tier: profile.tier as AgentTier,
					isAvailable: profile.isAvailable,
					completedJobs: Number(profile.completedJobs),
					disputedJobs: Number(profile.disputedJobs),
					currentStake: profile.currentStake,
					activeJobs: Number(profile.activeJobs),
					registeredAt: Number(profile.registeredAt),
					name: `Agent ${agentAddr.slice(0, 8)}`,
					skills: [],
					reputation: Number(profile.completedJobs) > 0
						? Math.min(100, 60 + Number(profile.completedJobs) * 4 - Number(profile.disputedJobs) * 10)
						: 0
				});
			} catch (err) {
				console.warn(`Failed to fetch profile for ${agentAddr}:`, err);
			}
		}

		return agents;
	} catch (err) {
		console.error('fetchAgents error:', err);
		return [];
	}
}

export async function fetchAgent(address: string): Promise<Agent | null> {
	if (USE_MOCK) {
		const agents = getMockAgents();
		return agents.find(a => a.address.toLowerCase() === address.toLowerCase()) ?? null;
	}

	try {
		const addresses = getAddresses(DEFAULT_CHAIN_ID);
		const profile = await readContract(config, {
			address: addresses.agentRegistry,
			abi: AGENT_REGISTRY_ABI,
			functionName: 'getAgentProfile',
			args: [address as `0x${string}`],
			chainId: DEFAULT_CHAIN_ID
		}) as {
			agentAddress: `0x${string}`;
			erc8004Identity: `0x${string}`;
			metadataURI: string;
			tier: number;
			isAvailable: boolean;
			completedJobs: bigint;
			disputedJobs: bigint;
			currentStake: bigint;
			activeJobs: bigint;
			registeredAt: bigint;
		};

		if (profile.agentAddress === '0x0000000000000000000000000000000000000000') {
			return null;
		}

		return {
			address: profile.agentAddress,
			erc8004Identity: profile.erc8004Identity,
			metadataURI: profile.metadataURI,
			tier: profile.tier as AgentTier,
			isAvailable: profile.isAvailable,
			completedJobs: Number(profile.completedJobs),
			disputedJobs: Number(profile.disputedJobs),
			currentStake: profile.currentStake,
			activeJobs: Number(profile.activeJobs),
			registeredAt: Number(profile.registeredAt),
			name: `Agent ${address.slice(0, 8)}`,
			skills: [],
			reputation: Number(profile.completedJobs) > 0
				? Math.min(100, 60 + Number(profile.completedJobs) * 4 - Number(profile.disputedJobs) * 10)
				: 0
		};
	} catch (err) {
		console.error('fetchAgent error:', err);
		return null;
	}
}

// ═══════════════════════════════════════════════
// READ: Fetch jobs from on-chain events
// ═══════════════════════════════════════════════

export async function fetchJobs(): Promise<Job[]> {
	if (USE_MOCK) return getMockJobs();

	try {
		const addresses = getAddresses(DEFAULT_CHAIN_ID);

		// Query JobCreated events using direct client
		const logs = await directClient.getLogs({
			address: addresses.jobEscrow,
			event: {
				type: 'event',
				name: 'JobCreated',
				inputs: [
					{ name: 'jobId', type: 'bytes32', indexed: true },
					{ name: 'buyer', type: 'address', indexed: true },
					{ name: 'amount', type: 'uint256', indexed: false },
					{ name: 'deadline', type: 'uint256', indexed: false }
				]
			},
			fromBlock: DEPLOY_BLOCK,
			toBlock: 'latest'
		});

		if (logs.length === 0) return [];

		// Fetch current state of each job
		const jobs: Job[] = [];
		for (const log of logs) {
			const jobId = log.args.jobId;
			if (!jobId) continue;

			try {
				const result = await readContract(config, {
					address: addresses.jobEscrow,
					abi: JOB_ESCROW_ABI,
					functionName: 'getJob',
					args: [jobId],
					chainId: DEFAULT_CHAIN_ID
				}) as {
					jobId: `0x${string}`;
					buyer: `0x${string}`;
					agent: `0x${string}`;
					escrowAmount: bigint;
					stakeAmount: bigint;
					taskDescription: string;
					status: number;
					deadline: bigint;
					createdAt: bigint;
					deliveredAt: bigint;
					deliverableURI: string;
				};

				jobs.push({
					jobId: result.jobId,
					buyer: result.buyer,
					agent: result.agent,
					escrowAmount: result.escrowAmount,
					stakeAmount: result.stakeAmount,
					taskDescription: result.taskDescription,
					status: result.status as JobStatus,
					deadline: Number(result.deadline),
					createdAt: Number(result.createdAt),
					deliveredAt: Number(result.deliveredAt),
					deliverableURI: result.deliverableURI
				});
			} catch (err) {
				console.warn(`Failed to fetch job ${jobId}:`, err);
			}
		}

		return jobs;
	} catch (err) {
		console.error('fetchJobs error:', err);
		return [];
	}
}

export async function fetchJob(jobId: string): Promise<Job | null> {
	if (USE_MOCK) {
		const jobs = getMockJobs();
		return jobs.find(j => j.jobId === jobId) ?? null;
	}

	try {
		const addresses = getAddresses(DEFAULT_CHAIN_ID);
		const result = await readContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'getJob',
			args: [jobId as `0x${string}`],
			chainId: DEFAULT_CHAIN_ID
		}) as {
			jobId: `0x${string}`;
			buyer: `0x${string}`;
			agent: `0x${string}`;
			escrowAmount: bigint;
			stakeAmount: bigint;
			taskDescription: string;
			status: number;
			deadline: bigint;
			createdAt: bigint;
			deliveredAt: bigint;
			deliverableURI: string;
		};

		// Check if job exists (buyer != zero address)
		if (result.buyer === '0x0000000000000000000000000000000000000000') {
			return null;
		}

		return {
			jobId: result.jobId,
			buyer: result.buyer,
			agent: result.agent,
			escrowAmount: result.escrowAmount,
			stakeAmount: result.stakeAmount,
			taskDescription: result.taskDescription,
			status: result.status as JobStatus,
			deadline: Number(result.deadline),
			createdAt: Number(result.createdAt),
			deliveredAt: Number(result.deliveredAt),
			deliverableURI: result.deliverableURI
		};
	} catch (err) {
		console.error('fetchJob error:', err);
		return null;
	}
}

// ═══════════════════════════════════════════════
// WRITE: Contract interaction functions
// ═══════════════════════════════════════════════

export async function createJob(
	taskDescription: string,
	deadline: number,
	value: bigint
): Promise<{ success: boolean; jobId?: string; txHash?: string }> {
	if (USE_MOCK) return mockCreateJob(taskDescription, deadline, value);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		notify('info', 'Submitting transaction...');

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'createJob',
			args: [taskDescription, BigInt(deadline)],
			value: value
		});

		notify('info', 'Waiting for confirmation...');

		const receipt = await waitForTransactionReceipt(config, { hash });

		// Parse JobCreated event from receipt logs
		let jobId: string = hash;
		try {
			const parsed = parseEventLogs({
				abi: JOB_ESCROW_ABI,
				logs: receipt.logs,
				eventName: 'JobCreated'
			});
			if (parsed.length > 0 && parsed[0].args) {
				jobId = (parsed[0].args as { jobId: string }).jobId;
			}
		} catch {
			// Fallback to tx hash
		}

		notify('success', 'Job created successfully!', hash);
		return { success: true, jobId, txHash: hash };
	} catch (error: any) {
		console.error('createJob error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to create job';
		notify('error', msg);
		return { success: false };
	}
}

export async function registerAgent(
	identity: string,
	metadataURI: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockRegisterAgent(identity, metadataURI);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		notify('info', 'Submitting registration...');

		const hash = await writeContract(config, {
			address: addresses.agentRegistry,
			abi: AGENT_REGISTRY_ABI,
			functionName: 'registerAgent',
			args: [identity as `0x${string}`, metadataURI]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Agent registered successfully!', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('registerAgent error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to register agent';
		notify('error', msg);
		return { success: false };
	}
}

export async function assignAgent(
	jobId: string,
	agentAddress: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockAssignAgent(jobId, agentAddress);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'assignAgent',
			args: [jobId as `0x${string}`, agentAddress as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Agent assigned to job', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('assignAgent error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to assign agent';
		notify('error', msg);
		return { success: false };
	}
}

export async function acceptJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockAcceptJob(jobId);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		// Fetch job to calculate required stake (10% of escrow)
		const job = await readContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'getJob',
			args: [jobId as `0x${string}`]
		}) as { escrowAmount: bigint };

		const requiredStake = (job.escrowAmount * 1000n) / 10000n;

		notify('info', `Staking ${formatEther(requiredStake)} ETH...`);

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'agentAccept',
			args: [jobId as `0x${string}`],
			value: requiredStake
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Job accepted! Stake deposited.', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('acceptJob error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to accept job';
		notify('error', msg);
		return { success: false };
	}
}

export async function submitDeliverable(
	jobId: string,
	uri: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockSubmitDeliverable(jobId, uri);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'submitDeliverable',
			args: [jobId as `0x${string}`, uri]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Deliverable submitted!', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('submitDeliverable error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to submit deliverable';
		notify('error', msg);
		return { success: false };
	}
}

export async function confirmDelivery(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockConfirmDelivery(jobId);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'confirmDelivery',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Delivery confirmed! Payment released.', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('confirmDelivery error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to confirm delivery';
		notify('error', msg);
		return { success: false };
	}
}

export async function cancelJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockCancelJob(jobId);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'cancelJob',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('warning', 'Job cancelled. Escrow refunded.', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('cancelJob error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to cancel job';
		notify('error', msg);
		return { success: false };
	}
}

export async function fileDispute(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) return mockFileDispute(jobId);

	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		// Dispute requires 0.01 ETH stake
		const disputeStake = 10000000000000000n; // 0.01 ETH

		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'fileDispute',
			args: [jobId as `0x${string}`],
			value: disputeStake
		});

		await waitForTransactionReceipt(config, { hash });
		notify('warning', 'Dispute filed (0.01 ETH staked)', hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('fileDispute error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to file dispute';
		notify('error', msg);
		return { success: false };
	}
}

export async function updateAvailability(
	available: boolean
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet first');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? DEFAULT_CHAIN_ID);

		const hash = await writeContract(config, {
			address: addresses.agentRegistry,
			abi: AGENT_REGISTRY_ABI,
			functionName: 'updateAvailability',
			args: [available]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', `Availability set to ${available ? 'Available' : 'Busy'}`, hash);
		return { success: true, txHash: hash };
	} catch (error: any) {
		console.error('updateAvailability error:', error);
		const msg = error?.shortMessage ?? error?.message ?? 'Failed to update availability';
		notify('error', msg);
		return { success: false };
	}
}

// ═══════════════════════════════════════════════
// Filter helpers
// ═══════════════════════════════════════════════

export async function fetchJobsByBuyer(buyerAddress: string): Promise<Job[]> {
	const jobs = await fetchJobs();
	return jobs.filter(j => j.buyer.toLowerCase() === buyerAddress.toLowerCase());
}

export async function fetchJobsByAgent(agentAddress: string): Promise<Job[]> {
	const jobs = await fetchJobs();
	return jobs.filter(j => j.agent.toLowerCase() === agentAddress.toLowerCase());
}

export async function fetchCompletedJobsByAgent(agentAddress: string): Promise<Job[]> {
	const jobs = await fetchJobs();
	return jobs.filter(j =>
		j.agent.toLowerCase() === agentAddress.toLowerCase() &&
		j.status === JobStatus.Complete
	);
}

// ═══════════════════════════════════════════════
// MOCK DATA (fallback when USE_MOCK = true)
// ═══════════════════════════════════════════════

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function mockTxHash(): string {
	return '0x' + Array.from({ length: 64 }, () =>
		Math.floor(Math.random() * 16).toString(16)
	).join('');
}

function getMockAgents(): Agent[] {
	return [
		{
			address: '0x1234567890abcdef1234567890abcdef12345678',
			erc8004Identity: '0x' + '1'.repeat(64),
			metadataURI: 'ipfs://QmXxx...agent1',
			tier: AgentTier.Expert,
			isAvailable: true,
			completedJobs: 47,
			disputedJobs: 1,
			currentStake: 5000000000000000000n,
			activeJobs: 2,
			registeredAt: Math.floor(Date.now() / 1000) - 86400 * 180,
			name: 'CodeMaster AI',
			skills: ['Smart Contracts', 'Solidity', 'Auditing', 'DeFi'],
			reputation: 98
		},
		{
			address: '0xabcdef1234567890abcdef1234567890abcdef12',
			erc8004Identity: '0x' + '2'.repeat(64),
			metadataURI: 'ipfs://QmXxx...agent2',
			tier: AgentTier.Proven,
			isAvailable: true,
			completedJobs: 23,
			disputedJobs: 0,
			currentStake: 2000000000000000000n,
			activeJobs: 1,
			registeredAt: Math.floor(Date.now() / 1000) - 86400 * 90,
			name: 'DataWizard',
			skills: ['Data Analysis', 'Python', 'SQL'],
			reputation: 88
		}
	];
}

function getMockJobs(): Job[] {
	return [
		{
			jobId: '0x' + 'a'.repeat(64),
			buyer: '0xaaaa1111222233334444555566667777888899990000',
			agent: '0x0000000000000000000000000000000000000000',
			escrowAmount: 500000000000000000n,
			stakeAmount: 0n,
			taskDescription: 'Smart contract review for a DeFi lending protocol.',
			status: JobStatus.Open,
			deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
			createdAt: Math.floor(Date.now() / 1000) - 3600,
			deliveredAt: 0,
			deliverableURI: ''
		}
	];
}

async function mockCreateJob(desc: string, deadline: number, value: bigint) {
	await delay(1500);
	if (!desc || desc.length < 10) { notify('error', 'Description must be at least 10 characters'); return { success: false }; }
	if (deadline <= Math.floor(Date.now() / 1000)) { notify('error', 'Deadline must be in the future'); return { success: false }; }
	if (value <= 0n) { notify('error', 'Budget must be greater than 0'); return { success: false }; }
	const txHash = mockTxHash();
	notify('success', 'Job created (mock)', txHash);
	return { success: true, jobId: mockTxHash(), txHash };
}

async function mockRegisterAgent(identity: string, metadataURI: string) {
	await delay(1500);
	const txHash = mockTxHash();
	notify('success', 'Agent registered (mock)', txHash);
	return { success: true, txHash };
}

async function mockAssignAgent(jobId: string, agentAddress: string) {
	await delay(1000);
	const txHash = mockTxHash();
	notify('success', 'Agent assigned (mock)', txHash);
	return { success: true, txHash };
}

async function mockAcceptJob(jobId: string) {
	await delay(1000);
	const txHash = mockTxHash();
	notify('success', 'Job accepted (mock)', txHash);
	return { success: true, txHash };
}

async function mockSubmitDeliverable(jobId: string, uri: string) {
	await delay(1200);
	const txHash = mockTxHash();
	notify('success', 'Deliverable submitted (mock)', txHash);
	return { success: true, txHash };
}

async function mockConfirmDelivery(jobId: string) {
	await delay(1000);
	const txHash = mockTxHash();
	notify('success', 'Delivery confirmed (mock)', txHash);
	return { success: true, txHash };
}

async function mockCancelJob(jobId: string) {
	await delay(800);
	const txHash = mockTxHash();
	notify('warning', 'Job cancelled (mock)', txHash);
	return { success: true, txHash };
}

async function mockFileDispute(jobId: string) {
	await delay(1000);
	const txHash = mockTxHash();
	notify('warning', 'Dispute filed (mock)', txHash);
	return { success: true, txHash };
}
