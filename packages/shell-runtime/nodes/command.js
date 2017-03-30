'use strict';

const {spawn} = require('child_process');
const fs = require('fs');
const pify = require('pify');

const open = pify(fs.open);

const isArgument = s => s.type === 'Word';
const isRedirection = s => s.type === 'Redirect';

module.exports = run;

const configureRedirection = stdio => async ({numberIo, op, file}) => {
	switch (op) {
		case '>': {
			const streamNumber = numberIo === undefined ? 1 : numberIo;

			if (/^\d+$/.test(file)) {
				stdio[streamNumber] = file;
			} else {
				const targetFile = await open(file, 'w');
				stdio[streamNumber] = targetFile;
			}
			break;
		}
		case '<': {
			const streamNumber = numberIo === undefined ? 0 : numberIo;

			if (/^\d+$/.test(file)) {
				stdio[streamNumber] = file;
			} else {
				const targetFile = await open(file, 'r');
				stdio[streamNumber] = targetFile;
			}
			break;
		}
		case '>>': {
			const streamNumber = numberIo === undefined ? 1 : numberIo;
			stdio[streamNumber] = await open(file, 'a');
			break;
		}
		default:
			throw new Error(`Unknown operator ${op}`);
	}
};

async function run({env = {}, cwd = process.cwd()} = {}) {
	const {
		name,
		prefix = [],
		suffix = []
	} = this;
	// filter arguments from suffix
	const args = suffix
		.filter(isArgument)
		.map(s => s.text);

	const stdio = [0, 1, 2];

	// filter redirections from suffix and prefix
	const redirections = suffix
		.filter(isRedirection)
		.concat(
			prefix
				.filter(isRedirection)
		);

	// apply redirections
	await Promise.all(redirections.map(configureRedirection(stdio)));

	const proc = spawn(
		name.text,
		args,
		{stdio, cwd, env}
	);

	return await new Promise(resolve =>
		proc.on('exit', resolve)
	);
}

