/* eslint-disable unicorn/no-process-exit */
const {readFile} = require('fs');

const path = process.cwd();
readFile(path + '/number', (err, exitCode) => {
	if (err) {
		console.error(err);
		return process.exit(-1);
	}
	process.exit(exitCode);
});

