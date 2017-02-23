/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Subshell',
		text: 0,
		list: {
			type: 'Word',
			text: 1
		}
	},
	expected: {
		visited: true,
		type: 'Subshell',
		text: 0,
		list: {
			visited: true,
			type: 'Word',
			text: 1
		}
	}
};
