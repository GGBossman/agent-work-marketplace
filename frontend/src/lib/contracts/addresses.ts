export const CHAIN_IDS = {
	BASE_MAINNET: 8453,
	BASE_SEPOLIA: 84532
} as const;

export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];

export const ADDRESSES: Record<number, { jobEscrow: `0x${string}`; agentRegistry: `0x${string}` }> = {
	[CHAIN_IDS.BASE_SEPOLIA]: {
		jobEscrow: '0xcabf53b4fd6bee5ec3f08de9a2a3d1dbe8854ed4',
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
