module.exports = {
	sourceCode: "echo `ciao`",
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
						text: "`ciao`",
						expansion: [
							{
								loc: {
									start: 0,
									end: 5
								},
								command: "ciao",
								type: "CommandExpansion",
								commandAST: {
									type: "Script",
									commands: [
										{
											type: "SimpleCommand",
											name: {
												text: "ciao",
												type: "Word"
											}
										}
									]
								}
							}
						],
						type: "Word"
					}
				]
			}
		]
	}
}