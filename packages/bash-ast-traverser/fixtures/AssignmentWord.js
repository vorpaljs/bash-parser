/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'AssignmentWord',
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
		'AssignmentWord on 0'
	]
};
