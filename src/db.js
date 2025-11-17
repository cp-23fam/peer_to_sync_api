// @ts-check

const { MongoClient } = require("mongodb");

/**
 * @type {import("mongodb").Db}
 */
let dbConnection;

module.exports = {
	// @ts-ignore
	connectToDb: (cb) => {
		MongoClient.connect("mongodb://localhost:27017/peerstore")
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
