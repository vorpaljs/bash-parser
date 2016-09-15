#!/usr/bin/env node
const {writeFile} = require('fs');
const {resolve} = require('path');
const minimist = require('minimist');
const chalk = require('chalk');
const ora = require('ora');
const {Parser} = require('jison');

const argv = minimist(process.argv.slice(2));

if (argv._.length === 2) {
	build(...argv._);
} else {
	console.log(chalk.red(`Usage: mgb <modes folder> <mode name>`));
	process.exit(1);
}

function build(modesFolder, modeName) {
	const modeModule = resolve(modesFolder, modeName, 'index.js');
	const builtGrammarPath = resolve(modesFolder, modeName, 'built-grammar.js');

	const spinner = ora(`Building grammar from ${modeModule}...`).start();

	const mode = require(modeModule);
	spinner.text = 'Mode module loaded.';
	let parserSource;
	try {
		const parser = new Parser(mode.grammarSource);
		parserSource = parser.generate();
	} catch (err) {
		console.log(chalk.red(`Cannot compile grammar: \n${err.stack}`));
		spinner.stop();
		process.exit(1);
		return;
	}

	spinner.text = 'Mode grammar compiled.';
	writeFile(builtGrammarPath, parserSource, err => {
		if (err) {
			console.log(chalk.red(`Cannot write compiled grammar to file: \n${err.stack}`));
			spinner.stop();
			process.exit(1);
			return;
		}
		spinner.stop();
		console.log(chalk.green(`Mode grammar saved to ${builtGrammarPath}.`));
	});
}
