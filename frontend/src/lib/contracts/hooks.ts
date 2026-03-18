// Contract interaction hooks — mock data for frontend development
import type { Agent, Job } from '$lib/types';
import { AgentTier, JobStatus } from '$lib/types';
import { notify } from '$lib/stores/notifications.svelte';

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
		taskDescription: 'Develop a comprehensive smart contract for a decentralized voting system with delegation, quadratic voting, and vote-weighted execution.',
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
		taskDescription: 'Create a responsive landing page design for a Web3 NFT marketplace with dark theme support.',
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
		taskDescription: 'Build a comprehensive data pipeline to analyze on-chain DEX trading patterns and generate weekly reports.',
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
		taskDescription: 'Write technical documentation for a REST API including OpenAPI spec, examples, and integration guides.',
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
		taskDescription: 'Security audit of a lending protocol smart contract with detailed vulnerability report.',
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
		taskDescription: 'Set up a CI/CD pipeline for a monorepo with automated testing and deployment to multiple environments.',
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
		taskDescription: 'Write unit tests for a JavaScript library with 80% code coverage requirement.',
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

export async function fetchAgents(): Promise<Agent[]> {
	await delay(300);
	return [...mockAgents];
}

export async function fetchAgent(address: string): Promise<Agent | null> {
	await delay(200);
	return mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase()) ?? null;
}

export async function fetchJobs(): Promise<Job[]> {
	await delay(300);
	return [...mockJobs];
}

export async function fetchJob(jobId: string): Promise<Job | null> {
	await delay(200);
	return mockJobs.find(j => j.jobId === jobId) ?? null;
}

export async function createJob(
	taskDescription: string,
	deadline: number,
	value: bigint
): Promise<{ success: boolean; jobId?: string; txHash?: string }> {
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

export async function acceptJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
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

export async function submitDeliverable(
	jobId: string,
	uri: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(1200);
	
	if (!uri || uri.length < 10) {
		notify('error', 'Deliverable URI is required');
		return { success: false };
	}
	
	const txHash = mockTxHash();
	notify('success', `Deliverable submitted for job #${jobId}`, txHash);
	
	return { success: true, txHash };
}

export async function confirmDelivery(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(1000);
	
	const txHash = mockTxHash();
	notify('success', `Delivery confirmed for job #${jobId}. Payment released!`, txHash);
	
	return { success: true, txHash };
}

export async function cancelJob(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(800);
	
	const txHash = mockTxHash();
	notify('warning', `Job #${jobId} has been cancelled`, txHash);
	
	return { success: true, txHash };
}

export async function registerAgent(
	identity: string,
	metadataURI: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(1500);
	
	if (!identity || identity.length < 3) {
		notify('error', 'Identity is required');
		return { success: false };
	}
	
	const txHash = mockTxHash();
	notify('success', 'Agent registration submitted!', txHash);
	
	return { success: true, txHash };
}

export async function assignAgent(
	jobId: string,
	agentAddress: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(1000);
	
	const txHash = mockTxHash();
	notify('success', `Agent assigned to job #${jobId}`, txHash);
	
	return { success: true, txHash };
}

export async function fileDispute(
	jobId: string
): Promise<{ success: boolean; txHash?: string }> {
	await delay(1000);
	
	const txHash = mockTxHash();
	notify('warning', `Dispute filed for job #${jobId}`, txHash);
	
	return { success: true, txHash };
}

// Get jobs by buyer address
export async function fetchJobsByBuyer(buyerAddress: string): Promise<Job[]> {
	await delay(200);
	return mockJobs.filter(j => j.buyer.toLowerCase() === buyerAddress.toLowerCase());
}

// Get jobs by agent address
export async function fetchJobsByAgent(agentAddress: string): Promise<Job[]> {
	await delay(200);
	return mockJobs.filter(j => j.agent.toLowerCase() === agentAddress.toLowerCase());
}

// Get completed jobs for an agent (for profile display)
export async function fetchCompletedJobsByAgent(agentAddress: string): Promise<Job[]> {
	await delay(200);
	return mockJobs.filter(j => 
		j.agent.toLowerCase() === agentAddress.toLowerCase() && 
		j.status === JobStatus.Complete
	);
}
