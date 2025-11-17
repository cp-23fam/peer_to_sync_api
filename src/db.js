// @ts-check

require("dotenv").config();
const { MongoClient } = require("mongodb");

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
				console.log(err);
				return cb(err);
			});
	},
	getDb: () => dbConnection,
};
