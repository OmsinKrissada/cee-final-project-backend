import express from "express";
import cors from "cors";

import AuthRoute from "./routes/authRoute.js";
import PlayerRoute from "./routes/playerRoute.js";

const app = express();

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow request from other origin (Frontend which is at different port)
app.use(cors());

// use routes
app.use("/auth", AuthRoute);
app.use("/player", PlayerRoute);

export default app;
