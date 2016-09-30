module.exports = {
	sourceCode: "variable=$((42 + 43)) $ciao",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "$ciao",
					expansion: [
						{
							loc: {
								start: 0,
								end: 4
							},
							parameter: "ciao",
							type: "ParameterExpansion"
						}
					],
					type: "Word"
				},
				prefix: [
					{
						text: "variable=$((42 + 43))",
						expansion: [
							{
								loc: {
									start: 9,
									end: 20
								},
								type: "ArithmeticExpansion",
								expression: "42 + 43",
								arithmeticAST: {
									type: "BinaryExpression",
									start: 0,
									end: 7,
									loc: {
										start: {
											line: 1,
											column: 0
										},
										end: {
											line: 1,
											column: 7
										}
									},
									left: {
										type: "NumericLiteral",
										start: 0,
										end: 2,
										loc: {
											start: {
												line: 1,
												column: 0
											},
											end: {
												line: 1,
												column: 2
											}
										},
										extra: {
											rawValue: 42,
											raw: "42"
										},
										value: 42
									},
									operator: "+",
									right: {
										type: "NumericLiteral",
										start: 5,
										end: 7,
										loc: {
											start: {
												line: 1,
												column: 5
											},
											end: {
												line: 1,
												column: 7
											}
										},
										extra: {
											rawValue: 43,
											raw: "43"
										},
										value: 43
									}
								}
							}
						],
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}