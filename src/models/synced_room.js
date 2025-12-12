const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const syncedRoomSchema = new Schema({
	started: {
		type: Boolean,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	users: {
		type: [String],
		required: true,
	},
	objects: {
		type: [],
		required: true,
		default: [],
	},
	status: {
		type: Object,
		required: true,
	},
	userNotifyList: {
		type: [String],
		required: true,
		default: [],
	},
	expirationTimestamp: {
		type: Number,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("SyncedRoom", syncedRoomSchema);
