module.exports = {
	sourceCode: "( ls )",
	result: {
		type: "Script",
		commands: [
			{
				type: "Subshell",
				list: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "ls",
								type: "Word"
							}
						}
					]
				}
			}
		]
	}
}