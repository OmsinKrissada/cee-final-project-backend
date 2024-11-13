import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
	start_timestamp: {
		type: Date,
		required: true,
	},
	end_timestamp: {
		type: Date,
		required: true,
	},

	players: {
		type: [Player],
		required: true,
	},

	// time spent in seconds
	time_spent: {
		type: Number,
		required: true,
	},

	words_success: {
		type: [String],
		required: true,
	},
	words_missed: {
		type: [String],
		required: true,
	},
});

const Player = mongoose.model("Player", playerSchema);

export default Player;
