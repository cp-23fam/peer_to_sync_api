const mongoose = require("mongoose");
const request = require("supertest");
const Room = require("../../src/models/room");
const User = require("../../src/models/user");
const bcrypt = require("bcryptjs");

const app = require("../app");

let uid = "6932d610707358af9b923b73";

jest.mock("../../src/middleware/auth", () => {
	const origin = jest.requireActual("../../src/middleware/auth");

	return {
		...origin,
		logged: (req, res, next) => {
			req.uid = "6932d610707358af9b923b73";
			next();
		},
	};
});

beforeEach(async () => {
	await mongoose.connect("mongodb://localhost:27017/peerstore-user-test");
	await User.insertOne({
		_id: uid,
		email: "self@example.com",
		username: "Cool username",
		password: bcrypt.hashSync("supersecretpassword"),
		imageUrl: `/images/${uid}`,
		friends: [],
		pending: [],
	});
});

afterEach(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

describe("GET /users", () => {
	const ids = [];

	beforeEach(async () => {
		for (let i = 0; i < 3; i++) {
			const id = new mongoose.Types.ObjectId();
			ids.push(id.toString());

			await User.insertOne({
				_id: ids[i],
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: bcrypt.hashSync("supersecretpassword"),
				imageUrl: `/images/${id}`,
				friends: [],
				pending: [],
			});
		}
	});

	it("should return user list when user is not friend or pending and is not self", async () => {
		const result = await request(app).get("/users");

		expect(result.body.length).toBe(3);
	});
});

describe("GET /users/self", () => {
	it("shoud return correct user informations", async () => {
		const result = await request(app).get("/users/self");

		expect(result.statusCode).toBe(200);
	});
});

describe("PUT /users/self", () => {
	it("should replace user informations with new values and encrypt password", async () => {
		await request(app)
			.put("/users/self")
			.send({ username: "Bad username", password: "notsecretpassword" });

		const result = await User.findById(uid);

		expect(result.username).toBe("Bad username");
		expect(result.password).not.toBe("notsecretpassword");
	});
});
describe("GET /users/{id}", () => {
	const ids = [];

	beforeEach(async () => {
		for (let i = 0; i < 3; i++) {
			const id = new mongoose.Types.ObjectId();
			ids.push(id.toString());

			await User.insertOne({
				_id: ids[i],
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: bcrypt.hashSync("supersecretpassword"),
				imageUrl: `/images/${id}`,
				friends: [],
				pending: [],
			});
		}
	});

	it("should return correct user values when correctly prompted", async () => {
		const result = await request(app).get(`/users/${ids[0]}`);

		expect(result.body._id).toBe(ids[0]);
		expect(result.body.username).toBe("User 1");
		expect(result.body.imageUrl).toBe(`/images/${ids[0]}`);
	});
});

describe("GET /users/email/{email}", () => {
	const ids = [];

	beforeEach(async () => {
		for (let i = 0; i < 3; i++) {
			const id = new mongoose.Types.ObjectId();
			ids.push(id.toString());

			await User.insertOne({
				_id: ids[i],
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: "supersecretpassword",
				imageUrl: `/images/${id}`,
				friends: [],
				pending: [],
			});
		}
	});

	it("should return correct user values when correctly prompted", async () => {
		const result = await request(app).get(
			`/users/email/user-1@example.com`,
		);

		expect(result.body._id).toBe(ids[0]);
		expect(result.body.username).toBe("User 1");
		expect(result.body.imageUrl).toBe(`/images/${ids[0]}`);
		expect(result.body.friends).toStrictEqual([]);
		expect(result.body.pending).toStrictEqual([]);
	});
});

describe("POST /users/login", () => {
	it("should return status code 401 when email is unknown", async () => {
		const result = await request(app).post("/users/login").send({
			email: "thisisanunknownemail@example.com",
			password: "supersecretpassword",
		});

		expect(result.statusCode).toBe(401);
	});

	it("should return status code 401 when password is invalid", async () => {
		const result = await request(app).post("/users/login").send({
			email: "self@example.com",
			password: "wrongpassword",
		});

		expect(result.statusCode).toBe(401);
	});

	it("should return status code 200 with token when password is valid", async () => {
		const result = await request(app).post("/users/login").send({
			email: "self@example.com",
			password: "supersecretpassword",
		});

		expect(result.statusCode).toBe(200);
		expect(result.body).not.toBeNull();
	});
});

describe("POST /users/signup", () => {
	it("should return status code 201", async () => {
		const res = await request(app).post("/users/signup").send({
			email: "user-1@example.com",
			username: "User 1",
			password: "supersecretpassword",
		});

		expect(res.statusCode).toBe(201);
	});

	it("should fail if email already exists", async () => {
		const res = await request(app).post("/users/signup").send({
			email: "self@example.com",
			username: "Myself",
			password: "supersecretpassword",
		});

		expect(res.statusCode).toBe(422);
	});
});

// describe("POST /users/image", () => {});

describe("POST /users/image/reset", () => {
	it("shoud change imageUrl field with API and email as seed", async () => {
		await request(app).post("/users/image/reset");

		const result = await User.findById(uid);

		expect(result.imageUrl).toBe(
			`https://api.dicebear.com/9.x/shapes/png?seed=${result.email}`,
		);
	});
});

describe("GET /users/pending/list", () => {
	const pending = [];

	beforeEach(async () => {
		for (let i = 0; i < 2; i++) {
			const id = new mongoose.Types.ObjectId();
			pending.push(id.toString());

			await User.insertOne({
				_id: id,
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: bcrypt.hashSync("supersecretpassword"),
				imageUrl: `/images/${id}`,
				friends: [],
				pending: [],
			});
		}

		await User.findByIdAndUpdate(uid, {
			pending: pending,
		});
	});

	it("shoud return the lis of pending friends requests from the current user", async () => {
		const result = await request(app).get("/users/pending/list");

		expect(result.body.length).toBe(2);
	});
});

describe("GET /users/friends/list", () => {
	const friends = [];

	beforeEach(async () => {
		for (let i = 0; i < 3; i++) {
			const id = new mongoose.Types.ObjectId();
			friends.push(id.toString());

			await User.insertOne({
				_id: id,
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: bcrypt.hashSync("supersecretpassword"),
				imageUrl: `/images/${id}`,
				friends: [uid],
				pending: [],
			});
		}

		await User.findByIdAndUpdate(uid, {
			friends: friends,
		});
	});

	it("should return the list of friends from the current user", async () => {
		const result = await request(app).get("/users/friends/list");

		expect(result.body.length).toBe(3);
	});
});

describe("POST /users/friends/add", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();

		await User.insertOne({
			_id: id,
			email: `user-1@example.com`,
			username: `User 1`,
			password: bcrypt.hashSync("supersecretpassword"),
			imageUrl: `/images/${id}`,
			friends: [],
			pending: [],
		});
	});

	it("should add the current user id to the specified pending list", async () => {
		await request(app).post("/users/friends/add").send({
			email: "user-1@example.com",
		});

		const result = await User.findById(id.toString());

		expect(result.pending).toStrictEqual([uid]);
	});
});

describe("POST /users/friends/{id}/remove", () => {
	const friends = [];

	beforeEach(async () => {
		for (let i = 0; i < 3; i++) {
			const id = new mongoose.Types.ObjectId();
			friends.push(id.toString());

			await User.insertOne({
				_id: id,
				email: `user-${i + 1}@example.com`,
				username: `User ${i + 1}`,
				password: bcrypt.hashSync("supersecretpassword"),
				imageUrl: `/images/${id}`,
				friends: [uid],
				pending: [],
			});
		}

		await User.findByIdAndUpdate(uid, {
			friends: friends,
		});
	});

	it("should remove specified user from current user friends list", async () => {
		await request(app).post(`/users/friends/${friends[1]}/remove`);

		const result = await User.findById(uid);

		expect(result.friends).toStrictEqual([friends[0], friends[2]]);
	});
});

describe("POST /users/friends/{id}/accept", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();

		await User.insertOne({
			_id: id,
			email: `user-1@example.com`,
			username: `User 1`,
			password: bcrypt.hashSync("supersecretpassword"),
			imageUrl: `/images/${id}`,
			friends: [],
			pending: [],
		});
	});

	it("should move the specified id from pending to friends on current user", async () => {
		await request(app).post(`/users/friends/${id.toString()}/accept`);

		const result = await User.findById(uid);

		expect(result.friends).toStrictEqual([id.toString()]);
	});
});

describe("POST /users/friends/{id}/reject", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();

		await User.insertOne({
			_id: id,
			email: `user-1@example.com`,
			username: `User 1`,
			password: bcrypt.hashSync("supersecretpassword"),
			imageUrl: `/images/${id}`,
			friends: [],
			pending: [],
		});
	});

	it("should remove the specified id from pending list of current user", async () => {
		await request(app).post(`/users/friends/${id.toString()}/reject`);

		const result = await User.findById(uid);

		expect(result.pending).toStrictEqual([]);
	});
});
