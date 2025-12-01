const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const syncedRoomSchema = new Schema({
	started: {
		type: Boolean,
		required: true,
	},
	users: {
		type: [String],
		required: true,
	},
	objects: {
		type: [],
		required: true,
	},
	status: {
		type: Object,
		required: true,
	},
	userNotifyList: {
		type: [String],
		required: true,
	},
});

module.exports = mongoose.model("SyncedRoom", syncedRoomSchema);
