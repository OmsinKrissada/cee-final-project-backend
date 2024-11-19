import express from "express";

import * as playerController from "../controllers/playerController.js";

const router = express.Router();

router.get("/nickname", playerController.getNickname);
// router.get("/logout", playerController.logout);

export default router;
