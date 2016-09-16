'use strict';

const hasOwnProperty = require('has-own-property');

module.exports = function copyTempObject(tk, newTk) {
	if (hasOwnProperty(tk, '_')) {
		newTk._ = tk._;
	}
	return newTk;
};
