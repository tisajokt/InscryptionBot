
export async function sleep(t: number): Promise<void> {
	return await new Promise(resolve => setTimeout(resolve, t));
}
export function padTrim(str: string, len: number, pad: string=" "): string {
	return str.padEnd(len, pad).substring(0, len);
}
export function pickRandom(arr: any[]): any {
	return arr[Math.floor(Math.random() * arr.length)];
}
export function randomSelectionFrom(arr: any[], num: number): any[] {
	var out = [];
	while (num--) out.push(pickRandom(arr));
	return out;
}
