import test from 'ava';
import astVisit from 'bash-ast-traverser';
import getStream from 'get-stream';

import visitor from '.';

test('Command node - run external process for unknown command names', async t => {
	const node = {
		type: 'Command',
		name: {
			type: 'Word',
			text: 'echo'
		},
		suffix: [{
			type: 'Word',
			text: 'ciao'
		}]
	};

	const runner = astVisit(node, {}, visitor);
	const proc = runner.run();
	const result = await getStream(proc.stdout);
	t.is(result, 'ciao\n');
});

test('Command node - support numbered redirections', async t => {
	const node = {
		type: 'Command',
		name: {
			type: 'Word',
			text: 'echo'
		},
		suffix: [{
			type: 'Word',
			text: 'ciao'
		}, {
			type: 'Redirect',
			op: '>',
			file: 2,
			numberIo: 1
		}]
	};

	const runner = astVisit(node, {}, visitor);
	const proc = runner.run();
	const result = await getStream(proc.stderr);
	t.is(result, 'ciao\n');
});
