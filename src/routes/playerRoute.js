import express from "express";

import * as playerController from "../controllers/playerController.js";
import { authMiddleware } from "../controllers/authController.js";

const router = express.Router();

router.get("/nickname", authMiddleware, playerController.getNickname);
router.post("/nickname", authMiddleware, playerController.setNickname);
router.get('/info', authMiddleware, playerController.getInfo);
// router.get("/logout", playerController.logout);

export default router;
