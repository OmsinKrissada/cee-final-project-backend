import express from "express";

import * as authController from "../controllers/authController.js";

const router = express.Router();

router.get("/redirect", authController.handleOAuthRedirect);
// router.get("/logout", authController.logout);

export default router;
