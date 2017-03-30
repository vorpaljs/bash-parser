/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Word',
		text: 0,
		expansion: [{
			type: 'Name',
			text: 'test'
		}]
	},
	expected: {
		visited: true,
		type: 'Word',
		text: 0,
		expansion: [{
			visited: true,
			type: 'Name',
			text: 'test'
		}]
	}
};
