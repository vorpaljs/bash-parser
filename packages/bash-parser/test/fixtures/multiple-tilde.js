module.exports = {
	sourceCode: "echo ~/subdir/~other/",
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
						text: "/home/current/subdir/~other/",
						type: "Word"
					}
				]
			}
		]
	}
}