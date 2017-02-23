/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Function',
		text: 'cosine',
		body: {
			type: 'Name',
			text: 'test'
		},
		redirections: [{
			type: 'Name',
			text: 'test'
		}]
	},
	expected: {
		visited: true,
		type: 'Function',
		text: 'cosine',
		body: {
			visited: true,
			type: 'Name',
			text: 'test'
		},
		redirections: [{
			visited: true,
			type: 'Name',
			text: 'test'
		}]
	}
};
