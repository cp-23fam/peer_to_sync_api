require("dotenv").config({ quiet: true });

const bodyParser = require("body-parser");
const express = require("express");
const swagger = require("swagger-ui-express");

const swaggerOutput = require("../src/swagger_output.json");
const rooms = require("../src/routes/room");
const user = require("../src/routes/user");
const synced = require("../src/routes/synced");

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH,DELETE",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
	next();
});

app.use(express.json());
app.use(express.static("public"));

app.use("/rooms", rooms);
app.use("/users", user);
app.use("/synced", synced);
app.use("/doc", swagger.serve, swagger.setup(swaggerOutput));

// @ts-ignore
app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

module.exports = app;
