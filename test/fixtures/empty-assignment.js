module.exports = {
	sourceCode: "IFS= read -r var",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "read",
					type: "Word"
				},
				prefix: [
					{
						text: "IFS=",
						type: "AssignmentWord"
					}
				],
				suffix: [
					{
						text: "-r",
						type: "Word"
					},
					{
						text: "var",
						type: "Word"
					}
				]
			}
		]
	}
}