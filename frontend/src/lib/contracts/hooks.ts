// Contract interaction hooks — mock data until Phase 3 integration
import type { Agent, Job } from '$lib/types';
import { AgentTier, JobStatus } from '$lib/types';

export async function fetchAgents(): Promise<Agent[]> {
	return [];
}

export async function fetchAgent(_address: string): Promise<Agent | null> {
	return null;
}

export async function fetchJobs(): Promise<Job[]> {
	return [];
}

export async function fetchJob(_jobId: string): Promise<Job | null> {
	return null;
}
