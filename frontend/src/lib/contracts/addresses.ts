// Contract addresses for Agent Work Marketplace
// Placeholder addresses - update after deployment

export const CHAIN_IDS = {
	BASE_MAINNET: 8453,
	BASE_SEPOLIA: 84532
} as const;

export const ADDRESSES: Record<number, { jobEscrow: `0x${string}`; agentRegistry: `0x${string}` }> = {
	[CHAIN_IDS.BASE_SEPOLIA]: {
		jobEscrow: '0x0000000000000000000000000000000000000001',
		agentRegistry: '0x0000000000000000000000000000000000000002'
	},
	[CHAIN_IDS.BASE_MAINNET]: {
		jobEscrow: '0x0000000000000000000000000000000000000001',
		agentRegistry: '0x0000000000000000000000000000000000000002'
	}
};

export function getAddresses(chainId: number) {
	return ADDRESSES[chainId] ?? ADDRESSES[CHAIN_IDS.BASE_SEPOLIA];
}

export function getExplorerUrl(chainId: number): string {
	switch (chainId) {
		case CHAIN_IDS.BASE_MAINNET:
			return 'https://basescan.org';
		case CHAIN_IDS.BASE_SEPOLIA:
		default:
			return 'https://sepolia.basescan.org';
	}
}

export function getAddressUrl(chainId: number, address: string): string {
	return `${getExplorerUrl(chainId)}/address/${address}`;
}

export function getTxUrl(chainId: number, txHash: string): string {
	return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}
