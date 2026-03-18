// Contract event listeners
// Stub implementation using setInterval for demo purposes

import type { Job } from '$lib/types';
import { JobStatus } from '$lib/types';

export interface JobEvent {
	type: 'JobCreated' | 'JobAssigned' | 'JobAccepted' | 'DeliverableSubmitted' | 'DeliveryConfirmed' | 'JobDisputed' | 'JobCancelled';
	jobId: string;
	data: Record<string, unknown>;
	timestamp: number;
	txHash: string;
}

type JobEventCallback = (event: JobEvent) => void;

// Store active subscriptions
const activeSubscriptions: Map<string, ReturnType<typeof setInterval>> = new Map();

// Mock event generator
function generateMockEvent(): JobEvent {
	const eventTypes: JobEvent['type'][] = [
		'JobCreated', 'JobAssigned', 'JobAccepted', 'DeliverableSubmitted', 'DeliveryConfirmed'
	];
	
	const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
	const jobId = String(Math.floor(Math.random() * 8) + 1);
	
	const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
		Math.floor(Math.random() * 16).toString(16)
	).join('');
	
	const events: Record<JobEvent['type'], JobEvent> = {
		JobCreated: {
			type: 'JobCreated',
			jobId,
			data: { buyer: '0xNewBuyer...', budget: '0.5 ETH' },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		JobAssigned: {
			type: 'JobAssigned',
			jobId,
			data: { agent: '0xAgent...', buyer: '0xBuyer...' },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		JobAccepted: {
			type: 'JobAccepted',
			jobId,
			data: { agent: '0xAgent...' },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		DeliverableSubmitted: {
			type: 'DeliverableSubmitted',
			jobId,
			data: { uri: 'ipfs://Qm...', agent: '0xAgent...' },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		DeliveryConfirmed: {
			type: 'DeliveryConfirmed',
			jobId,
			data: { buyer: '0xBuyer...', paymentReleased: true },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		JobDisputed: {
			type: 'JobDisputed',
			jobId,
			data: { filedBy: '0xBuyer...' },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		},
		JobCancelled: {
			type: 'JobCancelled',
			jobId,
			data: { cancelledBy: '0xBuyer...', refundIssued: true },
			timestamp: Math.floor(Date.now() / 1000),
			txHash: mockTxHash
		}
	};
	
	return events[type];
}

/**
 * Subscribe to job events
 * Calls callback with mock events periodically for demo
 */
export function subscribeToJobEvents(callback: JobEventCallback, intervalMs = 15000): () => void {
	const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	
	// Initial event after a short delay
	const initialTimeout = setTimeout(() => {
		callback(generateMockEvent());
	}, 2000);
	
	// Periodic events
	const interval = setInterval(() => {
		// 30% chance of event per interval for realistic feel
		if (Math.random() < 0.3) {
			callback(generateMockEvent());
		}
	}, intervalMs);
	
	activeSubscriptions.set(subscriptionId, interval);
	
	// Return unsubscribe function
	return () => {
		clearTimeout(initialTimeout);
		clearInterval(interval);
		activeSubscriptions.delete(subscriptionId);
	};
}

/**
 * Subscribe to events for a specific job
 */
export function subscribeToJobEventsForJob(
	jobId: string,
	callback: JobEventCallback,
	intervalMs = 10000
): () => void {
	const subscriptionId = `job-${jobId}-${Date.now()}`;
	
	const interval = setInterval(() => {
		// 20% chance of event for specific job
		if (Math.random() < 0.2) {
			const event = generateMockEvent();
			event.jobId = jobId;
			callback(event);
		}
	}, intervalMs);
	
	activeSubscriptions.set(subscriptionId, interval);
	
	return () => {
		clearInterval(interval);
		activeSubscriptions.delete(subscriptionId);
	};
}

/**
 * Clean up all active subscriptions
 */
export function cleanupAllSubscriptions(): void {
	for (const interval of activeSubscriptions.values()) {
		clearInterval(interval);
	}
	activeSubscriptions.clear();
}

/**
 * Parse raw event log into typed event
 * Used when real contract events are available
 */
export function parseJobEvent(log: { topics: string[]; data: string }): JobEvent | null {
	// Stub: will be implemented when real contract integration
	console.log('Parsing event log:', log);
	return null;
}
