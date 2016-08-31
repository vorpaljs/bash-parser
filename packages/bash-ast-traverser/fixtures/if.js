module.exports = {
	ast: {
		type: 'if',
		text: '0',
		clause: [{
			type: 'name',
			text: '1'
		}],
		then: [{
			type: 'name',
			text: '2'
		}],
		else: [{
			type: 'name',
			text: '3'
		}]
	},
	expected: [
		[
			['name on 1'],
			['name on 2'],
			['name on 3']
		],
		'if on 0'
	]
};
