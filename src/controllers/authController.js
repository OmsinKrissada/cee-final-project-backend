export const handleOAuthRedirect = async (req, res) => {
	const { code } = req.query;

	if (!code) return res.status(400).send('Missing code query');
	console.log(code);

	const REDIRECT_URI = 'http://localhost:3001/auth/redirect';

	const data = {
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': REDIRECT_URI,
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
	};
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const { access_token } = await fetch(`https://discord.com/api/oauth2/token`, { method: 'POST', headers, body: new URLSearchParams(data) }).then(r => r.json());

	// if (!access_token) return res.status(400).send('probably invalid code');
	if (!access_token) return res.redirect(process.env.FRONTEND_URL);

	// res.send(`Hello ${access_token}`);

	const user = await fetch('https://discord.com/api/users/@me', {
		headers: {
			'Authorization': `Bearer ${access_token}`
		}
	}).then(r => r.json());

	const nickname = user.global_name || user.username;
	console.log(nickname);
	res.send(`Hello ${nickname}`);
};
