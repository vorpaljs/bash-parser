module.exports = {
	sourceCode: "echo TEST=1",
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
						text: "TEST=1",
						type: "Word"
					}
				]
			}
		]
	}
}