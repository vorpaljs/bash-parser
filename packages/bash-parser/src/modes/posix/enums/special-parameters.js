'use strict';

const specialParameterNames = {
	'!': 'last-background-pid',
	'@': 'positional-list',
	'-': 'current-option-flags',
	'#': 'positional-count',
	'?': 'last-exit-status',
	'*': 'positional-string',
	'$': 'shell-process-id',
	'0': 'shell-script-name'
};

module.exports = specialParameterNames;
