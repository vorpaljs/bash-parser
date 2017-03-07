const astVisit = require('bash-ast-traverser');
const visitor = require('..');

const node = {
	type: 'Command',
	name: {
		type: 'Word',
		text: 'echo'
	},
	suffix: [{
		type: 'Word',
		text: 'ciao'
	}]
};

const runner = astVisit(node, visitor);
runner.run({env: process.env});

