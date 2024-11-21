import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    required: false,
  },

  // game-related
  total_score: {
    type: Number,
    required: true,
  },
  highest_score: {
    type: Number,
    required: true,
  },
  times_played: {
    type: Number,
    required: true,
  },
});

const Player = mongoose.model("Player", playerSchema);

export default Player;
