module.exports = {
	ast: {
		type: 'command_expansion',
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
		'command_expansion on 0'
	]
};
