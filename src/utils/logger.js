exports.logger = {
	logLevel: 0,

	debug: function (message) {
		if (this.logLevel <= 0) {
			const now = new Date();

			console.debug(
				`\x1b[90m[debug] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
			);
		}
	},
	info: function (message) {
		if (this.logLevel <= 1) {
			const now = new Date();

			console.info(
				`\x1b[36m[info] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
			);
		}
	},
	warning: function (message) {
		if (this.logLevel <= 2) {
			const now = new Date();

			console.warn(
				// `\x1b[33m[warning] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
				`\x1b[35m[warning] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
			);
		}
	},
	error: function (message) {
		if (this.logLevel <= 3) {
			const now = new Date();

			console.error(
				`\x1b[31m[error] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
			);
		}
	},
	critical: function (message) {
		if (this.logLevel <= 4) {
			const now = new Date();

			console.error(
				// `\x1b[35m[critical] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
				`\x1b[33m[critical] | ${now.toLocaleTimeString()} ${now.getMilliseconds()}ms | ${message}\x1b[0m`,
			);
		}
	},
};
