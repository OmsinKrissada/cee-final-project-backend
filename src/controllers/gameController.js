import Game from "../models/gameModel.js";
import Player from "../models/playerModel.js";
import { uniformRandom as uniform } from "../utils.js";

async function getGames(includeEnded) {
	if (includeEnded) {
		return await Game.aggregate([
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
	return await Game.aggregate([
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

export const listGames = async (req, res) => {
	const includeEnded = req.query.includeEnded == 'true';
	// !keep in mind, dont desync these
	// has both start and end time		= finished
	// has start but not end time		= ongoing
	// has neither start nor end time	= waiting
	const games = await getGames(includeEnded);
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

	return res.status(201).json(await getGames());
};

export const joinGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.path.id;

	if (!gameId) return res.status(400).send('missing game id');

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
	await Game.updateOne({ id: gameId }, { $push: { players: player } });

	return res.json(await getGames());
};

export const leaveGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.path.id;

	if (!gameId) return res.status(400).send('missing game id');

	const game = await Game.findById(gameId);
	if (!game) return res.status(404).json({ error: `game with id ${gameId} not found` });
	if (game.status != 'waiting') return res.status(403).json({ error: `cannot leave when game is already started` });

	game.players.remove({ id: userId });
	// assign a new random owner
	if (game.owner == userId) {
		// TODO: check actual behavior, is the player really removed from game.players before commit?
		game.owner = uniform(game.players).id;
	}

	await game.save();

	return res.json(await getGames());
};

export const startGame = async (req, res) => {
	const userId = req.userId;
	const gameId = req.path.id;

	if (!gameId) return res.status(400).send('missing game id');

	const game = await Game.findById(gameId);
	if (!game) return res.status(404).json({ error: `game with id ${gameId} not found` });
	if (game.status != 'waiting') return res.status(403).json({ error: `game is not startable` });
	if (game.owner != userId) return res.status(403).json({ error: `must be owner to start a game` });

	// TODO: fix potential race condition
	gameManager.start(gameId);
	game.status = 'ongoing';
	await game.save();

	return res.json(await getGames());
};