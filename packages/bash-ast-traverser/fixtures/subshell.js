module.exports = {
	ast: {
		type: 'subshell',
		text: 0,
		list: [{
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
		'subshell on 0'
	]
};
