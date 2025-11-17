const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./index.js"];

const doc = {
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
		// 	Student: {
		// 		gendertitle: "",
		// 		name: "",
		// 		surname: "",
		// 		job: "",
		// 		caution: 0,
		// 		formationyear: 0,
		// 		login: "",
		// 	},
		// 	LockerCondition: {
		// 		condition: false,
		// 		comments: null,
		// 		problems: null,
		// 	},
	},
};

swaggerAutogen(outputFile, endpointsFiles, doc);
