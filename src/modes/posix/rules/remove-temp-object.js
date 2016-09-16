'use strict';

module.exports = function removeTempObject() {
	return function * (tokens) {
		for (const tk of tokens) {
			delete tk._;
			yield tk;
		}
	};
};

