module.exports = {
	sourceCode: "for x\n\tin ; do\n\techo $x;\ndone\n",
	result: {
		type: "Script",
		commands: [
			{
				type: "For",
				name: {
					text: "x",
					type: "Name",
					loc: {
						start: {
							col: 5,
							row: 1,
							char: 4
						},
						end: {
							col: 5,
							row: 1,
							char: 4
						}
					}
				},
				do: {
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
										row: 3,
										char: 16
									},
									end: {
										col: 5,
										row: 3,
										char: 19
									}
								}
							},
							loc: {
								start: {
									col: 2,
									row: 3,
									char: 16
								},
								end: {
									col: 8,
									row: 3,
									char: 22
								}
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
									type: "Word",
									loc: {
										start: {
											col: 7,
											row: 3,
											char: 21
										},
										end: {
											col: 8,
											row: 3,
											char: 22
										}
									}
								}
							]
						}
					],
					loc: {
						start: {
							col: 7,
							row: 2,
							char: 12
						},
						end: {
							col: 4,
							row: 4,
							char: 28
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
						col: 4,
						row: 4,
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
				char: 28
			}
		}
	}
}