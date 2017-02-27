'use strict';
const {spawn} = require('child_process');

const isArgument = s => s.type === 'Word';
const isRedirection = s => s.type === 'Redirect';

const RunVisitor = {
	Command(node) {
		return Object.assign(node, {}, {
			run() {
				const {
					name,
					prefix = [],
					suffix = []
				} = node;

				const args = suffix
					.filter(isArgument)
					.map(s => s.text);

				const redirections = suffix
					.filter(isRedirection)
					.concat(
						prefix
							.filter(isRedirection)
					);

				console.log({redirections})
				return spawn(
					name.text,
					args
				);
			}
		});
	}
};

module.exports = RunVisitor;
