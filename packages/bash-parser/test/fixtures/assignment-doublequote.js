module.exports = {
	sourceCode: "echo=\"ciao mondo\"",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "",
					type: "Word"
				},
				prefix: [
					{
						text: "echo=ciao mondo",
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}