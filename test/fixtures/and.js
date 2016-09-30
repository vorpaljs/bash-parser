module.exports = {
	sourceCode: "run && \n stop",
	result: {
		type: "Script",
		commands: [
			{
				type: "LogicalExpression",
				op: "and",
				left: {
					type: "SimpleCommand",
					name: {
						text: "run",
						type: "Word"
					}
				},
				right: {
					type: "SimpleCommand",
					name: {
						text: "stop",
						type: "Word"
					}
				}
			}
		]
	}
}