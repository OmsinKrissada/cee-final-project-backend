export const getNickname = async (req, res) => {
	return res.json({ nickname: 'Someone' });
};

export const getInfo = async (req, res) => {
	let userId = req.userId;
	console.log('your info here');
};