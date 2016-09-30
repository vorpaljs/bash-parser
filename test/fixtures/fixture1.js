module.exports = {
	sourceCode: "foo='hello ; rm -rf /'\ndest=bar\neval \"dest=foo\"",
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
						text: "foo=hello ; rm -rf /",
						type: "AssignmentWord"
					}
				]
			},
			{
				type: "SimpleCommand",
				name: {
					text: "",
					type: "Word"
				},
				prefix: [
					{
						text: "dest=bar",
						type: "AssignmentWord"
					}
				]
			},
			{
				type: "SimpleCommand",
				name: {
					text: "eval",
					type: "Word"
				},
				suffix: [
					{
						text: "dest=foo",
						type: "Word"
					}
				]
			}
		]
	}
}