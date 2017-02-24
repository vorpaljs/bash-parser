module.exports = {
	sourceCode: "echo '`echo ciao`'",
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
						text: "`echo ciao`",
						type: "Word"
					}
				]
			}
		]
	}
}