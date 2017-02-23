/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'LogicalExpression',
		text: 0,
		left: {
			type: 'Word',
			text: 1
		},
		right: {
			type: 'Word',
			text: 2
		}
	},
	expected: {
		visited: true,
		type: 'LogicalExpression',
		text: 0,
		left: {
			visited: true,
			type: 'Word',
			text: 1
		},
		right: {
			visited: true,
			type: 'Word',
			text: 2
		}
	}
};
