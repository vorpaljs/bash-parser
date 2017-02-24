module.exports = {
	sourceCode: "\"foo ${other} baz\"",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "foo bar baz",
					expansion: [
						{
							loc: {
								start: 5,
								end: 12
							},
							parameter: "other",
							type: "ParameterExpansion",
							resolved: true
						}
					],
					originalText: "\"foo ${other} baz\"",
					type: "Word"
				}
			}
		]
	}
}