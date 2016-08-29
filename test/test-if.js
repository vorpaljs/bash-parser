'use strict';
const test = require('ava');
const bashParser = require('../src');
/* eslint-disable camelcase */
test('parse if', t => {
	const result = bashParser('if true; then echo 1; fi');
	// console.log(inspect(result, {depth:null}))
	t.deepEqual(
		result, {
			type: 'complete_command',
			and_ors: [{
				type: 'pipeline',
				commands: [{
					type: 'if',
					clause: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
			type: 'complete_command',
			and_ors: [{
				type: 'pipeline',
				commands: [{
					type: 'if',
					clause: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
			type: 'complete_command',
			and_ors: [{
				type: 'pipeline',
				commands: [{
					type: 'if',
					clause: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
			type: 'complete_command',
			and_ors: [{
				type: 'pipeline',
				commands: [{
					type: 'if',
					clause: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
								type: 'simple_command',
								name: {text: 'true'}
							}]
						}]
					},
					then: {
						type: 'compound_list',
						and_ors: [{
							type: 'pipeline',
							commands: [{
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
							type: 'compound_list',
							and_ors: [{
								type: 'pipeline',
								commands: [{type: 'simple_command', name: {text: 'false'}}]
							}]
						},
						then: {
							type: 'compound_list',
							and_ors: [{
								type: 'pipeline',
								commands: [{
									type: 'simple_command',
									name: {text: 'echo'},
									suffix: {type: 'cmd_suffix', list: [{text: '3'}]}
								}]
							}]
						},
						else: {
							type: 'compound_list',
							and_ors: [{
								type: 'pipeline',
								commands: [{
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
