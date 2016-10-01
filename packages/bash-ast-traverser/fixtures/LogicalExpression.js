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
	expected: [
		[
			[
				'Word on 1'
			],
			[
				'Word on 2'
			]
		],
		'LogicalExpression on 0'
	]
};
