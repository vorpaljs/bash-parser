'use strict';

const logger = name => () => function * (tokens) {
	for (const tk of tokens) {
		if (!tk) {
			console.log(`In ${name} token null.`);
		}
		console.log(
			name,
			'<<<',
			tk,
			'>>>'
		);
		yield tk;
	}
};

module.exports = logger;
