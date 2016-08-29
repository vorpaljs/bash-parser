const json = require('json5');
const {diff} = require('rus-diff');

exports.mkloc = function mkloc(startLine, startColumn, endLine, endColumn) {
	return {startLine, startColumn, endLine, endColumn};
};

exports.logDiff = function logDiff(expected, actual) {
	console.log(json.stringify(diff(actual, expected), null, 4));
};

exports.logResults = function logResults(results) {
	console.log(json.stringify(results, null, '\t').replace(/"/g, '\''));
};
