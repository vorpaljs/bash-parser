module.exports = {
	sourceCode: "(echo)",
	result: {
		type: "Script",
		commands: [
			{
				type: "Subshell",
				list: {
					type: "CompoundList",
					commands: [
						{
							type: "SimpleCommand",
							name: {
								text: "echo",
								type: "Word",
								loc: {
									start: {
										col: 2,
										row: 1,
										char: 1
									},
									end: {
										col: 5,
										row: 1,
										char: 4
									}
								}
							},
							loc: {
								start: {
									col: 2,
									row: 1,
									char: 1
								},
								end: {
									col: 5,
									row: 1,
									char: 4
								}
							}
						}
					],
					loc: {
						start: {
							col: 2,
							row: 1,
							char: 1
						},
						end: {
							col: 5,
							row: 1,
							char: 4
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
						col: 6,
						row: 1,
						char: 5
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
				col: 6,
				row: 1,
				char: 5
			}
		}
	}
}