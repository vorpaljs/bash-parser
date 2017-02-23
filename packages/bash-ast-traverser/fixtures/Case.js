/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Case',
		text: 0,
		clause: {
			type: 'Word',
			text: 3
		},
		cases: [{
			type: 'Word',
			text: 1
		}, {
			type: 'Word',
			text: 2
		}]
	},
	expected: {
		visited: true,
		type: 'Case',
		text: 0,
		clause: {
			visited: true,
			type: 'Word',
			text: 3
		},
		cases: [{
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
