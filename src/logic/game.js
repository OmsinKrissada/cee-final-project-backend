import Game from "../models/gameModel.js";
import { sleep } from "../utils.js";
import { getRandomWord, sendEvent } from "./gameManager.js";

export class GameInstance {
	/** @type {Map<string, {nickname: string, score: number}>} */
	players = new Map();
	started_at = null;
	ended_at = null;

	// total_time_ms = 1000 * 20;
	total_time_ms = 1000 * 60 * 2;

	constructor(id, players) {
		this.id = id;
		this.players = new Map(players.map(p => [p.id, { nickname: p.nickname, score: 0 }]));
	}

	/**
	 * @param {string} event 
	 * @param {any} data 
	 */
	broadcast(event, data) {
		sendEvent(Array.from(this.players.keys()), event, data);
	}

	isEnded() {
		return this.total_time_ms - (new Date() - this.started_at) <= 0;
	}

	async start() {
		this.started_at = new Date();
		await sleep(2000);
		this.run();
		// setTimeout(() => {
		// 	this.isEnded = true;
		// }, this.total_time_ms);

		this.time_broadcast_interval = setInterval(() => {
			const remainingMs = this.total_time_ms - (new Date() - this.started_at);
			if (remainingMs < 0) return;
			this.broadcast('time_remaining', { seconds: Math.round(remainingMs / 1000) });
		}, 3000);
	}

	async run() {
		while (true) {
			if (this.isEnded()) {
				clearInterval(this.time_broadcast_interval);
				this.conclude();
				return;
			}
			const word = getRandomWord();
			this.broadcast('word', { word });
			console.log(`broadcasting ${word}`);

			await sleep(Math.random() * 2000 + 1000);
		}
	}

	getScoreMap() {
		const scoreMap = Array.from(this.players.entries()).map(([k, v]) => ({ id: k, ...v }));
		scoreMap.sort((a, b) => b.score - a.score);
		return scoreMap;
	}

	async handleSubmitWord(playerId, word) {
		const player = this.players.get(playerId);
		if (!player) console.error(`player with id ${playerId} supposed to be in game ${this.id}`);
		player.score += word.length;

		this.broadcast('score', this.getScoreMap());
	}

	async conclude() {
		console.log(`concluding game ${this.id}`);
		const scoreMap = this.getScoreMap();
		console.log(scoreMap);
		this.broadcast('conclude', scoreMap);

		console.log(`game id: ${this.id}`);
		await Game.updateOne({ _id: this.id }, {
			start_timestamp: this.started_at,
			end_timestamp: new Date(),
			status: 'ended',
			players: Array.from(this.players).map(p => ({ id: p[0], score: p[1].score }))
		});
		console.log('updated to db');
		this.callback();
	}

	onDestroy(callback) {
		this.callback = callback;
	}
}