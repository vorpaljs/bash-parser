/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'CompoundList',
		text: '0',
		commands: [{
			type: 'Name',
			text: '0'
		}]
	},
	expected: {
		visited: true,
		type: 'CompoundList',
		text: '0',
		commands: [{
			visited: true,
			type: 'Name',
			text: '0'
		}]
	}
};
