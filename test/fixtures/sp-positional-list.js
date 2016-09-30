module.exports = {
	sourceCode: "echoword=$@",
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
						text: "echoword=$@",
						expansion: [
							{
								loc: {
									start: 9,
									end: 10
								},
								parameter: "@",
								type: "ParameterExpansion",
								kind: "positional-list"
							}
						],
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}