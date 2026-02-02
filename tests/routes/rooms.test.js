const mongoose = require("mongoose");
const request = require("supertest");
const Room = require("../../src/models/room");
const User = require("../../src/models/user");

const app = require("../app");

jest.mock("../../src/middleware/auth", () => {
	const origin = jest.requireActual("../../src/middleware/auth");

	return {
		...origin,
		logged: (req, res, next) => {
			req.uid = "user-1";
			next();
		},
		isHost: (req, res, next) => {
			next();
		},
		isInRoom: (req, res, next) => {
			next();
		},
	};
});

beforeEach(async () => {
	await mongoose.connect("mongodb://localhost:27017/peerstore-room-test");
});

afterEach(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
});

describe("GET /rooms", () => {
	const rooms = [
		{
			name: "Room 1",
			hostId: "user-1",
			users: ["user-1"],
			status: "waiting",
			maxPlayers: 4,
			type: "chatroom",
			visibility: "private",
			password: "mysecretpassword",
		},
		{
			name: "Room 2",
			hostId: "user-2",
			users: ["user-2", "user-3", "user-4"],
			status: "playing",
			maxPlayers: 3,
			type: "game",
			visibility: "friends",
			redirectionId: "synced-1",
		},
		{
			name: "Room 3",
			hostId: "user-5",
			users: ["user-5", "user-6"],
			status: "waiting",
			maxPlayers: 100,
			type: "game",
			visibility: "public",
		},
	];

	beforeEach(async () => {
		await Room.insertMany(rooms);
	});

	it("should return all products", async () => {
		const res = await request(app).get("/rooms");
		expect(res.statusCode).toBe(200);
		expect(res.body.length).toBe(rooms.length);
	});

	it("should return correct values", async () => {
		const res = await request(app).get("/rooms");

		for (let i = 0; i < rooms.length; i++) {
			expect(res.body[i].name).toBe(rooms[i].name);
			expect(res.body[i].hostId).toBe(rooms[i].hostId);
			expect(res.body[i].users).toStrictEqual(rooms[i].users);
			expect(res.body[i].status).toBe(rooms[i].status);
			expect(res.body[i].maxPlayers).toBe(rooms[i].maxPlayers);
			expect(res.body[i].type).toBe(rooms[i].type);
			expect(res.body[i].visibility).toBe(rooms[i].visibility);
			expect(res.body[i].redirectionId).toBe(rooms[i].redirectionId);
			expect(res.body[i].password).toBe(rooms[i].password);
		}
	});
});

describe("GET /rooms/{id}", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();

		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: "user-1",
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});
	});

	it("should return code 200 with valid id", async () => {
		const res = await request(app).get(`/rooms/${id}`);
		expect(res.statusCode).toBe(200);
	});

	it("should return code 500 with invalid id", async () => {
		const res = await request(app).get(`/rooms/abcdef`);
		expect(res.statusCode).toBe(500);
	});
});

describe("POST /rooms", () => {
	it("should return code 201 if authenticated", async () => {
		const res = await request(app).post("/rooms").send({
			name: "Room 4",
			hostId: "user-7",
			status: "waiting",
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});

		expect(res.statusCode).toBe(201);
	});

	it("should add one room to the list", async () => {
		await request(app).post("/rooms").send({
			name: "Room 4",
			hostId: "user-7",
			status: "waiting",
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});

		const res = await request(app).get("/rooms");

		expect(res.body.length).toBe(1);
	});
});

describe("DELETE /rooms/{id}", () => {
	let room;

	beforeEach(async () => {
		room = await Room.insertOne({
			name: "My room",
			status: "waiting",
			hostId: "user-1",
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});
	});

	it("should remove the room from the list", async () => {
		const res = await request(app).delete(`/rooms/${room._id.toString()}`);

		expect(res.statusCode).toBe(204);
	});
});

describe("PUT /rooms/{id}", () => {
	let room;

	beforeEach(async () => {
		room = await Room.insertOne({
			name: "My room",
			status: "waiting",
			hostId: "user-1",
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});
	});

	it("should modify the room with the correct values", async () => {
		const modifiedRoom = {
			name: "My room",
			status: "waiting",
			hostId: "user-1",
			users: ["user-1"],
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		};

		const res = await request(app)
			.put(`/rooms/${room._id.toString()}`)
			.send(modifiedRoom);

		expect(res.statusCode).toBe(200);

		const result = await Room.findById(room._id.toString());

		expect(result.name).toBe(modifiedRoom.name);
		expect(result.hostId).toBe(modifiedRoom.hostId);
		expect(result.users).toStrictEqual(modifiedRoom.users);
		expect(result.status).toBe(modifiedRoom.status);
		expect(result.maxPlayers).toBe(modifiedRoom.maxPlayers);
		expect(result.type).toBe(modifiedRoom.type);
		expect(result.visibility).toBe(modifiedRoom.visibility);
		expect(result.redirectionId).toBe(modifiedRoom.redirectionId);
		expect(result.password).toBe(modifiedRoom.password);
	});
});

describe("POST /rooms/{id}/join", () => {
	let id;
	let hostId;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();
		hostId = new mongoose.Types.ObjectId();

		await User.insertOne({
			_id: hostId,
			email: "user2@example.com",
			username: "User 2",
			password: "mysupersecretpassword",
			imageUrl: "abcd",
			friends: [],
			pending: [],
		});
	});

	it("should add uid of logged user into the room user list", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: hostId,
			users: [hostId],
			maxPlayers: 10,
			visibility: "public",
			type: "game",
		});

		await request(app).post(`/rooms/${id}/join`);

		const room = await Room.findById(id.toString());
		expect(room.users.length).toBe(2);
	});

	it("should return status code 403 when room is full", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: hostId,
			users: [hostId, "user-3"],
			maxPlayers: 2,
			visibility: "public",
			type: "game",
		});

		const result = await request(app).post(`/rooms/${id}/join`);

		expect(result.statusCode).toBe(403);
	});

	it("should return status code 403 when visibility is friends and user is not in friends list", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: hostId,
			users: [hostId, "user-3"],
			maxPlayers: 10,
			visibility: "friends",
			type: "game",
		});

		const result = await request(app).post(`/rooms/${id}/join`);

		expect(result.statusCode).toBe(403);
	});

	it("should return status code 401 when visibility is private and password is incorrect", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: hostId,
			users: [hostId],
			maxPlayers: 10,
			visibility: "private",
			password: "supersecretpassword",
			type: "game",
		});

		const result = await request(app).post(
			`/rooms/${id}/join?password=mypassword`,
		);

		expect(result.statusCode).toBe(401);
	});

	it("should return status code 400 when id is not valid", async () => {
		const result = await request(app).post(`/rooms/wrongid/join`);

		expect(result.statusCode).toBe(400);
	});
});
describe("POST /rooms/{id}/quit", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();
	});

	it("should remove the current user from the room user list", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: "user-2",
			users: ["user-2", "user-1"],
			maxPlayers: 10,
			visibility: "private",
			password: "supersecretpassword",
			type: "game",
		});

		await request(app).post(`/rooms/${id}/quit`);

		const result = await Room.findById(id.toString());

		expect(result.users).toStrictEqual(["user-2"]);
	});

	it("should return status code 400 when id is not valid", async () => {
		const result = await request(app).post(`/rooms/wrongid/quit`);

		expect(result.statusCode).toBe(400);
	});
});
describe("POST /rooms/{id}/kick/{uid}", () => {
	let id;

	beforeEach(async () => {
		id = new mongoose.Types.ObjectId();
	});

	it("should remove the specified uid from the room user list", async () => {
		await Room.insertOne({
			_id: id,
			name: "My room",
			status: "waiting",
			hostId: "user-2",
			users: ["user-2", "user-1"],
			maxPlayers: 10,
			visibility: "private",
			password: "supersecretpassword",
			type: "game",
		});

		await request(app).post(`/rooms/${id}/kick/user-2`);

		const result = await Room.findById(id.toString());

		expect(result.users).toStrictEqual(["user-1"]);
	});

	it("should return status code 400 when id is not valid", async () => {
		const result = await request(app).post(`/rooms/wrongid/kick/wronguser`);

		expect(result.statusCode).toBe(400);
	});
});
