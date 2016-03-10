'use strict';

const end = require('./end');
const operator = require('./operator');
const comment = require('./comment');
const singleQuoting = require('./single-quoting');
const doubleQuoting = require('./double-quoting');
const expansionStart = require('./expansion-start');
const expansionCommandTick = require('./expansion-command-tick');
const start = require('./start');
const expansionArithmetic = require('./expansion-arithmetic');
const expansionSpecialParameter = require('./expansion-special-parameter');
const expansionParameter = require('./expansion-parameter');
const expansionCommandOrArithmetic = require('./expansion-command-or-arithmetic');
const expansionParameterExtended = require('./expansion-parameter-extended');

module.exports = {
	end,
	operator,
	comment,
	singleQuoting,
	doubleQuoting,
	expansionStart,
	expansionCommandTick,
	start,
	expansionArithmetic,
	expansionSpecialParameter,
	expansionParameter,
	expansionCommandOrArithmetic,
	expansionParameterExtended
};
