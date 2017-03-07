import * as fs from 'fs';
import test from 'ava';
import execa from 'execa';
import pify from 'pify';
import pathExists from 'path-exists';

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
