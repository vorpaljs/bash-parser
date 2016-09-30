module.exports = {
	sourceCode: "echo word${other}test",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				},
				suffix: [
					{
						text: "word${other}test",
						expansion: [
							{
								loc: {
									start: 4,
									end: 11
								},
								parameter: "other",
								type: "ParameterExpansion"
							}
						],
						type: "Word"
					}
				]
			}
		]
	}
}