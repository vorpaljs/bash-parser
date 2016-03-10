'use strict';

const test = require('ava');
const bashParser = require('../src');
const utils = require('./_utils');

test('parameter with use default value', t => {
	const result = bashParser('${other:-default_value}');

	// utils.logResults(result.commands[0].name)
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other:-default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'useDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with use default value if unset', t => {
	const result = bashParser('${other-default_value}');

	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other-default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'useDefaultValueIfUnset',
			loc: {
				start: 0,
				end: 21
			}
		}]
	});
});

test('parameter with string length', t => {
	const result = bashParser('${#default_value}');

	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${#default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'default_value',
			op: 'stringLength',
			loc: {
				start: 0,
				end: 16
			}
		}]
	});
});

test('parameter with assign default value', t => {
	const result = bashParser('${other:=default_value}');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other:=default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'assignDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with assign default value if unset', t => {
	const result = bashParser('${other=default_value}');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: '${other=default_value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'assignDefaultValueIfUnset',
			loc: {
				start: 0,
				end: 21
			}
		}]
	});
});

test('parameter with other parameter in word', t => {
	const result = bashParser('${other:=default$value}');
	// utils.logResults(result)
	utils.checkResults(t, JSON.parse(JSON.stringify(result.commands[0].name)), {
		type: 'Word',
		text: '${other:=default$value}',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default$value',
				expansion: [{
					type: 'ParameterExpansion',
					parameter: 'value',
					loc: {
						start: 7,
						end: 12
					}
				}],
				type: 'Word'
			},
			op: 'assignDefaultValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with indicate error if null', t => {
	const result = bashParser('${other:?default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other:?default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'indicateErrorIfNull',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with indicate error if unset', t => {
	const result = bashParser('${other?default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other?default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'indicateErrorIfUnset',
			loc: {
				start: 0,
				end: 21
			}
		}]
	});
});

test('parameter with use alternative value', t => {
	const result = bashParser('${other:+default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other:+default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'useAlternativeValue',
			loc: {
				start: 0,
				end: 22
			}
		}]
	});
});

test('parameter with use alternative value if unset', t => {
	const result = bashParser('${other+default_value}');
	utils.checkResults(t, result.commands[0].name, {
		text: '${other+default_value}',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'other',
			word: {
				text: 'default_value',
				type: 'Word'
			},
			op: 'useAlternativeValueIfUnset',
			loc: {
				start: 0,
				end: 21
			}
		}]
	});
});

