module.exports = {
	sourceCode: "foo () {\n\tcommand bar --lol;\n}\n",
	result: {
		type: "Script",
		commands: [
			{
				type: "Function",
				name: {
					text: "foo",
					type: "Name",
					loc: {
						start: {
							col: 1,
							row: 1,
							char: 0
						},
						end: {
							col: 3,
							row: 1,
							char: 2
						}
					}
				},
				body: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "command",
								type: "Word",
								loc: {
									start: {
										col: 2,
										row: 2,
										char: 10
									},
									end: {
										col: 8,
										row: 2,
										char: 16
									}
								}
							},
							loc: {
								start: {
									col: 2,
									row: 2,
									char: 10
								},
								end: {
									col: 18,
									row: 2,
									char: 26
								}
							},
							suffix: [
								{
									text: "bar",
									type: "Word",
									loc: {
										start: {
											col: 10,
											row: 2,
											char: 18
										},
										end: {
											col: 12,
											row: 2,
											char: 20
										}
									}
								},
								{
									text: "--lol",
									type: "Word",
									loc: {
										start: {
											col: 14,
											row: 2,
											char: 22
										},
										end: {
											col: 18,
											row: 2,
											char: 26
										}
									}
								}
							]
						}
					],
					loc: {
						start: {
							col: 8,
							row: 1,
							char: 7
						},
						end: {
							col: 1,
							row: 3,
							char: 29
						}
					}
				},
				loc: {
					start: {
						col: 1,
						row: 1,
						char: 0
					},
					end: {
						col: 1,
						row: 3,
						char: 29
					}
				}
			}
		],
		loc: {
			start: {
				col: 1,
				row: 1,
				char: 0
			},
			end: {
				col: 1,
				row: 3,
				char: 29
			}
		}
	}
}