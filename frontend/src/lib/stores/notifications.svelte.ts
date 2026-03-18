import type { Notification } from '$lib/types';

export const notifications = $state<Notification[]>([]);

let counter = 0;

export function notify(type: Notification['type'], message: string, txHash?: string) {
	const id = `notif-${++counter}`;
	notifications.push({ id, type, message, txHash, timestamp: Date.now() });
	setTimeout(() => dismiss(id), 6000);
}

export function dismiss(id: string) {
	const idx = notifications.findIndex((n) => n.id === id);
	if (idx !== -1) notifications.splice(idx, 1);
}
