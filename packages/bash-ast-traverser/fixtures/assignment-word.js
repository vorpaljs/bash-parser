module.exports = {
	ast: {
		type: 'assignment_word',
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
		'assignment_word on 0'
	]
};
