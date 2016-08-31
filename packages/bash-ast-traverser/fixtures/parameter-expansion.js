module.exports = {
	ast: {
		type: 'parameter_expansion',
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
		'parameter_expansion on 0'
	]
};
