module.exports = {
	ast: {
		type: 'and_or',
		text: 0,
		left: {
			type: 'word',
			text: 1
		},
		right: {
			type: 'word',
			text: 2
		}
	},
	expected: [
		[
			[
				'word on 1'
			],
			[
				'word on 2'
			]
		],
		'and_or on 0'
	]
};
