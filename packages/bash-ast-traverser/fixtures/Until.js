/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Until',
		text: '0',
		clause: {
			type: 'Name',
			text: '1'
		},
		do: {
			type: 'Name',
			text: '2'
		}
	},
	expected: {
		visited: true,
		type: 'Until',
		text: '0',
		clause: {
			visited: true,
			type: 'Name',
			text: '1'
		},
		do: {
			visited: true,
			type: 'Name',
			text: '2'
		}
	}
};
