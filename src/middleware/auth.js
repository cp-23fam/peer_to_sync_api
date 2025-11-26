const jwt = require("jsonwebtoken");
const Room = require("../models/room");
const { ObjectId } = require("mongoose").Types;

exports.logged = (req, res, next) => {
	const authHeader = req.get("Authorization");

	if (!authHeader) {
		const error = new Error("Not authenticated");
		error.statusCode = 401;
		throw error;
	}

	const token = authHeader.split(" ")[1];
	let decodedToken;

	try {
		decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}

	if (!decodedToken) {
		const error = new Error("Not authenticated");
		error.statusCode = 401;
		throw error;
	}

	req.uid = decodedToken.sub;
	next();
};

exports.isHost = async (req, res, next) => {
	const room = await Room.findOne({ _id: new ObjectId(req.params.id) });

	if (room.hostId != req.uid) {
		const error = new Error("Your're not the host of the room");
		error.statusCode = 401;
		throw error;
	}

	next();
};
