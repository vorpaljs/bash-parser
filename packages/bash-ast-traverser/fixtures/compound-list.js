module.exports = {
	ast: {
		type: 'compound_list',
		text: 0,
		commands: [{
			type: 'word',
			text: 1
		}, {
			type: 'word',
			text: 2
		}]
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
		'compound_list on 0'
	]
};
