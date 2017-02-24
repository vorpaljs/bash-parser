module.exports = {
	sourceCode: "echo \\\n\n\necho there",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				}
			},
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				},
				suffix: [
					{
						text: "there",
						type: "Word"
					}
				]
			}
		]
	}
}