export const walletState = $state<{
	address: string | null;
	chainId: number | null;
	connected: boolean;
}>({
	address: null,
	chainId: null,
	connected: false
});

export function setWallet(address: string, chainId: number) {
	walletState.address = address;
	walletState.chainId = chainId;
	walletState.connected = true;
}

export function clearWallet() {
	walletState.address = null;
	walletState.chainId = null;
	walletState.connected = false;
}
