import Player from "../models/playerModel.js";

export const getNickname = async (req, res) => {
	const userId = req.userId;
	const player = await Player.findById(userId);
	return res.json({ nickname: player.nickname });
};

export const setNickname = async (req, res) => {
	const userId = req.userId;
	const player = await Player.findById(userId);

	const nickname = req.body.nickname;
	if (!nickname) return res.status(400).json({ error: 'nickname must not be empty' });
	await player.updateOne({ nickname });
	return res.json({ nickname: player.nickname });
};

export const getInfo = async (req, res) => {
	// probably won't be used
	const userId = req.userId;
	const player = await Player.findById(userId);
	return res.json({
		userId: player.id,
		nickname: player.nickname
	});
};