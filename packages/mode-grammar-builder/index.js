#!/usr/bin/env node
'use strict';
const writeFile = require('fs').writeFile;
const resolve = require('path').resolve;
const minimist = require('minimist');
const chalk = require('chalk');
const ora = require('ora');
const Parser = require('jison').Parser;

const argv = minimist(process.argv.slice(2));

if (argv._.length === 1) {
	build(argv._[0]);
} else {
	console.log(chalk.red(`Usage: mgb <modes folder>`));
	process.exit(1);
}

function loadPlugin(modePlugin, modes) {
	if (modePlugin.inherits) {
		return modePlugin.init(loadPlugin(modes[modePlugin.inherits], modes));
	}
	return modePlugin.init(null);
}

function build(modesFolder) {
	const modeModule = resolve(modesFolder, 'index.js');
	const builtGrammar = mode => resolve(modesFolder, `built-grammar-${mode}.js`);
	const spinner = ora(`Building grammar from ${modeModule}...`).start();
	const bashParser = require(modeModule);

	const modeNames = Object.keys(bashParser.modes);
	buildMode(0);

	function buildMode(idx) {
		if (idx >= modeNames.length) {
			spinner.stop();
			return;
		}
		const modeName = modeNames[idx];
		const modePlugin = bashParser.modes[modeName];
		const builtGrammarPath = builtGrammar(modeName);
		const mode = loadPlugin(modePlugin, bashParser.modes);

		spinner.text = `${modeName} module loaded.`;
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

		spinner.text = '- grammar compiled.';
		writeFile(builtGrammarPath, parserSource, err => {
			if (err) {
				console.log(chalk.red(`Cannot write compiled grammar to file: \n${err.stack}`));
				spinner.stop();
				process.exit(1);
				return;
			}
			buildMode(idx + 1);
			console.log(chalk.green(`grammar saved to ${builtGrammarPath}.`));
		});
	}
}
