/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Command',
		prefix: [{type: 'Word', text: 1}],
		suffix: [{type: 'Word', text: 2}],
		text: 0
	},
	expected: [
		[null, [['Word on 1']],
		[['Word on 2']]],
		'Command on 0'
	]
};
