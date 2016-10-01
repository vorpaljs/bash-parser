/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'Case',
		text: 0,
		clause: {
			type: 'Word',
			text: 3
		},
		cases: [{
			type: 'Word',
			text: 1
		}, {
			type: 'Word',
			text: 2
		}]
	},
	expected: [
		[
			['Word on 1'],
			['Word on 2'],
			'Word on 3'
		],
		'Case on 0'
	]
};
