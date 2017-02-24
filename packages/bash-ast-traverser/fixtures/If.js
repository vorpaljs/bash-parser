/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'If',
		text: '0',
		clause: {
			type: 'Name',
			text: '1'
		},
		then: {
			type: 'Name',
			text: '2'
		},
		else: {
			type: 'Name',
			text: '3'
		}
	},
	expected: [
		[
			['Name on 1'],
			['Name on 2'],
			['Name on 3']
		],
		'If on 0'
	]
};
