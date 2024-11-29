import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
	start_timestamp: {
		type: Date,
		required: false,
	},
	end_timestamp: {
		type: Date,
		required: false,
	},

	status: {
		type: String,
		enum: ['waiting', 'ongoing', 'ended'],
		required: true,
	},

	owner: {
		type: String, // player id
		required: true,
	},

	players: {
		type: [{ id: String, score: Number }],
		required: true,
	},

	// time spent in seconds
	time_spent: {
		type: Number,
		required: false,
	},

	words_success: {
		type: [String],
		required: false,
	},
	words_missed: {
		type: [String],
		required: false,
	},
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
