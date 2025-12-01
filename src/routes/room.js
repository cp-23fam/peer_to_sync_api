const express = require("express");
const router = express.Router();

const controller = require("../controllers/room");
const auth = require("../middleware/auth");

router.get(
	"/",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Fetches the entire list of rooms available'

	controller.list,
);
router.get(
	"/:id",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Fetch a room by id'

	controller.get,
);

router.post(
	"/",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Create a room'
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	controller.post,
);

router.post(
	"/:id/join",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the specified User join the referenced room'
	/* #swagger.parameters['password'] = {
		description: 'Room password',
		required: false
	}	*/
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	controller.join,
);

router.post(
	"/:id/quit",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the User quit the referenced room'
	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	controller.quit,
);

router.post(
	"/:id/kick/:uid",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Make the specified User quit the referenced room'
	/* #swagger.parameters['id'] = {
		description: 'Room Id',
		required: true
	}	*/
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	auth.isHost,
	controller.kick,
);

router.delete(
	"/:id",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Delete a room by id'
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	auth.isHost,
	controller.delete,
);

router.put(
	"/:id",

	// #swagger.tags = ['Rooms']
	// #swagger.description = 'Replace a room by id'
	/* #swagger.requestBody = {
		required: true,
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/Room"
				}
			}
		}
	} */
	// #swagger.security = [{"userToken": []}]

	auth.logged,
	auth.isHost,
	controller.put,
);

module.exports = router;
