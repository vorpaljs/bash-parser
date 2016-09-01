module.exports = {
	ast: {
		type: 'for',
		text: '0',
		wordlist: [{
			type: 'name',
			text: '1'
		}],
		do: {
			type: 'name',
			text: '2'
		}
	},
	expected: [
		[
			[['name on 1']],
			['name on 2']
		],
		'for on 0'
	]
};
