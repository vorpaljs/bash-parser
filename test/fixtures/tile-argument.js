module.exports = {
	sourceCode: "echo ~username/subdir",
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
						text: "/home/username/subdir",
						type: "Word"
					}
				]
			}
		]
	}
}