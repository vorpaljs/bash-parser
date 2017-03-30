/* eslint-disable xo/filename-case */
module.exports = {
	ast: {
		type: 'For',
		text: '0',
		wordlist: [{
			type: 'Name',
			text: '1'
		}],
		do: {
			type: 'Name',
			text: '2'
		}
	},
	expected: {
		visited: true,
		type: 'For',
		text: '0',
		wordlist: [{
			visited: true,
			type: 'Name',
			text: '1'
		}],
		do: {
			visited: true,
			type: 'Name',
			text: '2'
		}
	}
};
