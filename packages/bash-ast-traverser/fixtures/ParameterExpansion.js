/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'ParameterExpansion',
		text: '0',
		expansion: [{
			type: 'Name',
			text: '1'
		}]
	},
	expected: [
		[
			['Name on 1']
		],
		'ParameterExpansion on 0'
	]
};
