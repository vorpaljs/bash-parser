module.exports = {
	sourceCode: "echo\"ciao\"'mondo'",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echociaomondo",
					type: "Word"
				}
			}
		]
	}
}