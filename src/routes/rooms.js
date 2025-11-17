const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("../db");

const collection = "rooms";

/**
 * @type {import("mongodb").Db}
 */
let db;

connectToDb((/** @type {any} */ err) => {
	if (!err) {
		db = getDb();
	}
});

router.use("/", (req, res, next) => {
	/*
        #swagger.tags = ['Rooms']
   */

	next();
});

router.get("/", (req, res) => {
	// #swagger.description = 'Fetches the entire list of rooms available'

	const rooms = [];

	db.collection(collection)
		.find()
		.forEach((room) => rooms.push(room))
		.then(() => {
			res.status(200).json(rooms);
		})
		.catch(() => {
			res.status(500).json({ error: "Could not fetch the documents" });
		});
});

router.get("/:id", (req, res) => {
	// #swagger.description = 'Fetch a room by id'

	if (ObjectId.isValid(req.params.id)) {
		db.collection(collection)
			.findOne({ _id: new ObjectId(req.params.id) })
			.then((doc) => {
				res.status(200).json(doc);
			})
			.catch((err) => {
				res.status(500).json({ error: "Could not fetch the document" });
			});
	} else {
		res.status(500).json({ error: "Not a valid document id" });
	}
});

router.post("/", (req, res) => {
	// #swagger.description = 'Create a room'

	/* #swagger.parameters['body'] = {
            in: 'body',
            description: 'New Room',
            required: true,
            schema: { $ref: '#/definitions/Room' }
    }  */

	const room = req.body;

	db.collection(collection)
		.insertOne(room)
		.then((result) => {
			res.status(201).json(result);
		})
		.catch((err) => {
			res.status(500).json({ err: "Could not create a new document" });
		});
});

router.patch("/:id/join/:user", async (req, res) => {
	// #swagger.description = 'Make the specified User join the referenced room'

	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/

	/* #swagger.parameters['user'] = {
		description: 'User Id',
		required: true
	}	*/

	if (ObjectId.isValid(req.params.id)) {
		db.collection(collection)
			.updateOne(
				{ _id: new ObjectId(req.params.id) },
				{ $addToSet: { users: req.params.user } },
			)
			.then((result) => {
				res.status(201).json(result);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: "User could not join room" });
			});
	} else {
		res.status(400).json({ error: "Not a valid document id" });
	}
});

router.patch("/:id/quit/:user", (req, res) => {
	// #swagger.description = 'Make the specified User quit the referenced room'

	/* #swagger.parameters['id'] = {
		in: 'query',
		description: 'Room Id',
		required: true
	}	*/

	/* #swagger.parameters['userId'] = {
		in: 'query',
		description: 'User Id',
		required: true
	}	*/

	if (ObjectId.isValid(req.params.id)) {
		db.collection(collection)
			.updateOne(
				{ _id: new ObjectId(req.params.id) },
				{ $pull: { users: req.params.user } },
			)
			.then((result) => {
				res.status(201).json(result);
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: "User could not quit room" });
			});
	} else {
		res.status(400).json({ error: "Not a valid document id" });
	}
});

router.delete("/:id", (req, res) => {
	// #swagger.description = 'Delete a room by id'

	if (ObjectId.isValid(req.params.id)) {
		db.collection(collection)
			.deleteOne({ _id: new ObjectId(req.params.id) })
			.then((result) => {
				res.status(200).json(result);
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

router.put("/:id", (req, res) => {
	// #swagger.description = 'Replace a room by id'

	const updates = req.body;
	if (ObjectId.isValid(req.params.id)) {
		db.collection(collection)
			.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
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

module.exports = router;
