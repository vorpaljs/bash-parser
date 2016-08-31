module.exports = {
	ast: {
		type: 'function',
		text: 'cosine',
		body: {
			type: 'name',
			text: 'test'
		}
	},
	expected: [
		['name on test'],
		'function on cosine'
	]
};
