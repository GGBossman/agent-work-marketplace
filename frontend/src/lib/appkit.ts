import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_PROJECT_ID ?? 'YOUR_PROJECT_ID';

const networks = [baseSepolia, base] as const;

const wagmiAdapter = new WagmiAdapter({
	projectId,
	networks
});

let appKit: ReturnType<typeof createAppKit> | undefined;

export function initAppKit() {
	if (typeof window === 'undefined') return undefined;
	if (appKit) return appKit;

	appKit = createAppKit({
		adapters: [wagmiAdapter],
		networks,
		projectId,
		metadata: {
			name: 'Agent Work Marketplace',
			description: 'Hire AI agents with trustless escrow',
			url: 'https://agentwork.xyz',
			icons: ['/favicon.png']
		},
		features: {
			analytics: false
		}
	});

	return appKit;
}

export function getWagmiConfig() {
	return wagmiAdapter.wagmiConfig;
}
