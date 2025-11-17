// @ts-check

const express = require("express");
const swagger = require("swagger-ui-express");

const swaggerOutput = require("./swagger_output.json");
const rooms = require("./routes/rooms");

const { connectToDb } = require("./db");

const app = express();
app.use(express.json());

app.use("/rooms", rooms);
app.use("/doc", swagger.serve, swagger.setup(swaggerOutput));

connectToDb((/** @type {any} */ err) => {
	if (!err) {
		app.listen(3000, () => {
			console.log("app listening on http://localhost:3000");
		});
	}
});
