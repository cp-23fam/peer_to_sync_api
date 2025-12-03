const Room = require("../models/room");
const { ObjectId } = require("mongoose").Types;

exports.list = (req, res, next) => {
	Room.find()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch(() => {
			res.status(500).json({ error: "Could not fetch the documents" });
		});
};

exports.get = (req, res, next) => {
	if (ObjectId.isValid(req.params.id)) {
		Room.findOne({ _id: new ObjectId(req.params.id) })
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

exports.post = (req, res) => {
	const room = new Room({
		name: req.body.name,
		hostId: req.body.hostId,
		users: [req.body.hostId],
		status: req.body.status,
		maxPlayers: Number(req.body.maxPlayers),
		visibility: req.body.visibility,
		password: req.body.password,
		type: req.body.type,
		redirectionId: req.body.redirectionId,
	});

	room.save()
		.then((result) => {
			res.status(201).json(result);
		})
		.catch((err) => {
			res.status(500).json({ err: err });
		});
};

exports.join = async (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		const room = await Room.findOne({
			_id: new ObjectId(req.params.id),
		});

		if (room.users.length == room.maxPlayers) {
			res.status(403).json({ error: "Room is full" });
			return;
		}

		if (room.password != "" && room.password != req.query.password) {
			res.status(401).json({ error: "Wrong password" });
			return;
		}

		const result = await Room.updateOne(
			{ _id: new ObjectId(req.params.id) },
			{ $addToSet: { users: req.uid } },
		).catch((err) => {
			console.log(err);
			res.status(500).json({ error: "User could not join room" });
		});

		res.status(200).json(result);
	} else {
		res.status(400).json({ error: "Not a valid document id" });
	}
};

exports.quit = (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		Room.updateOne(
			{ _id: new ObjectId(req.params.id) },
			{ $pull: { users: req.uid } },
		)
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: "User could not quit room" });
			});
	} else {
		res.status(400).json({ error: "Not a valid document id" });
	}
};

exports.kick = (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		Room.updateOne(
			{ _id: new ObjectId(req.params.id) },
			{ $pull: { users: req.params.uid } },
		)
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({
					error: "User could not get kicked from room",
				});
			});
	} else {
		res.status(400).json({ error: "Not a valid document id" });
	}
};

exports.delete = (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		Room.deleteOne({ _id: new ObjectId(req.params.id) })
			.then((result) => {
				res.status(204).json(result);
			})
			.catch((err) => {
				res.status(500).json({
					error: "Could not delete the document",
				});
			});
	} else {
		res.status(500).json({ error: "Not a valid document id" });
	}
};

exports.put = (req, res) => {
	const updates = req.body;
	if (ObjectId.isValid(req.params.id)) {
		Room.replaceOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				res.status(500).json({
					error: "Could not replace the document",
				});
			});
	} else {
		res.status(500).json({ error: "Not a valid document id" });
	}
};
