'use strict';

const eof = require('../../../../utils/tokens').eof;

module.exports = function end() {
	return {
		nextReduction: null,
		tokensToEmit: [eof()]
	};
};
