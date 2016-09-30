module.exports = {
	sourceCode: "while true; do sleep 1; done",
	result: {
		type: "Script",
		commands: [
			{
				type: "While",
				clause: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "true",
								type: "Word"
							}
						}
					]
				},
				do: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "sleep",
								type: "Word"
							},
							suffix: [
								{
									text: "1",
									type: "Word"
								}
							]
						}
					]
				}
			}
		]
	}
}