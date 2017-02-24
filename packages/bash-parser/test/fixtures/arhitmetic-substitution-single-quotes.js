module.exports = {
	sourceCode: "echo '$((42 * 42))'",
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
						text: "$((42 * 42))",
						type: "Word"
					}
				]
			}
		]
	}
}