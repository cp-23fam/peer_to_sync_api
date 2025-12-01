// @ts-check

require("dotenv").config({ quiet: true });

const bodyParser = require("body-parser");
const express = require("express");
const swagger = require("swagger-ui-express");
const mongoose = require("mongoose");

const swaggerOutput = require("./swagger_output.json");
const rooms = require("./routes/room");
const user = require("./routes/user");
const synced = require("./routes/synced");

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

app.use("/rooms", rooms);
app.use("/user", user);
app.use("/synced", synced);
app.use("/doc", swagger.serve, swagger.setup(swaggerOutput));

// @ts-ignore
app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	// @ts-ignore
	.connect(process.env.CONNECTION_STRING)
	.then((result) => {
		app.listen(3000, () =>
			console.log("Listening on http://localhost:3000"),
		);
	})
	.catch((err) => console.log(err));
