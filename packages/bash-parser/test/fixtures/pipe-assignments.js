module.exports = {
	sourceCode: "foo | IFS= read var",
	result: {
		type: "Script",
		commands: [
			{
				type: "Pipeline",
				commands: [
					{
						type: "SimpleCommand",
						name: {
							text: "foo",
							type: "Word"
						}
					},
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
								text: "var",
								type: "Word"
							}
						]
					}
				]
			}
		]
	}
}