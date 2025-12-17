const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./index.js"];

const doc = {
	securityDefinitions: {
		userToken: {
			type: "http",
			scheme: "bearer",
		},
	},
	components: {
		schemas: {
			RoomStatus: {
				"@enum": ["waiting", "playing"],
			},
			RoomType: {
				"@enum": ["game", "collab"],
			},
			RoomVisibility: {
				"@enum": ["public", "friends", "private"],
			},
			Object: {
				object: "any",
			},
			Status: {
				status: "any",
			},
		},
	},
	definitions: {
		Room: {
			name: "",
			hostId: "",
			users: [],
			status: { $ref: "#/components/schemas/RoomStatus" },
			maxPlayers: 0,
			type: { $ref: "#/components/schemas/RoomType" },
			visibility: { $ref: "#/components/schemas/RoomVisibility" },
			password: null,
			redirectionId: null,
		},
		User: {
			email: "",
			username: "",
			password: "",
			friends: [],
			pending: [],
			imageUrl: null,
		},
		Login: {
			email: "",
			password: "",
		},
		SyncedRoom: {
			started: false,
			users: [],
			objects: [],
			status: "any",
			userNotifyList: [],
		},
		NewSyncedRoom: {
			name: "",
			status: "",
			users: [],
			type: "",
		},
	},
};

swaggerAutogen(outputFile, endpointsFiles, doc);
