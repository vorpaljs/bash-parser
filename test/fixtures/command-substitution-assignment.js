module.exports = {
	sourceCode: "variable=$(echo \\`echo ciao\\`)",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "",
					type: "Word"
				},
				prefix: [
					{
						text: "variable=$(echo \\`echo ciao\\`)",
						expansion: [
							{
								loc: {
									start: 9,
									end: 29
								},
								command: "echo \\`echo ciao\\`",
								type: "CommandExpansion",
								commandAST: {
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
													text: "`echo",
													type: "Word"
												},
												{
													text: "ciao`",
													type: "Word"
												}
											]
										}
									]
								}
							}
						],
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}