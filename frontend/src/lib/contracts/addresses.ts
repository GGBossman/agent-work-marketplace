export const CHAIN_IDS = {
	BASE_MAINNET: 8453,
	BASE_SEPOLIA: 84532
} as const;

export const ADDRESSES: Record<number, { jobEscrow: `0x${string}`; agentRegistry: `0x${string}` }> = {
	[CHAIN_IDS.BASE_SEPOLIA]: {
		jobEscrow: '0xC6Ea67272757D9Fd1229293916b3030da87E3aB6',
		agentRegistry: '0x9e295aA55FD61c86cdd08dCa23F90d157eeb2463'
	},
	[CHAIN_IDS.BASE_MAINNET]: {
		jobEscrow: '0x0000000000000000000000000000000000000000',
		agentRegistry: '0x0000000000000000000000000000000000000000'
	}
};

export function getAddresses(chainId: number) {
	return ADDRESSES[chainId] ?? ADDRESSES[CHAIN_IDS.BASE_SEPOLIA];
}
