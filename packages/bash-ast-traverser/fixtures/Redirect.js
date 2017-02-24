/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Redirect',
		text: 0,
		file: {
			type: 'Word',
			text: 'test'
		}
	},
	expected: {
		visited: true,
		type: 'Redirect',
		text: 0,
		file: {
			visited: true,
			type: 'Word',
			text: 'test'
		}
	}
};
