
/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Script',
		text: 0,
		commands: [{
			type: 'Word',
			text: 1
		}, {
			type: 'Word',
			text: 2
		}]
	},
	expected: {
		visited: true,
		type: 'Script',
		text: 0,
		commands: [{
			visited: true,
			type: 'Word',
			text: 1
		}, {
			visited: true,
			type: 'Word',
			text: 2
		}]
	}
};
