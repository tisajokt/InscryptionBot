import { writeFile } from "fs/promises";

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
export function toProperCase(str: string): string {
	return `${str.substring(0,1).toUpperCase()}${str.substring(1).toLowerCase()}`;
}
export function toProperFormat(str: string): string {
	return str.split(/[ _]/).map(s => toProperCase(s)).join(" ");
}
export function singleCharStat(stat: number): string {
	return stat < 10 ? `${stat}` : "!";
}
export function abbreviate(str: string, len: number): string {
	str = str.split(/[ _]/).map(s => toProperCase(s)).join(" ");
	if (str.length <= len) return str;
	const arr = str.split(/[ -]/).map(s => toProperCase(s));
	switch (arr.length) {
		case 1:
			return arr[0].substring(0, len);
		case 2:
			return `${arr[0].substring(0, Math.ceil(2/3*len))}${arr[1].substring(0, Math.max(len - arr[0].length, Math.floor(1/3*len)))}`;
		default:
			return arr.map(s => s.substring(0, Math.max(2, Math.ceil(len / arr.length)))).join("").substring(0, len);
	}
}
export async function saveToFile(filename: string, object): Promise<boolean> {
	writeFile(filename, JSON.stringify(object));
	return true;
}
const idBase = 36;
const usedIDs = new Set<string>();
export function generateRandomID(len: number): string {
	var id: string;
	do {
		id = Math.floor(Math.random() * Math.pow(idBase, len)).toString(idBase).padStart(len, "0");
	} while (usedIDs.has(id));
	usedIDs.add(id);
	return id;
}
export const numberEmoji = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
export const costEmoji = {
	blood: "🩸",
	bones: "🦴",
	mox: "💎",
	energy: "🔋"
};
