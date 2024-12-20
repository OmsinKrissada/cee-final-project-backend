import express from "express";

import * as gameController from "../controllers/gameController.js";
import { authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.get("/list", gameController.listGames);
router.post("/", authMiddleware, gameController.createGame);
// no deleting atm
// router.delete('/:id', authMiddleware, gameController.deleteGame);
router.put("/join/:id", authMiddleware, gameController.joinGame);
router.put("/leave/:id", authMiddleware, gameController.leaveGame);
router.put("/start/:id", authMiddleware, gameController.startGame);

router.get('/stream/lobby', gameController.lobbyStream);

router.get('/playtoken', authMiddleware, gameController.getPlayToken);
router.get('/stream/play/:token', gameController.gameStream);
router.post("/type/:word", authMiddleware, gameController.wordSubmit);

export default router;
