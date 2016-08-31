module.exports = {
	ast: {
		type: 'arithmetic_expansion',
		text: '0',
		expansion: [{
			type: 'name',
			text: '1'
		}]
	},
	expected: [
		[
			['name on 1']
		],
		'arithmetic_expansion on 0'
	]
};
