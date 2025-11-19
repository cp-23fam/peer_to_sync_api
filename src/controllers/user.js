const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
	const imageUrl = req.body.imageUrl;

	bcrypt
		.hash(password, 12)
		.then((hashedPwd) => {
			const user = new User({
				email: email,
				username: username,
				password: hashedPwd,
				imageUrl: imageUrl,
			});

			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				message: "User created successfully",
				user: {
					email: result.email,
					username: result.username,
					uid: result._id,
				},
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
				const error = new Error("Unknown user");
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

exports.infos = (req, res, next) => {
	User.findOne({ _id: req.uid })
		.then((doc) => {
			res.status(200).json({
				_id: doc._id,
				email: doc.email,
				username: doc.username,
			});
		})
		.catch((err) => {
			res.status(500).json(err);
		});
};
