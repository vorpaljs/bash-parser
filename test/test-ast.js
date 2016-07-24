'use strict';
const test = require('ava');
const bashParser = require('../src');
// const inspect = require('util').inspect;
/*
test('parameter substitution', t => {
	const result = bashParser('echo word${other}test');
	console.log(JSON.stringify(result, null, 4));
	t.deepEqual(result, {
		type: 'list',
		andOrs: [
			{
				type: 'andOr',
				left: [
					{
						type: 'simple_command',
						name: {text: 'echo'},
						suffix: {
							type: 'cmd_suffix',
							list: [
								{
									type: 'cmd_argument',
									expansion: {
										text: 'other',
										start: 4,
										end: 12
									}
								}
							]
						}
					}
				]
			}
		]
	});
});
*/
test('command with one argument', t => {
	const result = bashParser('echo world');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [
						{text: 'world'}
					]
				}
			}]
		}]
	});
});

test('command with pre-assignment', t => {
	const result = bashParser('TEST=1 run');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'run'},
				prefix: {
					type: 'cmd_prefix',
					list: [{text: 'TEST=1'}]
				}
			}]
		}]
	});
});

test('commands with AND', t => {
	const result = bashParser('run && stop');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'and',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'stop'}}]
			}
		}]
	});
});

test('commands with AND \\n', t => {
	const result = bashParser('run && \n stop');
	// console.log(inspect(result, {depth: null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'and',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'stop'}}]
			}
		}]
	});
});

test('commands with OR', t => {
	const result = bashParser('run || cry');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'or',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'run'}}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: {text: 'cry'}}]
			}
		}]
	});
});

test('pipelines', t => {
	const result = bashParser('run | cry');
	// console.log(inspect(result, {depth: null}));
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command', name: {text: 'run'}
			}, {
				type: 'simple_command', name: {text: 'cry'}
			}]
		}]
	});
});

test('no pre-assignment on suffix', t => {
	const result = bashParser('echo TEST=1');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: 'TEST=1'}]
				}
			}]
		}]
	});
});

test('quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '"TEST1 \'TEST2"'}]
				}
			}]
		}]
	});
});

test('escaped double quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \\"TEST2"');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '"TEST1 "TEST2"'}]
				}
			}]
		}]
	});
});

test('double quotes within single quotes', t => {
	const result = bashParser('echo \'TEST1 "TEST2\'');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: '\'TEST1 "TEST2\''}]
				}
			}]
		}]
	});
});

test('command with multiple prefixes', t => {
	const result = bashParser('TEST1=1 TEST2=2 echo world');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'},
				prefix: {type: 'cmd_prefix', list: [{text: 'TEST1=1'}, {text: 'TEST2=2'}]},
				suffix: {
					type: 'cmd_suffix',
					list: [{text: 'world'}]
				}
			}]
		}]
	});
});

test('multi line commands', t => {
	const result = bashParser('echo; \nls;\n');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'echo'}
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'}
			}]
		}]
	});
});

test('command with redirection to file', t => {
	const result = bashParser('ls > file.txt');
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'},
				suffix: {
					type: 'cmd_suffix',
					list: [
						{
							type: 'io_redirect',
							op: '>',
							file: 'file.txt'
						}
					]
				}
			}]
		}]
	});
});

test('parse if', t => {
	const result = bashParser('if true; then echo 1; fi');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'if',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse if else', t => {
	const result = bashParser('if true; then echo 1; else echo 2; fi');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'if',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					},
					else: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '2'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse if else multiline', t => {
	const result = bashParser('if true; then \n echo 1;\n else\n echo 2;\n fi');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'if',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					},
					else: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '2'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse if elif else', t => {
	const result = bashParser('if true; then echo 1; elif false; then echo 3; else echo 2; fi');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'if',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					},
					else: {
						type: 'if',
						clause: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{type: 'simple_command', name: {text: 'false'}}]
							}]
						},
						then: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{
									type: 'simple_command',
									name: {text: 'echo'},
									suffix: {type: 'cmd_suffix', list: [{text: '3'}]}
								}]
							}]
						},
						else: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{
									type: 'simple_command',
									name: {text: 'echo'},
									suffix: {type: 'cmd_suffix', list: [{text: '2'}]}
								}]
							}]
						}
					}
				}]
			}]
		}
	);
});

test('parse for', t => {
	const result = bashParser('for x in a b c; do echo $x; done');
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'for',
					name: 'x',
					wordlist: ['a', 'b', 'c'],
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{
										text: '$x',
										expansion: {
											text: 'x',
											start: 0,
											end: 2
										}
									}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse for with default sequence', t => {
	const result = bashParser('for x\n do echo $x\n done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'for',
					name: 'x',
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{
										text: '$x',
										expansion: {
											text: 'x',
											start: 0,
											end: 2
										}
									}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse for with default sequence - on one line', t => {
	const result = bashParser('for x in; do echo $x done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'for',
					name: 'x',
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{
										text: '$x',
										expansion: {
											text: 'x',
											start: 0,
											end: 2
										}
									}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse while', t => {
	const result = bashParser('while true; do sleep 1; done');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'while',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'sleep'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse until', t => {
	const result = bashParser('until true; do sleep 1; done');
 //	console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'until',
					clause: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'sleep'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: '1'}]
								}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse multiple suffix', t => {
	const result = bashParser('command foo --lol');
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left:
				[{
					type: 'simple_command',
					name: {text: 'command'},
					suffix: {
						type: 'cmd_suffix',
						list: [{text: 'foo'}, {text: '--lol'}]
					}
				}]
			}]
		}
	);
});

test('command with stderr redirection to file', t => {
	const result = bashParser('ls 2> file.txt');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: {text: 'ls'},
				suffix: {
					type: 'cmd_suffix',
					list: [{
						type: 'io_redirect',
						op: '>',
						file: 'file.txt',
						numberIo: '2'
					}]
				}
			}]
		}]
	});
});

test('parse function declaration multiple lines', t => {
	const result = bashParser('foo () \n{\n command bar --lol;\n}');
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'function',
					name: 'foo',
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'command'},
								suffix: {type: 'cmd_suffix', list: [{text: 'bar'}, {text: '--lol'}]}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse function declaration', t => {
	const result = bashParser('foo	(){ command bar --lol;}');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'function',
					name: 'foo',
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'command'},
								suffix: {type: 'cmd_suffix', list: [{text: 'bar'}, {text: '--lol'}]}
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse subshell', t => {
	const result = bashParser('( ls )');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'subshell',
					list: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'ls'}
							}]
						}]
					}
				}]
			}]
		}
	);
});

// test.skip('parse case with substitutions in clause', t => {});

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');

	const expected = {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'case',
				clause: {
					text: 'foo'
				},
				cases: [{
					type: 'pattern',
					pattern: [{
						text: '*'
					}],
					body: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: {text: 'echo'},
								suffix: {
									type: 'cmd_suffix',
									list: [{text: 'bar'}]
								}
							}]
						}]
					}
				}]
			}]
		}]
	};

	t.is(JSON.stringify(result), JSON.stringify(expected));
});

