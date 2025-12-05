const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongoose").Types;
const multer = require("multer");

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const imageUrl = `https://api.dicebear.com/9.x/shapes/png?seed=${email}`;

	bcrypt
		.hash(password, 12)
		.then((hashedPwd) => {
			const user = new User({
				email: email,
				username: username,
				password: hashedPwd,
				imageUrl: imageUrl,
				friends: [],
				pending: [],
			});

			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				_id: result._id,
				email: result.email,
				username: result.username,
				imageUrl: result.imageUrl,
				friends: result.friends,
				pending: result.pending,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				errors.statusCode = 500;
			}
			next(err);
		});
};

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error("Unknown email");
				error.statusCode = 401;
				throw error;
			}

			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error("Wrong password");
				error.statusCode = 401;
				throw error;
			}

			const token = jwt.sign(
				{
					email: loadedUser.email,
					name: loadedUser.name,
					sub: loadedUser._id.toString(),
				},
				process.env.JWT_PRIVATE_KEY,
				{ expiresIn: "2w" },
			);

			res.status(200).json({ token: token });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}

			next(err);
		});
};

exports.sendImage = (req, res, next) => {
	User.updateOne(
		{ _id: new ObjectId(req.uid) },
		{ imageUrl: `http://localhost:3000/images/${req.uid}.png` },
	)
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.resetImage = async (req, res, next) => {
	const user = await User.findOne({ _id: new ObjectId(req.uid) });
	const imageUrl = `https://api.dicebear.com/9.x/shapes/png?seed=${user.email}`;
	User.updateOne({ _id: new ObjectId(req.uid) }, { imageUrl: imageUrl })
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.searchFriendList = async (req, res, next) => {
	const maxUsers = req.query.maxUsers ?? 15;
	const searchQuery = req.query.search ?? "";

	let users = [];

	const match = await User.find({
		$nor: [
			{ _id: new ObjectId(req.uid) },
			{ friends: { $in: req.uid } },
			{ pending: { $in: req.uid } },
		],
		email: { $regex: searchQuery, $options: "i" },
	}).limit(maxUsers);

	users.push(...match);

	res.status(200).json(users);
};

exports.infos = (req, res, next) => {
	User.findOne({ _id: req.uid })
		.then((doc) => {
			res.status(200).json({
				_id: doc._id,
				email: doc.email,
				username: doc.username,
				imageUrl: doc.imageUrl,
				friends: doc.friends,
				pending: doc.pending,
			});
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.getUser = (req, res, next) => {
	User.findOne({ _id: req.params.id })
		.then((doc) => {
			res.status(200).json({
				_id: doc._id,
				username: doc.username,
				imageUrl: doc.imageUrl,
				friends: doc.friends,
				pending: doc.pending,
			});
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.getUserByMail = (req, res, next) => {
	console.log(req.params);
	User.findOne({ email: req.params.email })
		.then((doc) =>
			res.status(200).json({
				_id: doc._id,
				username: doc.username,
				imageUrl: doc.imageUrl,
				friends: doc.friends,
				pending: doc.pending,
			}),
		)
		.catch((err) => {
			res.status(500).json(err);
		});
};

exports.friendsList = async (req, res, next) => {
	const user = await User.findOne({ _id: new ObjectId(req.uid) }).catch(
		(err) => {
			console.log(err);
			res.status(500).json({ error: "Error getting user" });
		},
	);

	const friends = [];

	for (const f of user.friends) {
		const friend = await User.findOne({ _id: new ObjectId(f) });

		friends.push({
			_id: friend._id,
			email: friends.email,
			username: friend.username,
			imageUrl: friend.imageUrl,
			friends: friend.friends,
			pending: [],
		});
	}

	res.status(200).json(friends);
};

exports.pendingList = async (req, res, next) => {
	const user = await User.findOne({ _id: new ObjectId(req.uid) }).catch(
		(err) => {
			console.log(err);
			res.status(500).json({ error: "Error getting user" });
		},
	);

	const friends = [];

	for (const f of user.pending) {
		const pending = await User.findOne({ _id: new ObjectId(f) });

		friends.push({
			_id: pending._id,
			email: pending.email,
			username: pending.username,
			imageUrl: pending.imageUrl,
			friends: pending.friends,
			pending: [],
		});
	}

	res.status(200).json(friends);
};

exports.addFriend = async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	const result = await User.updateOne(
		{ _id: user._id },
		{ $addToSet: { pending: req.uid } },
	);

	res.status(200).json(result);
};

exports.removeFriend = async (req, res, next) => {
	await User.updateOne(
		{ _id: new ObjectId(req.uid) },
		{
			$pull: { friends: req.params.id },
		},
	);

	await User.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{
			$pull: { friends: req.uid },
		},
	);

	res.sendStatus(200);
};

exports.acceptFriend = async (req, res, next) => {
	await User.updateOne(
		{ _id: new ObjectId(req.uid) },
		{
			$addToSet: { friends: req.params.id },
			$pull: { pending: req.params.id },
		},
	);

	await User.updateOne(
		{ _id: new ObjectId(req.params.id) },
		{
			$addToSet: { friends: req.uid },
		},
	);

	res.sendStatus(200);
};

exports.rejectFriend = (req, res, next) => {
	User.updateOne(
		{ _id: new ObjectId(req.uid) },
		{
			$pull: { pending: req.params.id },
		},
	).then((result) => {
		res.status(200).json(result);
	});
};
