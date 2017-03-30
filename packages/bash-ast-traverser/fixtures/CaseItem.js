/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'CaseItem',
		text: '0',
		body: {
			type: 'Name',
			text: '3'
		},
		pattern: [{
			type: 'Name',
			text: '1'
		}, {
			type: 'Name',
			text: '2'
		}]
	},
	expected: {
		visited: true,
		type: 'CaseItem',
		text: '0',
		body: {
			visited: true,
			type: 'Name',
			text: '3'
		},
		pattern: [{
			visited: true,
			type: 'Name',
			text: '1'
		}, {
			visited: true,
			type: 'Name',
			text: '2'
		}]
	}
};
