const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./index.js"];

const doc = {
	securityDefinitions: {
		userToken: {
			type: "apiKey",
			in: "header",
			name: "Authorization",
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
			redirectionId: null,
		},
		User: {
			email: "",
			username: "",
			password: "",
			imageUrl: null,
		},
		Login: {
			email: "",
			password: "",
		},
		// 	LockerCondition: {
		// 		condition: false,
		// 		comments: null,
		// 		problems: null,
		// 	},
	},
};

swaggerAutogen(outputFile, endpointsFiles, doc);
