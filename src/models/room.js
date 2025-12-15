const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	hostId: {
		type: String,
		required: true,
	},
	users: {
		type: [String],
		required: true,
	},
	status: {
		type: String,
		required: true,
		enum: ["creating", "waiting", "playing"],
	},
	maxPlayers: {
		type: Number,
		required: true,
		min: 2,
		max: 100,
	},
	type: {
		type: String,
		required: true,
	},
	visibility: {
		type: String,
		required: true,
		enum: ["public", "friends", "private"],
	},
	password: {
		type: String,
		required: false,
	},
	redirectionId: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model("Room", roomSchema);
