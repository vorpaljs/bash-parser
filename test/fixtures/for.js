module.exports = {
	sourceCode: "for x\n do echo $x\n done",
	result: {
		type: "Script",
		commands: [
			{
				type: "For",
				name: {
					text: "x",
					type: "Name"
				},
				do: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "echo",
								type: "Word"
							},
							suffix: [
								{
									text: "$x",
									expansion: [
										{
											loc: {
												start: 0,
												end: 1
											},
											parameter: "x",
											type: "ParameterExpansion"
										}
									],
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