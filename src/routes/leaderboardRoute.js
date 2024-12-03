import express from "express";

import * as leaderboardController from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/overall", leaderboardController.getOverall);
router.get("/highest", leaderboardController.getHighest);

export default router;
