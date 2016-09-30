module.exports = {
	sourceCode: "\"foo $(other) $(one) baz\"",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "foo bar bar baz",
					expansion: [
						{
							loc: {
								start: 5,
								end: 12
							},
							command: "other",
							type: "CommandExpansion",
							commandAST: {
								type: "Script",
								commands: [
									{
										type: "SimpleCommand",
										name: {
											text: "other",
											type: "Word"
										}
									}
								]
							},
							resolved: true
						},
						{
							loc: {
								start: 14,
								end: 19
							},
							command: "one",
							type: "CommandExpansion",
							commandAST: {
								type: "Script",
								commands: [
									{
										type: "SimpleCommand",
										name: {
											text: "one",
											type: "Word"
										}
									}
								]
							},
							resolved: true
						}
					],
					originalText: "\"foo $(other) $(one) baz\"",
					type: "Word"
				}
			}
		]
	}
}