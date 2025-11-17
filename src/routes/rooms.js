const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("../db");

const collection = "rooms";
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

	const locker = req.body;

	db.collection(collection)
		.insertOne(locker)
		.then((result) => {
			res.status(201).json(result);
		})
		.catch((err) => {
			res.status(500).json({ err: "Could not create a new document" });
		});
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

router.patch("/:id", (req, res) => {
	// #swagger.description = 'Modify a room by id'

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
