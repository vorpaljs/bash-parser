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
	expected: {
		visited: true,
		type: 'AssignmentWord',
		text: '0',
		expansion: [{
			visited: true,
			type: 'Name',
			text: '1'
		}]
	}
};
