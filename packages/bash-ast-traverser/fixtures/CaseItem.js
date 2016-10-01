/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'CaseItem',
		text: '0',
		body: {
			type: 'Name',
			text: '3'
		},
		pattern: [{
			type: 'Name',
			text: '1'
		}, {
			type: 'Name',
			text: '2'
		}]
	},
	expected: [
		[
			['Name on 1'],
			['Name on 2'],
			'Name on 3'
		],
		'CaseItem on 0'
	]
};
