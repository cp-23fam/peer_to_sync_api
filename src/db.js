// @ts-check

const { MongoClient } = require("mongodb");
const { logger } = require("./utils/logger");

/**
 * @type {import("mongodb").Db}
 */
let dbConnection;

module.exports = {
	// @ts-ignore
	connectToDb: (cb) => {
		// @ts-ignore
		MongoClient.connect(process.env.CONNECTION_STRING)
			.then((client) => {
				dbConnection = client.db();
				return cb();
			})
			.catch((err) => {
				logger.error(err);
				return cb(err);
			});
	},
	getDb: () => dbConnection,
};
