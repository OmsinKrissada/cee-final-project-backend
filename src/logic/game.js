import { sleep } from "../utils.js";
import { getRandomWord, sendEvent } from "./gameManager.js";

export class GameInstance {
	/** @type {Map<string, {name: string, nickname: string}>} */
	players = new Map();
	started_at = null;
	ended_at = null;

	isEnded = false;

	constructor(id, players) {
		this.id = id;
		this.players = players;
	}

	/**
	 * @param {string} event 
	 * @param {any} data 
	 */
	broadcast(event, data) {
		sendEvent(Array.from(this.players.keys()), event, data);
	}

	async start() {
		this.started_at = new Date();
		await sleep(2000);
		this.run();
	}

	async run() {
		while (true) {
			if (this.isEnded) {
				this.conclude();
				return;
			}
			const word = getRandomWord();
			this.broadcast('word', { word });
			console.log(`broadcasting ${word}`);

			await sleep(Math.random() * 2000 + 1500);
		}
	}

	async conclude() {
		const scoreMap = this.players.entries((k, v) => ({}));
		this.broadcast('conclude', { 'Omsin': 100, 'Elle': 50 });
	}
}