import Game from "../models/gameModel.js";
import Player from "../models/playerModel.js";
import words from "../resources/english_1k.json" with { type: "json" };
import { sleep } from "../utils.js";
import { GameInstance } from "./game.js";

// export const gameConnections = [];

export function getRandomWord(length) {
	let filtered;
	if (length) {
		filtered = words.filter(w => w.length == length);
	} else {
		filtered = words.filter(w => w.length >= 3);
	}
	return filtered[Math.floor(Math.random() * filtered.length)];
}


/** @type {Map<string, GameInstance>} */
export const gameInstances = new Map();

/** @type {{ userId: string, res: Response }[]} */
export const connectionPool = [];

/**
 * @param {string[]} recipient 
 * @param {string} event 
 * @param {*} data 
 */
export function sendEvent(recipient, event, data) {
	data = JSON.stringify(data);
	connectionPool.forEach(c => {
		if (!recipient.includes(c.userId)) return;
		console.log(`event: ${event} data: ${data} --> ${c.userId}`);
		c.res.write(`event: ${event}\ndata: ${data}\n\n`);
	});
}

/**
 * @param {string} id 
 * @param {string[]} playerIds 
 */
export async function start(id, playerIds) {
	console.log(playerIds);
	const users = await Player.find({ _id: { $in: playerIds } });

	const gi = new GameInstance(id, users.map(p => ({ id: p.id, nickname: p.nickname })));
	gameInstances.set(id, gi);
	gi.onDestroy(() => {
		gameInstances.delete(id);
	});

	// await sleep(3000); // wait for player's connection
	gi.start();
}

/**
 * @param {string} playerId 
 * @param {string} word 
 */
export function submitWord(playerId, word) {
	for (const [id, instance] of gameInstances) {
		if (instance.players.has(playerId)) {
			instance.handleSubmitWord(playerId, word);
		}
	}
}

async function recover() {
	const activeGames = await Game.find({ status: 'ongoing' });
	activeGames.forEach(game => {
		start(game.id, game.players.map(p => p.id));
	});
}
recover();