import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	cookie: {
		type: String,
		required: true,
	}
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
