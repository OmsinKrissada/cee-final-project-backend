export function randomString(length) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789";
	let str = '';
	for (let i = 0; i < length; i++)
		str += characters[Math.floor(Math.random() * characters.length)];
	return str;
}

export function generateToken() {
	return randomString(50);
}