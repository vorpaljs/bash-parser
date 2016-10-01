module.exports = {
	sourceCode: "case foo in\n\t* )\n\t\techo bar;;\nesac\n",
	result: {
		type: "Script",
		commands: [
			{
				type: "Case",
				clause: {
					text: "foo",
					type: "Word",
					loc: {
						start: {
							col: 6,
							row: 1,
							char: 5
						},
						end: {
							col: 8,
							row: 1,
							char: 7
						}
					}
				},
				cases: [
					{
						type: "CaseItem",
						pattern: [
							{
								text: "*",
								type: "Word",
								loc: {
									start: {
										col: 2,
										row: 2,
										char: 13
									},
									end: {
										col: 2,
										row: 2,
										char: 13
									}
								}
							}
						],
						body: {
							type: "CompoundList",
							commands: [
								{
									type: "SimpleCommand",
									name: {
										text: "echo",
										type: "Word",
										loc: {
											start: {
												col: 3,
												row: 3,
												char: 19
											},
											end: {
												col: 6,
												row: 3,
												char: 22
											}
										}
									},
									loc: {
										start: {
											col: 3,
											row: 3,
											char: 19
										},
										end: {
											col: 10,
											row: 3,
											char: 26
										}
									},
									suffix: [
										{
											text: "bar",
											type: "Word",
											loc: {
												start: {
													col: 8,
													row: 3,
													char: 24
												},
												end: {
													col: 10,
													row: 3,
													char: 26
												}
											}
										}
									]
								}
							],
							loc: {
								start: {
									col: 3,
									row: 3,
									char: 19
								},
								end: {
									col: 10,
									row: 3,
									char: 26
								}
							}
						},
						loc: {
							start: {
								col: 2,
								row: 2,
								char: 13
							},
							end: {
								col: 12,
								row: 3,
								char: 28
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
						col: 4,
						row: 4,
						char: 33
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
				col: 4,
				row: 4,
				char: 33
			}
		}
	}
}