module.exports = {
	ast: {
		type: 'case_item',
		text: '0',
		body: [{
			type: 'name',
			text: '3'
		}],
		pattern: [{
			type: 'name',
			text: '1'
		}, {
			type: 'name',
			text: '2'
		}]
	},
	expected: [
		[
			['name on 1'],
			['name on 2'],
			['name on 3']
		],
		'case_item on 0'
	]
};
