/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Pipeline',
		text: 0,
		commands: [{
			type: 'Word',
			text: 1
		}, {
			type: 'Word',
			text: 2
		}]
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
		'Pipeline on 0'
	]
};
