// Contract interaction hooks — mock data for frontend development
// Uses @wagmi/core vanilla JS actions (NOT wagmi React hooks)

import { readContract, writeContract, waitForTransactionReceipt, getAccount } from '@wagmi/core';
import type { Agent, Job } from '$lib/types';
import { AgentTier, JobStatus } from '$lib/types';
import { notify } from '$lib/stores/notifications.svelte';
import { JOB_ESCROW_ABI, AGENT_REGISTRY_ABI } from './abis';
import { getAddresses } from './addresses';
import { config } from './config';

// Toggle between mock and real contract interactions
const USE_MOCK = true;

// Mock agents covering all tiers
const mockAgents: Agent[] = [
	{
		address: '0x1234567890abcdef1234567890abcdef12345678',
		erc8004Identity: 'did:eth:0x1234567890abcdef1234567890abcdef12345678',
		metadataURI: 'ipfs://QmXxx...agent1',
		tier: AgentTier.Expert,
		isAvailable: true,
		completedJobs: 47,
		disputedJobs: 1,
		currentStake: BigInt('5000000000000000000'),
		activeJobs: 2,
		registeredAt: Math.floor(Date.now() / 1000) - 86400 * 180,
		name: 'CodeMaster AI',
		skills: ['Smart Contracts', 'Solidity', 'Auditing', 'DeFi'],
		reputation: 98
	},
	{
		address: '0xabcdef1234567890abcdef1234567890abcdef12',
		erc8004Identity: 'did:eth:0xabcdef1234567890abcdef1234567890abcdef12',
		metadataURI: 'ipfs://QmXxx...agent2',
		tier: AgentTier.Expert,
		isAvailable: false,
		completedJobs: 89,
		disputedJobs: 2,
		currentStake: BigInt('8000000000000000000'),
		activeJobs: 3,
		registeredAt: Math.floor(Date.now() / 1000) - 86400 * 365,
		name: 'DesignBot Pro',
		skills: ['UI/UX Design', 'Figma', 'Prototyping', 'Branding'],
		reputation: 95
	},
	{
		address: '0x9876543210fedcba9876543210fedcba98765432',
		erc8004Identity: 'did:eth:0x9876543210fedcba9876543210fedcba98765432',
		metadataURI: 'ipfs://QmXxx...agent3',
		tier: AgentTier.Proven,
		isAvailable: true,
		completedJobs: 23,
		disputedJobs: 0,
		currentStake: BigInt('2000000000000000000'),
		activeJobs: 1,
		registeredAt: Math.floor(Date.now() / 1000) - 86400 * 90,
		name: 'DataWizard',
		skills: ['Data Analysis', 'Python', 'SQL', 'Visualization'],
		reputation: 88
	},
	{
		address: '0xfedcba9876543210fedcba9876543210fedcba98',
		erc8004Identity: 'did:eth:0xfedcba9876543210fedcba9876543210fedcba98',
		metadataURI: 'ipfs://QmXxx...agent4',
		tier: AgentTier.Proven,
		isAvailable: true,
		completedJobs: 15,
		disputedJobs: 1,
		currentStake: BigInt('1500000000000000000'),
		activeJobs: 0,
		registeredAt: Math.floor(Date.now() / 1000) - 86400 * 60,
		name: 'ContentGenius',
		skills: ['Content Writing', 'SEO', 'Copywriting'],
		reputation: 82
	},
	{
		address: '0x5555666677778888999900001111222233334444',
		erc8004Identity: 'did:eth:0x5555666677778888999900001111222233334444',
		metadataURI: 'ipfs://QmXxx...agent5',
		tier: AgentTier.Apprentice,
		isAvailable: true,
		completedJobs: 3,
		disputedJobs: 0,
		currentStake: BigInt('500000000000000000'),
		activeJobs: 1,
		registeredAt: Math.floor(Date.now() / 1000) - 86400 * 14,
		name: 'NewbieAgent',
		skills: ['Testing', 'Documentation'],
		reputation: 65
	}
];

// Mock jobs covering all statuses
const mockJobs: Job[] = [
	{
		jobId: '1',
		buyer: '0xaaaa1111222233334444555566667777888899990000',
		agent: '0x0000000000000000000000000000000000000000',
		escrowAmount: BigInt('500000000000000000'),
		stakeAmount: BigInt('50000000000000000'),
		taskDescription: 'Develop a comprehensive smart contract for a decentralized voting system.',
		status: JobStatus.Open,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
		createdAt: Math.floor(Date.now() / 1000) - 3600,
		deliveredAt: 0,
		deliverableURI: ''
	},
	{
		jobId: '2',
		buyer: '0xbbbb1111222233334444555566667777888899990000',
		agent: '0x1234567890abcdef1234567890abcdef12345678',
		escrowAmount: BigInt('250000000000000000'),
		stakeAmount: BigInt('25000000000000000'),
		taskDescription: 'Create a responsive landing page design for a Web3 NFT marketplace.',
		status: JobStatus.Assigned,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
		createdAt: Math.floor(Date.now() / 1000) - 86400,
		deliveredAt: 0,
		deliverableURI: ''
	},
	{
		jobId: '3',
		buyer: '0xcccc1111222233334444555566667777888899990000',
		agent: '0xabcdef1234567890abcdef1234567890abcdef12',
		escrowAmount: BigInt('1000000000000000000'),
		stakeAmount: BigInt('100000000000000000'),
		taskDescription: 'Build a comprehensive data pipeline to analyze on-chain DEX trading patterns.',
		status: JobStatus.InProgress,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 3,
		createdAt: Math.floor(Date.now() / 1000) - 86400 * 4,
		deliveredAt: 0,
		deliverableURI: ''
	},
	{
		jobId: '4',
		buyer: '0xdddd1111222233334444555566667777888899990000',
		agent: '0x9876543210fedcba9876543210fedcba98765432',
		escrowAmount: BigInt('300000000000000000'),
		stakeAmount: BigInt('30000000000000000'),
		taskDescription: 'Write technical documentation for a REST API including OpenAPI spec.',
		status: JobStatus.Delivered,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
		createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
		deliveredAt: Math.floor(Date.now() / 1000) - 3600,
		deliverableURI: 'ipfs://QmDeliveredDoc123'
	},
	{
		jobId: '5',
		buyer: '0xeeee1111222233334444555566667777888899990000',
		agent: '0xfedcba9876543210fedcba9876543210fedcba98',
		escrowAmount: BigInt('150000000000000000'),
		stakeAmount: BigInt('15000000000000000'),
		taskDescription: 'Create 10 SEO-optimized blog posts about DeFi yield farming strategies.',
		status: JobStatus.Complete,
		deadline: Math.floor(Date.now() / 1000) - 86400 * 2,
		createdAt: Math.floor(Date.now() / 1000) - 86400 * 14,
		deliveredAt: Math.floor(Date.now() / 1000) - 86400 * 3,
		deliverableURI: 'ipfs://QmCompletedBlogs456'
	},
	{
		jobId: '6',
		buyer: '0xffff1111222233334444555566667777888899990000',
		agent: '0x1234567890abcdef1234567890abcdef12345678',
		escrowAmount: BigInt('800000000000000000'),
		stakeAmount: BigInt('80000000000000000'),
		taskDescription: 'Security audit of a lending protocol smart contract.',
		status: JobStatus.Disputed,
		deadline: Math.floor(Date.now() / 1000) + 86400,
		createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
		deliveredAt: Math.floor(Date.now() / 1000) - 86400 * 2,
		deliverableURI: 'ipfs://QmDisputedAudit789'
	},
	{
		jobId: '7',
		buyer: '0xaaaa1111222233334444555566667777888899990000',
		agent: '0x0000000000000000000000000000000000000000',
		escrowAmount: BigInt('200000000000000000'),
		stakeAmount: BigInt('20000000000000000'),
		taskDescription: 'Set up a CI/CD pipeline for a monorepo with automated testing.',
		status: JobStatus.Open,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 10,
		createdAt: Math.floor(Date.now() / 1000) - 7200,
		deliveredAt: 0,
		deliverableURI: ''
	},
	{
		jobId: '8',
		buyer: '0xbbbb1111222233334444555566667777888899990000',
		agent: '0x5555666677778888999900001111222233334444',
		escrowAmount: BigInt('75000000000000000'),
		stakeAmount: BigInt('10000000000000000'),
		taskDescription: 'Write unit tests for a JavaScript library with 80% code coverage.',
		status: JobStatus.Cancelled,
		deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
		createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
		deliveredAt: 0,
		deliverableURI: ''
	}
];

// Simulate async delay
function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate mock tx hash
function mockTxHash(): string {
	return '0x' + Array.from({ length: 64 }, () => 
		Math.floor(Math.random() * 16).toString(16)
	).join('');
}

// ============================================================
// REAL CONTRACT INTERACTION FUNCTIONS (use when USE_MOCK = false)
// ============================================================

async function createJobOnChain(
	taskDescription: string,
	deadline: number,
	value: bigint
): Promise<{ success: boolean; jobId?: string; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'createJob',
			args: [taskDescription, BigInt(deadline)],
			value: value
		});

		const receipt = await waitForTransactionReceipt(config, { hash });
		
		// Parse JobCreated event to get jobId
		const jobCreatedEvent = receipt.logs.find((log: { topics: readonly `0x${string}`[] }) => 
			log.topics[0] === '0x...' // JobCreated event signature
		);
		
		const jobId = jobCreatedEvent?.topics[1] ?? hash;
		
		notify('success', 'Job created successfully!', hash);
		return { success: true, jobId: jobId as string, txHash: hash };
	} catch (error) {
		console.error('createJob error:', error);
		notify('error', 'Failed to create job');
		return { success: false };
	}
}

async function acceptJobOnChain(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'agentAccept',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', `Job accepted!`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('acceptJob error:', error);
		notify('error', 'Failed to accept job');
		return { success: false };
	}
}

async function submitDeliverableOnChain(
	jobId: string,
	uri: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'submitDeliverable',
			args: [jobId as `0x${string}`, uri]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', `Deliverable submitted`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('submitDeliverable error:', error);
		notify('error', 'Failed to submit deliverable');
		return { success: false };
	}
}

async function confirmDeliveryOnChain(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'confirmDelivery',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', `Delivery confirmed. Payment released!`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('confirmDelivery error:', error);
		notify('error', 'Failed to confirm delivery');
		return { success: false };
	}
}

async function cancelJobOnChain(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'cancelJob',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('warning', `Job cancelled`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('cancelJob error:', error);
		notify('error', 'Failed to cancel job');
		return { success: false };
	}
}

async function registerAgentOnChain(
	identity: string,
	metadataURI: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.agentRegistry,
			abi: AGENT_REGISTRY_ABI,
			functionName: 'registerAgent',
			args: [identity as `0x${string}`, metadataURI]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', 'Agent registration submitted!', hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('registerAgent error:', error);
		notify('error', 'Failed to register agent');
		return { success: false };
	}
}

async function assignAgentOnChain(
	jobId: string,
	agentAddress: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'assignAgent',
			args: [jobId as `0x${string}`, agentAddress as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('success', `Agent assigned to job`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('assignAgent error:', error);
		notify('error', 'Failed to assign agent');
		return { success: false };
	}
}

async function fileDisputeOnChain(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	try {
		const account = getAccount(config);
		if (!account.address) {
			notify('error', 'Please connect your wallet');
			return { success: false };
		}

		const addresses = getAddresses(account.chainId ?? 84532);
		
		const hash = await writeContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'fileDispute',
			args: [jobId as `0x${string}`]
		});

		await waitForTransactionReceipt(config, { hash });
		notify('warning', `Dispute filed`, hash);
		return { success: true, txHash: hash };
	} catch (error) {
		console.error('fileDispute error:', error);
		notify('error', 'Failed to file dispute');
		return { success: false };
	}
}

async function getJobOnChain(jobId: string): Promise<Job | null> {
	try {
		const account = getAccount(config);
		const chainId = account.chainId ?? 84532;
		const addresses = getAddresses(chainId);
		
		const result = await readContract(config, {
			address: addresses.jobEscrow,
			abi: JOB_ESCROW_ABI,
			functionName: 'getJob',
			args: [jobId as `0x${string}`]
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
	} catch (error) {
		console.error('getJob error:', error);
		return null;
	}
}

async function getAgentProfileOnChain(agentAddress: string): Promise<Agent | null> {
	try {
		const account = getAccount(config);
		const chainId = account.chainId ?? 84532;
		const addresses = getAddresses(chainId);
		
		const result = await readContract(config, {
			address: addresses.agentRegistry,
			abi: AGENT_REGISTRY_ABI,
			functionName: 'getAgentProfile',
			args: [agentAddress as `0x${string}`]
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

		return {
			address: result.agentAddress,
			erc8004Identity: result.erc8004Identity,
			metadataURI: result.metadataURI,
			tier: result.tier as AgentTier,
			isAvailable: result.isAvailable,
			completedJobs: Number(result.completedJobs),
			disputedJobs: Number(result.disputedJobs),
			currentStake: result.currentStake,
			activeJobs: Number(result.activeJobs),
			registeredAt: Number(result.registeredAt),
			name: '', // Fetch from metadata
			skills: [], // Fetch from metadata
			reputation: 0 // Fetch from EAS
		};
	} catch (error) {
		console.error('getAgentProfile error:', error);
		return null;
	}
}

// ============================================================
// EXPORTED FUNCTIONS (with mock fallback)
// ============================================================

export async function fetchAgents(): Promise<Agent[]> {
	if (USE_MOCK) {
		await delay(300);
		return [...mockAgents];
	}
	// Real implementation would query agent registry events
	return [...mockAgents];
}

export async function fetchAgent(address: string): Promise<Agent | null> {
	if (USE_MOCK) {
		await delay(200);
		return mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase()) ?? null;
	}
	return getAgentProfileOnChain(address);
}

export async function fetchJobs(): Promise<Job[]> {
	if (USE_MOCK) {
		await delay(300);
		return [...mockJobs];
	}
	// Real implementation would query job events
	return [...mockJobs];
}

export async function fetchJob(jobId: string): Promise<Job | null> {
	if (USE_MOCK) {
		await delay(200);
		return mockJobs.find(j => j.jobId === jobId) ?? null;
	}
	return getJobOnChain(jobId);
}

export async function createJob(
	taskDescription: string,
	deadline: number,
	value: bigint
): Promise<{ success: boolean; jobId?: string; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1500);
		
		if (!taskDescription || taskDescription.length < 10) {
			notify('error', 'Task description must be at least 10 characters');
			return { success: false };
		}
		
		if (deadline <= Math.floor(Date.now() / 1000)) {
			notify('error', 'Deadline must be in the future');
			return { success: false };
		}
		
		if (value <= BigInt(0)) {
			notify('error', 'Budget must be greater than 0');
			return { success: false };
		}

		const txHash = mockTxHash();
		const jobId = String(mockJobs.length + 1);
		
		notify('success', 'Job created successfully!', txHash);
		
		return { success: true, jobId, txHash };
	}
	return createJobOnChain(taskDescription, deadline, value);
}

export async function acceptJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1000);
		
		const job = mockJobs.find(j => j.jobId === jobId);
		if (!job) {
			notify('error', 'Job not found');
			return { success: false };
		}
		
		const txHash = mockTxHash();
		notify('success', `Job #${jobId} accepted!`, txHash);
		
		return { success: true, txHash };
	}
	return acceptJobOnChain(jobId);
}

export async function submitDeliverable(
	jobId: string,
	uri: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1200);
		
		if (!uri || uri.length < 10) {
			notify('error', 'Deliverable URI is required');
			return { success: false };
		}
		
		const txHash = mockTxHash();
		notify('success', `Deliverable submitted for job #${jobId}`, txHash);
		
		return { success: true, txHash };
	}
	return submitDeliverableOnChain(jobId, uri);
}

export async function confirmDelivery(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1000);
		
		const txHash = mockTxHash();
		notify('success', `Delivery confirmed for job #${jobId}. Payment released!`, txHash);
		
		return { success: true, txHash };
	}
	return confirmDeliveryOnChain(jobId);
}

export async function cancelJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(800);
		
		const txHash = mockTxHash();
		notify('warning', `Job #${jobId} has been cancelled`, txHash);
		
		return { success: true, txHash };
	}
	return cancelJobOnChain(jobId);
}

export async function registerAgent(
	identity: string,
	metadataURI: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1500);
		
		if (!identity || identity.length < 3) {
			notify('error', 'Identity is required');
			return { success: false };
		}
		
		const txHash = mockTxHash();
		notify('success', 'Agent registration submitted!', txHash);
		
		return { success: true, txHash };
	}
	return registerAgentOnChain(identity, metadataURI);
}

export async function assignAgent(
	jobId: string,
	agentAddress: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1000);
		
		const txHash = mockTxHash();
		notify('success', `Agent assigned to job #${jobId}`, txHash);
		
		return { success: true, txHash };
	}
	return assignAgentOnChain(jobId, agentAddress);
}

export async function fileDispute(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	if (USE_MOCK) {
		await delay(1000);
		
		const txHash = mockTxHash();
		notify('warning', `Dispute filed for job #${jobId}`, txHash);
		
		return { success: true, txHash };
	}
	return fileDisputeOnChain(jobId);
}

// Get jobs by buyer address
export async function fetchJobsByBuyer(buyerAddress: string): Promise<Job[]> {
	if (USE_MOCK) {
		await delay(200);
		return mockJobs.filter(j => j.buyer.toLowerCase() === buyerAddress.toLowerCase());
	}
	// Real implementation would filter by buyer
	return mockJobs.filter(j => j.buyer.toLowerCase() === buyerAddress.toLowerCase());
}

// Get jobs by agent address
export async function fetchJobsByAgent(agentAddress: string): Promise<Job[]> {
	if (USE_MOCK) {
		await delay(200);
		return mockJobs.filter(j => j.agent.toLowerCase() === agentAddress.toLowerCase());
	}
	// Real implementation would filter by agent
	return mockJobs.filter(j => j.agent.toLowerCase() === agentAddress.toLowerCase());
}

// Get completed jobs for an agent (for profile display)
export async function fetchCompletedJobsByAgent(agentAddress: string): Promise<Job[]> {
	if (USE_MOCK) {
		await delay(200);
		return mockJobs.filter(j => 
			j.agent.toLowerCase() === agentAddress.toLowerCase() && 
			j.status === JobStatus.Complete
		);
	}
	// Real implementation would filter by agent and status
	return mockJobs.filter(j => 
		j.agent.toLowerCase() === agentAddress.toLowerCase() && 
		j.status === JobStatus.Complete
	);
}
