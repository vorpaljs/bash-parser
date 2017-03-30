/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'If',
		text: '0',
		clause: {
			type: 'Name',
			text: '1'
		},
		then: {
			type: 'Name',
			text: '2'
		},
		else: {
			type: 'Name',
			text: '3'
		}
	},
	expected: {
		visited: true,
		type: 'If',
		text: '0',
		clause: {
			visited: true,
			type: 'Name',
			text: '1'
		},
		then: {
			visited: true,
			type: 'Name',
			text: '2'
		},
		else: {
			visited: true,
			type: 'Name',
			text: '3'
		}
	}
};
