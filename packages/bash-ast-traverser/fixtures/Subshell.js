/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Subshell',
		text: 0,
		list: {
			type: 'Word',
			text: 1
		}
	},
	expected: [
		['Word on 1'],
		'Subshell on 0'
	]
};
