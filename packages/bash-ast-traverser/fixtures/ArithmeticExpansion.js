/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'ArithmeticExpansion',
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
		'ArithmeticExpansion on 0'
	]
};
