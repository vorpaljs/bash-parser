/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Word',
		text: 0,
		expansion: [{
			type: 'Name',
			text: 'test'
		}]
	},
	expected: [
		[['Name on test']],
		'Word on 0'
	]
};
