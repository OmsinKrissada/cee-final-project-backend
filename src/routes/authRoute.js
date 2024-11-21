import express from "express";

import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login/discord", authController.handleOAuthLogin);
router.post("/login/guest", authController.handleGuestLogin);
// router.get("/logout", authController.logout);

export default router;
