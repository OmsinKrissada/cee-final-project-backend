import * as gameManager from "../logic/gameManager.js";
import Game from "../models/gameModel.js";
import { generateToken, uniformRandom as uniform } from "../utils.js";

async function getGames(includeEnded) {
	let game;
	if (includeEnded) {
		game = await Game.aggregate([
			{
				$unwind: "$players",
			},
			{
				$addFields: {
					convertedPlayerId: { $toObjectId: "$players.id" } // needed to do this cuz i store player id as string
				}
			},
			{
				$lookup: {
					from: "players",
					localField: "convertedPlayerId",
					foreignField: "_id",
					as: "playerDetails",
				},
			},
			{
				$unwind: "$playerDetails",
			},
			{
				$group: {
					_id: "$_id",
					start_timestamp: { $first: "$start_timestamp" },
					end_timestamp: { $first: "$end_timestamp" },
					status: { $first: "$status" },
					time_spent: { $first: "$time_spent" },
					words_success: { $first: "$words_success" },
					words_missed: { $first: "$words_missed" },
					owner: { $first: "$owner" },
					players: {
						$push: {
							id: "$players.id",
							score: "$players.score",
							nickname: "$playerDetails.nickname",
						},
					},
				},
			},
		]);
	}
	game = await Game.aggregate([
		{
			$match: {
				status: { $in: ['waiting', 'ongoing'] },
			},
		},
		{
			$unwind: "$players",
		},
		{
			$addFields: {
				convertedPlayerId: { $toObjectId: "$players.id" } // needed to do this cuz i store player id as string
			}
		},
		{
			$lookup: {
				from: "players",
				localField: "convertedPlayerId",
				foreignField: "_id",
				as: "playerDetails",
			},
		},
		{
			$unwind: "$playerDetails",
		},
		{
			$group: {
				_id: "$_id",
				start_timestamp: { $first: "$start_timestamp" },
				end_timestamp: { $first: "$end_timestamp" },
				status: { $first: "$status" },
				time_spent: { $first: "$time_spent" },
				words_success: { $first: "$words_success" },
				words_missed: { $first: "$words_missed" },
				owner: { $first: "$owner" },
				players: {
					$push: {
						id: "$players.id",
						score: "$players.score",
						nickname: "$playerDetails.nickname",
					},
				},
			},
		},
	]);

	return game.map(g => ({ ...g, id: g._id }));
}

export const listGames = async (req, res) => {
	const includeEnded = req.query.includeEnded == 'true';
	// !keep in mind, dont desync these
	// has both start and end time		= finished
	// has start but not end time		= ongoing
	// has neither start nor end time	= waiting
	const games = (await getGames(includeEnded));
	// return res.json({ ...games, players: games });
	return res.json(games);
};

export const createGame = async (req, res) => {
	const userId = req.userId;

	const existing = await Game.find({
		$or: [
			{ status: 'waiting' },
			{ status: 'ongoing' }
		],
		'players.id': userId
	});

	if (existing.length > 0) {
		return res.status(403).json({ error: 'cannot have more than one active game' });
	}

	// create logic
	await Game.create({
		start_timestamp: new Date(),
		players: [{ id: userId, score: 0 }],
		status: 'waiting',
		owner: userId,
	});

	res.status(201).json(await getGames());
	await announceLobbyUpdate();
};

export const joinGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.params.id;

	if (!gameId) return res.status(400).json({ error: 'missing game id' });

	const existing = await Game.find({
		$or: [
			{ status: 'waiting' },
			{ status: 'ongoing' }
		],
		'players.id': userId
	});

	if (existing.length > 0) {
		return res.status(403).json({ error: 'must leave current game to join another game' });
	}

	// join logic
	const player = { id: userId, score: 0 };
	await Game.updateOne({ _id: gameId }, { $push: { players: player } });

	res.json(await getGames());
	await announceLobbyUpdate();
};

export const leaveGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.params.id;

	if (!gameId) return res.status(400).json({ error: 'missing game id' });

	const game = await Game.findById(gameId);
	if (!game) return res.status(404).json({ error: `game with id ${gameId} not found` });
	if (game.status == 'ended') return res.status(403).json({ error: `cannot leave ended game` });

	game.players.remove({ id: userId });
	// assign a new random owner
	let deleted = false;
	if (game.owner == userId) {
		const remainingPlayers = game.players.filter(p => p.id != userId);
		if (remainingPlayers.length > 0) { game.owner = uniform(game.players.filter(p => p.id != userId)).id; }
		else {
			await game.deleteOne();
			deleted = true;
		}
	}

	if (!deleted) await game.save();

	res.json(await getGames());
	await announceLobbyUpdate();
};

export const startGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.params.id;

	if (!gameId) return res.status(400).json({ error: 'missing game id' });

	const game = await Game.findById(gameId);
	if (!game) return res.status(404).json({ error: `game with id ${gameId} not found` });
	if (game.status != 'waiting') return res.status(403).json({ error: `game is not startable` });
	if (game.owner != userId) return res.status(403).json({ error: `must be owner to start a game` });

	// TODO: fix potential race condition
	await gameManager.start(gameId, game.players.map(p => p.id));
	game.status = 'ongoing';
	await game.save();
	await announceLobbyUpdate();

	res.json(await getGames());
};

// SSE

const lobbyConnections = [];

async function announceLobbyUpdate() {
	const games = await getGames();
	lobbyConnections.forEach((res => {
		res.write(`event: update\ndata: ${JSON.stringify(games)}\n\n`);
	}));
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const lobbyStream = async (req, res) => {
	const headers = {
		"Content-Type": "text/event-stream",
		"Connection": "keep-alive",
		"Cache-Control": "no-cache",
	};
	res.writeHead(200, headers);

	lobbyConnections.push(res);
	console.log('lobby joined');
	const games = await getGames();
	res.write(`event: update\ndata: ${JSON.stringify(games)}\n\n`);

	req.on("close", () => {
		console.log('lobby left');
		const idx = lobbyConnections.indexOf(res);
		if (idx >= 0) {
			lobbyConnections.splice(idx, 1);
		}

		res.end();
	});
};


const playTokens = new Map();
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getPlayToken = async (req, res) => {
	const userId = req.userId;
	const activeGame = await Game.findOne({
		status: 'ongoing',
		'players.id': userId
	});
	if (!activeGame) {
		return res.status(403).json({ error: 'you are not in a game' });
	}
	const token = generateToken();
	playTokens.set(token, userId);
	res.json({ token });
};


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const gameStream = async (req, res) => {
	// const game = await Game.findById(gameId);
	// if (game?.status != 'ongoing') {
	// 	return res.status(404).json({ error: 'game does not exist or is not ongoing' });
	// }
	const token = req.params.token;
	if (!token) return res.status(401).send();

	const userId = playTokens.get(token);
	playTokens.delete(token);
	if (!userId) return res.status(403).send();

	const headers = {
		"Content-Type": "text/event-stream",
		"Connection": "keep-alive",
		"Cache-Control": "no-cache",
	};
	res.writeHead(200, headers);

	gameManager.connectionPool.push({ userId, res });
	console.log(`game joined: ${userId}`);

	req.on("close", () => {
		console.log(`game left: ${userId}`);
		const idx = gameManager.connectionPool.findIndex(({ userId: _userId, res: _res }) => _userId == userId && _res == res);
		if (idx >= 0) {
			gameManager.connectionPool.splice(idx, 1);
		}

		res.end();
	});
};
