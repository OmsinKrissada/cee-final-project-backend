import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: ['discord', 'guest'],
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
	},
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
