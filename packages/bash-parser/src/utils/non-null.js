'use strict';

const filter = require('./filter');

const nonNull = tk => {
	return tk !== null;
};

module.exports = filter(nonNull);
filter.predicate = nonNull;
