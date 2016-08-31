module.exports = {
	ast: {
		type: 'subshell',
		text: 0,
		list: {
			type: 'word',
			text: 1
		}
	},
	expected: [
		['word on 1'],
		'subshell on 0'
	]
};
