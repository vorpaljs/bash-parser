import * as fs from 'fs';
import test from 'ava';
import execa from 'execa';
import pify from 'pify';
import pathExists from 'path-exists';
import astVisit from 'bash-ast-traverser';
import visitor from '.';

const readFile = pify(fs.readFile);
const unlink = pify(fs.unlink);

test('Command node - run external process for unknown command names', async t => {
	const {stderr, stdout} = await execa('node', ['fixtures/nonwell-known-command.js']);
	t.is(stdout, 'ciao');
	t.is(stderr, '');
});

test('Command node - support numbered redirections', async t => {
	const {stderr, stdout} = await execa('node', ['fixtures/numbered-redirections.js']);
	t.is(stdout, '');
	t.is(stderr, 'ciao');
});

test('Command node - support redirections to files', async t => {
	const fileName = '/tmp/test';
	if (await pathExists(fileName)) {
		await unlink(fileName);
	}

	const {stderr, stdout} = await execa('node', ['fixtures/files-redirections.js']);
	t.is(stdout, '');
	t.is(stderr, '');
	t.is(await readFile(fileName, 'utf8'), 'ciao\n');
	await unlink(fileName);
});

test('Command node - support appending to files', async t => {
	const fileName = '/tmp/test-append';
	if (await pathExists(fileName)) {
		await unlink(fileName);
	}

	await execa('node', ['fixtures/files-append.js']);
	const {stderr, stdout} = await execa('node', ['fixtures/files-append.js']);
	t.is(stdout, '');
	t.is(stderr, '');
	t.is(await readFile(fileName, 'utf8'), 'ciao\nciao\n');
	await unlink(fileName);
});

test('Command node - stdin redirection from file', async t => {
	const {stderr, stdout} = await execa('node', ['fixtures/input.js']);
	t.is(stdout.trim(), '4');
	t.is(stderr, '');
});

function commandNode(command, ...args) {
	const node = {
		type: 'Command',
		name: {
			type: 'Word',
			text: command
		},
		suffix: args.map(arg => ({
			type: 'Word',
			text: arg
		}))
	};
	return astVisit(node, visitor);
}

test('Command node - return a promise to an exit code', async t => {
	const runner = commandNode('node', 'fixtures/exit-42.js');
	const exitCode = await runner.run({
		env: process.env
	});

	t.is(exitCode, 42);
});

test('Command node - pass env vars to child process', async t => {
	const runner = commandNode('node', 'fixtures/env-spy.js');
	const exitCode = await runner.run({
		env: Object.assign(
			{thisIsATest: 43},
			process.env
		)
	});

	t.is(exitCode, 43);
});

test('Command node - pass cwd to child process', async t => {
	const runner = commandNode('node', 'check-cwd.js');
	const exitCode = await runner.run({
		cwd: `${__dirname}/fixtures`,
		env: process.env
	});

	t.is(exitCode, 142);
});

