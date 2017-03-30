const astVisit = require('bash-ast-traverser');
const visitor = require('..');

const node = {
	type: 'Command',
	name: {
		type: 'Word',
		text: 'wc'
	},
	suffix: [{
		type: 'Word',
		text: '-w'
	}, {
		type: 'Redirect',
		op: '<',
		file: `${__dirname}/stdin-content`
	}]
};

const runner = astVisit(node, visitor);
runner.run({env: process.env});

