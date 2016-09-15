'use strict';
// @flow
/* flow-include import type {Token} from './modes/plugin'; */
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');
const tokenDelimiter = require('./token-delimiter');
const rules = require('./tokenization-rules');

const buildPreAliasLexer = (options) => compose(
	rules.identifySimpleCommandNames(options),
	rules.functionName(options),
	rules.forNameVariable(options),
	rules.assignmentWord(options),
	rules.identifyMaybeSimpleCommands(options),
	rules.ioNumber(options),
	rules.linebreakIn(options),
	rules.reservedWords(options),
	rules.separator(options),
	rules.operatorTokens(options),
	rules.newLineList(options),
	tokenDelimiter(options)
);

module.exports = (options/* : Object*/) => {
	const preAliasLexer = buildPreAliasLexer(options);
	return function * aliasSubstitution(tokens/* : Iterable<Token>*/)/* : Generator<Token, void, void>*/ {
		function * tryExpandToken(token, expandingAliases) {
			if (expandingAliases.indexOf(token.WORD) === -1 && token._.maybeSimpleCommandName) {
				const result = options.resolveAlias(token.WORD);
				if (result !== undefined) {
					for (const newToken of preAliasLexer(result)) {
						if (!newToken.EOF) {
							yield * tryExpandToken(
								newToken,
								expandingAliases.concat(token.WORD)
							);
						}
					}
					return;
				}
			}

			yield token;
		}

		if (typeof options.resolveAlias === 'function') {
			for (const token of tokens) {
				yield * tryExpandToken(token, []);
			}
		} else {
			for (const token of tokens) {
				yield token;
			}
		}
	};
};
