module.exports = {
	ast: {
		type: 'io_redirect',
		text: 0,
		file: {
			type: 'word',
			text: 'test'
		}
	},
	expected: [
		['word on test'],
		'io_redirect on 0'
	]
};
