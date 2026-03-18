// EAS (Ethereum Attestation Service) helpers
// Stub implementation returning mock attestations for development

export interface EASAttestation {
	uid: string;
	schema: string;
	attester: string;
	recipient: string;
	time: number;
	data: {
		reputationScore: number;
		skillsVerified: string[];
		completedJobs: number;
	};
}

// Mock attestations storage
const mockAttestations: Map<string, EASAttestation> = new Map([
	['0x1234567890abcdef1234567890abcdef12345678', {
		uid: '0xaaa111222333444555666777888999000111222333444555666777888999000111',
		schema: '0xschema1234567890abcdef',
		attester: '0xEASAttester1234567890abcdef',
		recipient: '0x1234567890abcdef1234567890abcdef12345678',
		time: Math.floor(Date.now() / 1000) - 86400 * 30,
		data: {
			reputationScore: 98,
			skillsVerified: ['Solidity', 'Smart Contract Auditing'],
			completedJobs: 47
		}
	}],
	['0xabcdef1234567890abcdef1234567890abcdef12', {
		uid: '0xbbb111222333444555666777888999000111222333444555666777888999000222',
		schema: '0xschema1234567890abcdef',
		attester: '0xEASAttester1234567890abcdef',
		recipient: '0xabcdef1234567890abcdef1234567890abcdef12',
		time: Math.floor(Date.now() / 1000) - 86400 * 60,
		data: {
			reputationScore: 95,
			skillsVerified: ['UI Design', 'UX Research'],
			completedJobs: 89
		}
	}],
	['0x9876543210fedcba9876543210fedcba98765432', {
		uid: '0xccc111222333444555666777888999000111222333444555666777888999000333',
		schema: '0xschema1234567890abcdef',
		attester: '0xEASAttester1234567890abcdef',
		recipient: '0x9876543210fedcba9876543210fedcba98765432',
		time: Math.floor(Date.now() / 1000) - 86400 * 15,
		data: {
			reputationScore: 88,
			skillsVerified: ['Data Analysis', 'Python'],
			completedJobs: 23
		}
	}]
]);

/**
 * Get reputation score from EAS attestations
 * Returns a mock reputation score for development
 */
export async function getReputationFromEAS(agentAddress: string): Promise<number> {
	// Simulate async delay
	await new Promise(resolve => setTimeout(resolve, 100));
	
	const attestation = mockAttestations.get(agentAddress.toLowerCase());
	if (attestation) {
		return attestation.data.reputationScore;
	}
	
	// Return default reputation for unknown agents
	// Based on address hash for variety
	const hash = agentAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return 50 + (hash % 40); // Returns 50-89 range
}

/**
 * Get full attestation data for an agent
 */
export async function getAttestation(agentAddress: string): Promise<EASAttestation | null> {
	await new Promise(resolve => setTimeout(resolve, 100));
	
	return mockAttestations.get(agentAddress.toLowerCase()) ?? null;
}

/**
 * Get verified skills for an agent from EAS
 */
export async function getVerifiedSkills(agentAddress: string): Promise<string[]> {
	await new Promise(resolve => setTimeout(resolve, 50));
	
	const attestation = mockAttestations.get(agentAddress.toLowerCase());
	return attestation?.data.skillsVerified ?? [];
}

/**
 * Check if an address has any EAS attestations
 */
export async function hasAttestation(agentAddress: string): Promise<boolean> {
	await new Promise(resolve => setTimeout(resolve, 50));
	return mockAttestations.has(agentAddress.toLowerCase());
}
