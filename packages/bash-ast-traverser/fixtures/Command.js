/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		name: {type: 'Word', text: 3},
		type: 'Command',
		prefix: [{type: 'Word', text: 1}],
		suffix: [{type: 'Word', text: 2}],
		text: 0
	},
	expected: {
		visited: true,
		type: 'Command',
		name: {visited: true, type: 'Word', text: 3},
		prefix: [{visited: true, type: 'Word', text: 1}],
		suffix: [{visited: true, type: 'Word', text: 2}],
		text: 0
	}
};
