module.exports = {
	sourceCode: "TEST1=1 TEST2=2 echo world",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word"
				},
				prefix: [
					{
						text: "TEST1=1",
						type: "AssignmentWord"
					},
					{
						text: "TEST2=2",
						type: "AssignmentWord"
					}
				],
				suffix: [
					{
						text: "world",
						type: "Word"
					}
				]
			}
		]
	}
}