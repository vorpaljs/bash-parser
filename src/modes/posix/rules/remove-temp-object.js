'use strict';

module.exports = function removeTempObject() {
	return function * (tokens) {
		for (const tk of tokens) {
			const newTk = Object.assign({}, tk);
			delete newTk._;
			yield newTk;
		}
	};
};

