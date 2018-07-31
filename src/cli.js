#!/usr/bin/env node

'use strict';

const parse = require('../');
const pkg = require('../package');

const args = process.argv.slice(2);

if (!args.length || args.includes('--help') || args.includes('-h')) {
	console.log(`${pkg.name} – ${pkg.description}\n\nUsage:\n\n\t${pkg.name} <source>`);
	process.exit();
}

if (args.includes('--version') || args.includes('-v')) {
	console.log(pkg.version);
	process.exit();
}

const [sourceCode] = args;
const ast = parse(sourceCode);
console.log(JSON.stringify(ast, null, '\t'));
