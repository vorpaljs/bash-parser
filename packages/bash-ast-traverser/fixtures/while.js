module.exports = {
	ast: {
		type: 'while',
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
		'while on 0'
	]
};
