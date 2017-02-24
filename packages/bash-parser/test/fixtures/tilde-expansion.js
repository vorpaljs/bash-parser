module.exports = {
	sourceCode: "a=~/subdir:~/othersubdir/ciao",
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
						text: "a=/home/current/subdir:/home/current/othersubdir/ciao",
						type: "AssignmentWord"
					}
				]
			}
		]
	}
}