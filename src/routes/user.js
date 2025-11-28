const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const User = require("../models/user");
const userController = require("../controllers/user");
const auth = require("../middleware/auth");

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
	// #swagger.description = 'Fetch user by id'

	// #swagger.security = [{"userToken": []}]
	"/:id",
	auth.logged,
	userController.getUser,
);

router.get(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Fetch user by email'

	// #swagger.security = [{"userToken": []}]
	"/email/:email",
	auth.logged,
	userController.getUserByMail,
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

router.get(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Get formated list of user friends'

	// #swagger.security = [{"userToken": []}]

	"/friends/list",
	auth.logged,
	userController.friendsList,
);

router.get(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Get formated list of user pending requests'

	// #swagger.security = [{"userToken": []}]

	"/pending/list",
	auth.logged,
	userController.pendingList,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Add a friend by email'

	// #swagger.security = [{"userToken": []}]

	"/friends/add",
	auth.logged,
	userController.addFriend,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Remove a friend by uid'

	// #swagger.security = [{"userToken": []}]

	"/friends/:id/remove",
	auth.logged,
	userController.removeFriend,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Accept a pending request'

	// #swagger.security = [{"userToken": []}]

	"/friends/:id/accept",
	auth.logged,
	userController.acceptFriend,
);

router.post(
	// #swagger.tags = ['Users']
	// #swagger.description = 'Reject a pending request'

	// #swagger.security = [{"userToken": []}]

	"/friends/:id/reject",
	auth.logged,
	userController.rejectFriend,
);

module.exports = router;
