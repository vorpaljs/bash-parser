'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('parse for', t => {
	const result = bashParser('for x in a b c; do echo $x; done');
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'and_or',
				left: {
					type: 'pipeline',
					commands: [{
						type: 'for',
						name: {text: 'x'},
						wordlist: [{text: 'a'}, {text: 'b'}, {text: 'c'}],
						do: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'echo'},
										suffix: {
											type: 'cmd_suffix',
											list: [{
												text: '$x',
												expansion: [{
													parameter: 'x',
													start: 0,
													end: 2
												}]
											}]
										}
									}]
								}
							}]
						}
					}]
				}
			}]
		}
	);
});

test('parse for with default sequence', t => {
	const result = bashParser('for x\n do echo $x\n done');
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'and_or',
				left: {
					type: 'pipeline',
					commands: [{
						type: 'for',
						name: {text: 'x'},
						do: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'echo'},
										suffix: {
											type: 'cmd_suffix',
											list: [{
												text: '$x',
												expansion: [{
													parameter: 'x',
													start: 0,
													end: 2
												}]
											}]
										}
									}]
								}
							}]
						}

					}]
				}
			}]
		}
	);
});

test('parse for with default sequence - on one line', t => {
	const result = bashParser('for x in; do echo $x done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'and_or',
				left: {
					type: 'pipeline',
					commands: [{
						type: 'for',
						name: {text: 'x'},
						do: {
							type: 'term',
							and_ors: [{
								type: 'and_or',
								left: {
									type: 'pipeline',
									commands: [{
										type: 'simple_command',
										name: {text: 'echo'},
										suffix: {
											type: 'cmd_suffix',
											list: [{
												text: '$x',
												expansion: [{
													parameter: 'x',
													start: 0,
													end: 2
												}]
											}]
										}
									}]
								}
							}]
						}
					}]
				}
			}]
		}
	);
});
