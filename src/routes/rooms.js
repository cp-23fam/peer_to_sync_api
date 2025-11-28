const express = require("express");
const { ObjectId } = require("mongoose").Types;
const router = express.Router();

const Room = require("../models/room");
const auth = require("../middleware/auth");

router.get("/", (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Fetches the entire list of rooms available'

	Room.find()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch(() => {
			res.status(500).json({ error: "Could not fetch the documents" });
		});
});

router.get("/:id", (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Fetch a room by id'

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
});

router.post("/", auth.logged, (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Create a room'

	// #swagger.security = [{"userToken": []}]

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
});

router.post("/:id/join", auth.logged, async (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the specified User join the referenced room'

	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/

	// #swagger.security = [{"userToken": []}]

	if (ObjectId.isValid(req.params.id)) {
		const room = await Room.findOne({
			_id: new ObjectId(req.params.id),
		});

		if (room.users.length == room.maxPlayers) {
			res.status(403).json({ error: "Room is full" });
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
});

router.post("/:id/quit", auth.logged, (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the User quit the referenced room'

	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/

	// #swagger.security = [{"userToken": []}]

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
});

router.post("/:id/kick/:uid", auth.logged, auth.isHost, (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the specified User quit the referenced room'

	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/

	// #swagger.security = [{"userToken": []}]

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
});

router.delete("/:id", auth.logged, auth.isHost, (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Delete a room by id'

	// #swagger.security = [{"userToken": []}]

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
});

router.patch("/:id", (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Replace a room by id'

	// #swagger.security = [{"userToken": []}]

	const updates = req.body;
	if (ObjectId.isValid(req.params.id)) {
		Room.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				res.status(500).json({
					error: "Could not update the document",
				});
			});
	} else {
		res.status(500).json({ error: "Not a valid document id" });
	}
});

router.put("/:id", (req, res) => {
	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Replace a room by id'

	// #swagger.security = [{"userToken": []}]

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
});

module.exports = router;
