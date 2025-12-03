const SyncedRoom = require("../models/synced_room");
const { ObjectId } = require("mongoose").Types;

exports.get = (req, res, next) => {
	if (ObjectId.isValid(req.params.id)) {
		SyncedRoom.findOne({ _id: new ObjectId(req.params.id) })
			.then((doc) => {
				res.status(200).json(doc);
			})
			.catch((err) => {
				res.status(500).json({ error: err });
			});
	} else {
		res.status(500).json({ error: "Not a valid document id" });
	}
};

exports.post = (req, res, next) => {
	const syncedRoom = new SyncedRoom({
		started: false,
		users: req.body.users,
		objects: [],
		status: req.body.status,
		userNotifyList: [],
	});

	syncedRoom
		.save()
		.then((result) => {
			res.status(201).json(result);
		})
		.catch((err) => {
			res.status(500).json({ err: err });
		});
};

exports.start = async (req, res, next) => {
	const synced = await SyncedRoom.findOne({
		_id: new ObjectId(req.params.id),
	});

	SyncedRoom.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ started: true, $addToSet: { userNotifyList: [...synced.users] } },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((e) => {
			res.status(500).json(e);
		});
};

exports.notified = (req, res, next) => {
	SyncedRoom.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ $pull: { userNotifyList: req.uid } },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.addThis = (req, res, next) => {
	SyncedRoom.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ $push: { objects: req.params.object } },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.removeAt = async (req, res, next) => {
	const synced = await SyncedRoom.findOne({
		_id: new ObjectId(req.params.id),
	});

	if (synced.objects.length > 0) {
		if (synced.objects[req.params.index] == req.body.object) {
			SyncedRoom.updateOne(
				{ _id: new ObjectId(req.params.id) },
				{ $pull: { objects: synced.objects[req.params.index] } },
			).then((result) => {
				res.status(200).json(result);
			});
		} else {
			res.sendStatus(409);
		}
	} else {
		res.sendStatus(202);
	}
};

exports.changeStatus = (req, res, next) => {
	SyncedRoom.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ status: req.body.status },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.notifyUsers = async (req, res, next) => {
	const synced = await SyncedRoom.findOne({
		_id: new ObjectId(req.params.id),
	});

	const userIndex = synced.users.indexOf(req.uid);
	synced.users = synced.users.splice(userIndex, 1);

	SyncedRoom.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{ $addToSet: { userNotifyList: [...synced.users] } },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.getChanges = async (req, res, next) => {
	const localSyncedRoom = new SyncedRoom({
		started: req.body.started,
		users: req.body.users,
		objects: req.body.objects,
		status: req.body.status,
		userNotifyList: req.body.userNotifyList,
	});

	const remoteSyncedRoom = await SyncedRoom.findOne({
		_id: new ObjectId(req.params.id),
	});

	res.status(200).json({
		started:
			localSyncedRoom.started == remoteSyncedRoom.started
				? null
				: remoteSyncedRoom.started,
		users:
			localSyncedRoom.users == remoteSyncedRoom.users
				? null
				: remoteSyncedRoom.users,
		objects:
			localSyncedRoom.objects == remoteSyncedRoom.objects
				? null
				: remoteSyncedRoom.objects,
		status:
			localSyncedRoom.status == remoteSyncedRoom.status
				? null
				: remoteSyncedRoom.status,
		userNotifyList:
			localSyncedRoom.userNotifyList == remoteSyncedRoom.userNotifyList
				? null
				: remoteSyncedRoom.userNotifyList,
	});
};
