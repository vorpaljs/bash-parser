'use strict';

const {eof} = require('../../../../utils/tokens');

module.exports = function end() {
	return {
		nextReduction: null,
		tokensToEmit: [eof()]
	};
};
