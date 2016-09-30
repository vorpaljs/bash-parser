module.exports = {
	sourceCode: "echo \"\\$ciao\"",
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
						text: "\\$ciao",
						type: "Word"
					}
				]
			}
		]
	}
}