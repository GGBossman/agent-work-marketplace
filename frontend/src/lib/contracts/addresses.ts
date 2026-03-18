export const CHAIN_IDS = {
	BASE_MAINNET: 8453,
	BASE_SEPOLIA: 84532
} as const;

export const ADDRESSES: Record<number, { jobEscrow: `0x${string}`; agentRegistry: `0x${string}` }> = {
	[CHAIN_IDS.BASE_SEPOLIA]: {
		jobEscrow: '0xe1Fa32697bADca7743D1d1D386742f5278D7De22',
		agentRegistry: '0xE3A6c87E67F65400E7a32f41b7938E0a33251f4A'
	},
	[CHAIN_IDS.BASE_MAINNET]: {
		jobEscrow: '0xe1Fa32697bADca7743D1d1D386742f5278D7De22',
		agentRegistry: '0xE3A6c87E67F65400E7a32f41b7938E0a33251f4A'
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
