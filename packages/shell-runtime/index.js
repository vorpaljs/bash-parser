'use strict';
const command = require('./nodes/command');

const RunVisitor = {
	Command(node) {
		return Object.assign({}, node, {run: command});
	}
};

module.exports = RunVisitor;
