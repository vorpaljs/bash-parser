'use strict';

const logger = name => function * (tokens) {
	console.log('logging ' + name);
	for (const tk of tokens) {
		console.log(
			name,
			tk
		);
		yield tk;
	}
};

module.exports = logger;
