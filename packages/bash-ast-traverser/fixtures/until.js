module.exports = {
	ast: {
		type: 'until',
		text: '0',
		clause: {
			type: 'name',
			text: '1'
		},
		do: {
			type: 'name',
			text: '2'
		}
	},
	expected: [
		[
			['name on 1'],
			['name on 2']
		],
		'until on 0'
	]
};
