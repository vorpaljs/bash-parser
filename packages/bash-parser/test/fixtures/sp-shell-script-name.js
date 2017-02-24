module.exports = {
	sourceCode: "echoword=$0",
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
						text: "echoword=$0",
						expansion: [
							{
								loc: {
									start: 9,
									end: 10
								},
								parameter: "0",
								type: "ParameterExpansion",
								kind: "shell-script-name"
							}
						],
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}