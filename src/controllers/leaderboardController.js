import Game from "../models/gameModel.js";
import Player from "../models/playerModel.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getOverall = async (req, res) => {
	const games = await Game.find({ status: 'ended' });

	const scoreMap = new Map();
	const nicknameMap = new Map();

	for (const game of games) {
		for (const player of game.players) {
			const old = scoreMap.get(player.id);
			if (old) {
				scoreMap.set(player.id, old + player.score);
			} else if (player.score > 0) {
				scoreMap.set(player.id, player.score);
			}
		}
	}

	const players = await Player.find();
	for (const player of players) {
		nicknameMap.set(player.id, player.nickname);
	}

	const scores = Array.from(scoreMap).map(s => ({ id: s[0], nickname: nicknameMap.get(s[0]), score: s[1] }));
	scores.sort((a, b) => b.score - a.score);
	return res.json(scores);
};


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getHighest = async (req, res) => {
	const games = await Game.find({ status: 'ended' });

	const scoreMap = new Map();
	const nicknameMap = new Map();

	for (const game of games) {
		for (const player of game.players) {
			const old = scoreMap.get(player.id);
			if (old) {
				scoreMap.set(player.id, Math.max(old, player.score));
			} else if (player.score > 0) {
				scoreMap.set(player.id, player.score);
			}
		}
	}

	const players = await Player.find();
	for (const player of players) {
		nicknameMap.set(player.id, player.nickname);
	}

	const scores = Array.from(scoreMap).map(s => ({ id: s[0], nickname: nicknameMap.get(s[0]), score: s[1] }));
	scores.sort((a, b) => b.score - a.score);
	return res.json(scores);
};
