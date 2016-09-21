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
	for (const op of ioFileOperators) {
		if (tk.type === op) {
			return true;
		}
	}
	return false;
};
