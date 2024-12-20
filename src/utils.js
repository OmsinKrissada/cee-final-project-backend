/**
 * @template T
 * @param {T[]} items 
 * @returns {T}
 */
export function uniformRandom(items) {
	return items[Math.floor(Math.random() * items.length)];
}

export function randomString(length, characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789") {
	let str = '';
	for (let i = 0; i < length; i++)
		str += characters[Math.floor(Math.random() * characters.length)]; // TODO: should i utilize uniformRandom? too many call stack? idk
	return str;
}

export function generateToken() {
	return randomString(50);
}

export function randomUsername() {
	let name = randomString(1, ['Wild', 'Good', 'Amateur', 'TryHard', 'Happy', 'Excited', 'Thai', 'GOAT', 'ComEng']);
	name += randomString(1, ['Shooter', 'Defender', 'Student', 'General', 'Captain', 'Destroyer']);
	name += Math.floor(Math.random() * 100000);
	return name;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));