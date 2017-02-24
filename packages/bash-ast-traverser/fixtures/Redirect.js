/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Redirect',
		text: 0,
		file: {
			type: 'Word',
			text: 'test'
		}
	},
	expected: [
		['Word on test'],
		'Redirect on 0'
	]
};
