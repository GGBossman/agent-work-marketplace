export function truncateAddress(address: string): string {
	if (!address || address.length < 10) return address;
	return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEth(wei: bigint): string {
	const eth = Number(wei) / 1e18;
	return eth.toFixed(eth < 0.01 ? 6 : 4);
}

export function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

export function timeAgo(timestamp: number): string {
	const seconds = Math.floor(Date.now() / 1000 - timestamp);
	if (seconds < 60) return 'just now';
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
	return `${Math.floor(seconds / 86400)}d ago`;
}
