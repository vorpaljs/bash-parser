module.exports = {
	ast: {
		type: 'case',
		text: 0,
		clause: {
			type: 'word',
			text: 3
		},
		cases: [{
			type: 'word',
			text: 1
		}, {
			type: 'word',
			text: 2
		}]
	},
	expected: [
		[
			['word on 1'],
			['word on 2'],
			'word on 3'
		],
		'case on 0'
	]
};
