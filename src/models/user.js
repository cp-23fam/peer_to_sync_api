const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: false,
	},
	friends: {
		type: [String],
		required: true,
	},
	pending: {
		type: [String],
		required: true,
	},
});

module.exports = mongoose.model("User", userSchema);
