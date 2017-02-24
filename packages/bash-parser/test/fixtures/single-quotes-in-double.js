module.exports = {
	sourceCode: "echo \"TEST1 'TEST2\"",
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
						text: "TEST1 'TEST2",
						type: "Word"
					}
				]
			}
		]
	}
}