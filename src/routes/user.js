const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");
const userController = require("../controllers/user");
const auth = require("../middleware/is-auth");

router.get(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Get current user infos'

	// #swagger.security = [{"userToken": []}]
	"/",
	auth.logged,
	userController.infos,
);

router.get(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Get current user infos'

	// #swagger.security = [{"userToken": []}]
	"/:id",
	auth.logged,
	userController.getUser,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Log in'

	"/login",

	userController.login,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Create a user'

	"/signup",
	[
		body("email")
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject("Email exists");
					}
				});
			})
			.normalizeEmail(),
	],
	userController.signup,
);

module.exports = router;
