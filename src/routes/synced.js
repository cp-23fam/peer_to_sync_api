const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/synced");

router.get(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Fetch a synced room'
	// #swagger.security = [{"userToken": []}]

	"/:id",

	auth.logged,
	auth.isInSynced,
	controller.get,
);

router.put(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Get changes from local to remote state'
	// #swagger.security = [{"userToken": []}]

	/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/SyncedRoom"}
            }
        }
    } */

	"/:id/changes",

	auth.logged,
	auth.isInSynced,
	controller.getChanges,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Create a synced room'
	// #swagger.security = [{"userToken": []}]

	/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/NewSyncedRoom"}
            }
        }
    } */

	"/",

	auth.logged,
	controller.post,
);

router.patch(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Start a synced room'
	// #swagger.security = [{"userToken": []}]

	"/:id/start",

	auth.logged,
	auth.isInSynced,
	controller.start,
);

router.patch(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Tell the server you\'re notified'
	// #swagger.security = [{"userToken": []}]

	"/:id/notified",

	auth.logged,
	auth.isInSynced,
	controller.notified,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Send an update request to all users'
	// #swagger.security = [{"userToken": []}]

	"/:id/notify",

	auth.logged,
	auth.isInSynced,
	controller.notifyUsers,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Send an update request to all users'
	// #swagger.security = [{"userToken": []}]

	/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/Object" }
            }
        }
    } */

	"/:id/add",

	auth.logged,
	auth.isInSynced,
	controller.addThis,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Send an update request to all users'
	// #swagger.security = [{"userToken": []}]

	/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/Object" }
            }
        }
    } */

	"/:id/edit/:index",

	auth.logged,
	auth.isInSynced,
	controller.editAt,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Send an update request to all users'
	// #swagger.security = [{"userToken": []}]

	"/:id/remove/:index",

	auth.logged,
	auth.isInSynced,
	controller.removeAt,
);

router.post(
	// #swagger.tags = ['Synced']
	// #swagger.description = 'Update the status of the synced room'
	// #swagger.security = [{"userToken": []}]

	/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/Status" }
            }
        }
    } */

	"/:id/status",

	auth.logged,
	auth.isInSynced,
	controller.changeStatus,
);

module.exports = router;
