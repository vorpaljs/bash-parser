module.exports = {
	sourceCode: "echo world #this is a comment\necho ciao",
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
						text: "world",
						type: "Word"
					}
				]
			},
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				},
				suffix: [
					{
						text: "ciao",
						type: "Word"
					}
				]
			}
		]
	}
}