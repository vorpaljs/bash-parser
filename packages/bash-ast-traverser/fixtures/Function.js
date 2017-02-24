/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Function',
		text: 'cosine',
		body: {
			type: 'Name',
			text: 'test'
		}
	},
	expected: [
		['Name on test'],
		'Function on cosine'
	]
};
