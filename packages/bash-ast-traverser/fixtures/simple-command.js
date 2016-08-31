module.exports = {
	ast: {
		type: 'simple_command',
		prefix: {type: 'word', text: 1},
		suffix: {type: 'word', text: 2},
		text: 0
	},
	expected: [
		[['word on 1'],
		['word on 2']],
		'simple_command on 0'
	]
};
