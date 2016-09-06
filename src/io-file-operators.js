'use strict';

const ioFileOperators = module.exports = [
	'LESS',
	'DLESS',
	'DGREAT',
	'LESSAND',
	'GREATAND',
	'GREAT',
	'LESSGREAT',
	'CLOBBER'
];

ioFileOperators.isOperator = function isOperator(tk) {
	for (const op in ioFileOperators) {
		if (tk[op]) {
			return true;
		}
	}
};
