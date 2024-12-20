import "dotenv/config";
import "./config/db.js";

import app from "./app.js";

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   console.log(err.stack);
//   process.exit(1);
// });

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
//   console.log(`${err}`);
//   // server.close(() => {
//   process.exit(1);
//   // });
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Server ready at http://localhost:${PORT}`);
});
