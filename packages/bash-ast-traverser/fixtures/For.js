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
	expected: [
		[
			[['Name on 1']],
			['Name on 2']
		],
		'For on 0'
	]
};
