'use strict';
const test = require('ava');
const bashParser = require('../src');
const inspect = require('util').inspect;

test('command with one argument', t => {
	const result = bashParser('echo world');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				suffix: {
					type: 'cmd_suffix',
					list: [
						'world'
					]
				}
			}]
		}]
	});
});

test('command with pre-assignment', t => {
	const result = bashParser('TEST=1 run');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'run',
				prefix: {
					type: 'cmd_prefix',
					list: ['TEST=1']
				}
			}]
		}]
	});
});

test('commands with AND', t => {
	const result = bashParser('run && stop');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'and',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'run'}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'stop'}]
			}
		}]
	});
});

test('commands with AND \\n', t => {
	const result = bashParser('run && \n stop');
	// console.log(inspect(result, {depth: null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'and',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'run'}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'stop'}]
			}
		}]
	});
});

test('commands with OR', t => {
	const result = bashParser('run || cry');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			op: 'or',
			left: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'run'}]
			},
			right: {
				type: 'andOr',
				left: [{type: 'simple_command', name: 'cry'}]
			}
		}]
	});
});

test('no pre-assignment on suffix', t => {
	const result = bashParser('echo TEST=1');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				suffix: {
					type: 'cmd_suffix',
					list: ['TEST=1']
				}
			}]
		}]
	});
});

test('quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// console.log(inspect(result, {depth:null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				suffix: {
					type: 'cmd_suffix',
					list: ['TEST1 \'TEST2']
				}
			}]
		}]
	});
});

test('escaped double quotes within double quotes', t => {
	const result = bashParser('echo "TEST1 \\"TEST2"');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				suffix: {
					type: 'cmd_suffix',
					list: ['TEST1 "TEST2']
				}
			}]
		}]
	});
});

test('double quotes within single quotes', t => {
	const result = bashParser('echo \'TEST1 "TEST2\'');
	// console.log(inspect(result, {depth:null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				suffix: {
					type: 'cmd_suffix',
					list: ['TEST1 "TEST2']
				}
			}]
		}]
	});
});

test('command with multiple prefixes', t => {
	const result = bashParser('TEST1=1 TEST2=2 echo world');
	// console.log(inspect(result, {depth:null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo',
				prefix: {type: 'cmd_prefix', list: ['TEST1=1', 'TEST2=2']},
				suffix: {
					type: 'cmd_suffix',
					list: ['world']
				}
			}]
		}]
	});
});

test('multi line commands', t => {
	const result = bashParser('echo; \nls;\n');
	// console.log(inspect(result, {depth:null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'echo'
			}]
		}, {
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'ls'
			}]
		}]
	});
});

test('command with redirection to file', t => {
	const result = bashParser('ls > file.txt');
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'ls',
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['2']
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['2']
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					then: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
								left: [{type: 'simple_command', name: 'false'}]
							}]
						},
						then: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{
									type: 'simple_command',
									name: 'echo',
									suffix: {type: 'cmd_suffix', list: ['3']}
								}]
							}]
						},
						else: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{
									type: 'simple_command',
									name: 'echo',
									suffix: {type: 'cmd_suffix', list: ['2']}
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
	// console.log(inspect(result, {depth:null}))
	t.same(
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
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['$x']
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
	t.same(
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
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['$x']
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
	t.same(
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
								name: 'echo',
								suffix: {
									type: 'cmd_suffix',
									list: ['$x']
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'sleep',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
	t.same(
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
								name: 'true'
							}]
						}]
					},
					do: {
						type: 'term',
						andOrs: [{
							type: 'andOr',
							left: [{
								type: 'simple_command',
								name: 'sleep',
								suffix: {
									type: 'cmd_suffix',
									list: ['1']
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
	t.same(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left:
				[{
					type: 'simple_command',
					name: 'command',
					suffix: {
						type: 'cmd_suffix',
						list: ['foo', '--lol']
					}
				}]
			}]
		}
	);
});

test('command with stderr redirection to file', t => {
	const result = bashParser('ls 2> file.txt');
	// console.log(inspect(result, {depth:null}))
	t.same(result, {
		type: 'list',
		andOrs: [{
			type: 'andOr',
			left: [{
				type: 'simple_command',
				name: 'ls',
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

test('parse function declaration', t => {
	const result = bashParser('foo	(){ command bar --lol;}');
	// console.log(inspect(result, {depth:null}))
	t.same(
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
								name: 'command',
								suffix: {type: 'cmd_suffix', list: ['bar', '--lol']}
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
	t.same(
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
								name: 'ls'
							}]
						}]
					}
				}]
			}]
		}
	);
});

test('parse case', t => {
	const result = bashParser('case foo in * ) echo bar;; esac');
	// console.log(inspect(result, {depth: null}))
	t.same(
		result, {
			type: 'list',
			andOrs: [{
				type: 'andOr',
				left: [{
					type: 'case',
					clause: 'foo',
					cases: [{
						type: 'pattern',
						pattern: ['*'],
						body: {
							type: 'term',
							andOrs: [{
								type: 'andOr',
								left: [{
									type: 'simple_command',
									name: 'echo',
									suffix: {
										type: 'cmd_suffix',
										list: ['bar']
									}
								}]
							}]
						}
					}]
				}]
			}]
		}
	);
});
