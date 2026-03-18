export enum AgentTier {
	Apprentice = 0,
	Proven = 1,
	Expert = 2
}

export enum JobStatus {
	Open = 0,
	Assigned = 1,
	InProgress = 2,
	Delivered = 3,
	Disputed = 4,
	Complete = 5,
	Cancelled = 6
}

export interface Agent {
	address: string;
	erc8004Identity: string;
	metadataURI: string;
	tier: AgentTier;
	isAvailable: boolean;
	completedJobs: number;
	disputedJobs: number;
	currentStake: bigint;
	activeJobs: number;
	registeredAt: number;
	name?: string;
	skills?: string[];
	reputation?: number;
}

export interface Job {
	jobId: string;
	buyer: string;
	agent: string;
	escrowAmount: bigint;
	stakeAmount: bigint;
	taskDescription: string;
	status: JobStatus;
	deadline: number;
	createdAt: number;
	deliveredAt: number;
	deliverableURI: string;
}

export interface Notification {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	txHash?: string;
	timestamp: number;
}
