import express from "express";

import words from "../resources/english_1k.json" with { type: "json" };

const router = express.Router();

router.get("/word/random", (req, res) => {
	res.json(words[Math.floor(Math.random() * words.length)]);
});

router.get("/word/:length", (req, res) => {
	const filtered = words.filter(w => w.length == req.params.length);
	res.json(filtered[Math.floor(Math.random() * filtered.length)]);
});

export default router;
