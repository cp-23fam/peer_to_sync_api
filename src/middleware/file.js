const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, "public/images");
	},
	filename: function (req, file, callback) {
		callback(null, req.uid + ".png");
	},
});

exports.mutler = multer({ storage: storage });

exports.saveFile = (req, res, next) => {
	if (!fs.existsSync("./public/images")) {
		fs.mkdirSync("./public/images");
	}

	this.mutler.array("image");
};
