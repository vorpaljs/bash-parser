'use strict';

module.exports = function removeTempObject() {
	return function * (tokens) {
		for (const tk of tokens) {
			if (!Object.isFrozen(tk)) {
				throw new Error('NOT FROZEN:' + JSON.stringify(tk));
			}
			const newTk = Object.assign({}, tk);
			delete newTk._;
			Object.freeze(newTk);
			yield newTk;
		}
	};
};

