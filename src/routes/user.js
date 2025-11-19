const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");
const userController = require("../controllers/user");
const authMiddleware = require("../middleware/is-auth");

router.post(
	// #swagger.tags = ['Users']

	/* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
			schema: { $ref: '#/definitions/Login' }
    }  */

	"/login",

	userController.login,
);

router.put(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Create a user'

	/* #swagger.parameters['body'] = {
            in: 'body',
            description: 'New User',
            required: true,
            schema: { $ref: '#/definitions/User' }
    }  */

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
