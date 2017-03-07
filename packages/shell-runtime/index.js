'use strict';
const {spawn} = require('child_process');
const fs = require('fs');
const pify = require('pify');

const open = pify(fs.open);

const isArgument = s => s.type === 'Word';
const isRedirection = s => s.type === 'Redirect';

const RunVisitor = {
	Command(node) {
		return Object.assign(node, {}, {
			async run() {
				const {
					name,
					prefix = [],
					suffix = []
				} = node;

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
				await Promise.all(redirections.map(async ({numberIo, op, file}) => {
					const streamNumber = numberIo || 1;
					switch (op) {
						case '>':
							if (/^\d+$/.test(file)) {
								stdio[streamNumber] = file;
							} else {
								const targetFile = await open(file, 'w');
								stdio[streamNumber] = targetFile;
							}
							break;
						default:
							throw new Error(`Unknown operator ${op}`);
					}
				}));

				const proc = spawn(
					name.text,
					args,
					{stdio}
				);

				return proc;
			}
		});
	}
};

module.exports = RunVisitor;
