module.exports = {
	sourceCode: "echo 2> 43",
	result: {
		type: "Script",
		commands: [
			{
				type: "SimpleCommand",
				name: {
					text: "echo",
					type: "Word",
					loc: {
						start: {
							col: 1,
							row: 1,
							char: 0
						},
						end: {
							col: 4,
							row: 1,
							char: 3
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
						col: 10,
						row: 1,
						char: 9
					}
				},
				suffix: [
					{
						type: "Redirect",
						op: {
							text: ">",
							type: "great",
							loc: {
								start: {
									col: 7,
									row: 1,
									char: 6
								},
								end: {
									col: 7,
									row: 1,
									char: 6
								}
							}
						},
						file: {
							text: "43",
							type: "Word",
							loc: {
								start: {
									col: 9,
									row: 1,
									char: 8
								},
								end: {
									col: 10,
									row: 1,
									char: 9
								}
							}
						},
						loc: {
							start: {
								col: 6,
								row: 1,
								char: 5
							},
							end: {
								col: 10,
								row: 1,
								char: 9
							}
						},
						numberIo: {
							text: "2",
							type: "io_number",
							loc: {
								start: {
									col: 6,
									row: 1,
									char: 5
								},
								end: {
									col: 6,
									row: 1,
									char: 5
								}
							}
						}
					}
				]
			}
		],
		loc: {
			start: {
				col: 1,
				row: 1,
				char: 0
			},
			end: {
				col: 10,
				row: 1,
				char: 9
			}
		}
	}
}
