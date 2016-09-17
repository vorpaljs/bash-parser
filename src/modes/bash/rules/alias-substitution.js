'use strict';
// @flow
/* flow-include import type {Token} from '../../plugin'; */
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');
const values = require('object-values');
const tokenDelimiter = require('../../posix/token-delimiter');
const rules = require('../../posix/rules');
const reservedWords = values(require('../../posix/enums/reserved-words'));

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
			const name = token.WORD || reservedWords.reduce((result, word) => {
				if (token[word]) {
					return token[word];
				}
				return result;
			}, null);
			if (name && expandingAliases.indexOf(name) === -1 && token._.maybeStartOfSimpleCommand) {
				const result = options.resolveAlias(name);
				if (result !== undefined) {
					for (const newToken of preAliasLexer(result)) {
						if (!newToken.EOF) {
							yield * tryExpandToken(
								newToken,
								expandingAliases.concat(name)
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
