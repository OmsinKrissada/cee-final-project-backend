import Session from '../models/sessionModel.js';
import { generateToken } from '../utils.js';

export const authMiddleware = async (req, res, next) => {
	const token = req.header('Authorization').substring('Bearer '.length);

	const session = await Session.findOne({ token });
	if (!session) {
		return res.status(404).json({ error: 'user not found' });
	}

	const { userId } = session;
	console.log(`auth middleware found user ${userId} from session ${token}`);
	req.userId = userId;
	next();
};

export const handleOAuthLogin = async (req, res) => {
	const { code, redirect_uri } = req.body;
	console.log(req.body);

	if (!code) return res.status(400).json({ error: `Missing 'code' in body` });
	if (!redirect_uri) return res.status(400).json({ error: `Missing 'redirect_uri' in body` });

	const data = {
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': redirect_uri,
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
	};
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const discordResponse = await fetch(`https://discord.com/api/oauth2/token`, { method: 'POST', headers, body: new URLSearchParams(data) }).then(r => r.json()).catch(e => console.error(e));

	console.log(discordResponse);
	const { access_token } = discordResponse;
	if (!access_token) { return res.status(400).json({ error: 'probably invalid code' }); }
	// if (!access_token) return res.redirect(process.env.FRONTEND_URL);

	const user = await fetch('https://discord.com/api/users/@me', {
		headers: {
			'Authorization': `Bearer ${access_token}`
		}
	}).then(r => r.json());

	const nickname = user.global_name || user.username;
	console.log(nickname);

	const generatedToken = generateToken();

	// TODO: scaffold user data, replace user.id with mongo's id from player document

	await Session.create({ userId: user.id, token: generatedToken, type: 'discord', createdAt: new Date() });


	res.json({ token: generatedToken });
};

export const handleGuestLogin = async (req, res) => {

};