const json = require('json5');
const diff = require('rus-diff').diff;
const tokens = require('../src/utils/tokens');



exports.mkloc = function mkloc(startLine, startColumn, endLine, endColumn) {
	return {startLine, startColumn, endLine, endColumn};
};

exports.logDiff = function logDiff(expected, actual) {
	console.log(json.stringify(diff(actual, expected), null, 4));
};

exports.logResults = function logResults(results) {
	console.log(json.stringify(results, null, '\t').replace(/"/g, '\''));
};

exports.checkResults = function check(t, actual, expected) {
	/* if (Array.isArray(actual)) {
		for (const item of actual) {
			console.log(item.constructor.name)
			if (item.constructor.name === 'Token') {
				console.log('tttt')
				Object.defineProperty(item, item.type, {
					enumerable: true,
					get() {
						const s = stack()[1];

						if (s.getFileName() !== '/Users/parroit/Desktop/repos/bash-parser/src/utils/tokens.js' &&
							s.getFileName() !== '/Users/parroit/Desktop/repos/bash-parser/src/modes/posix/rules/default-node-type.js')
								console.log(`${count++}: ${this.type} is deprectaed. Used ${s.getFileName()}:${s.getLineNumber()}`);
						return item.value;
					}
				});
			}

		}
	}*/
	t.deepEqual(actual, expected);
};
