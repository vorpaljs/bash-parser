'use strict';
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');
const values = require('object-values');
const reservedWords = values(require('../../posix/enums/reserved-words'));

module.exports = (options, previousPhases) => {
	const preAliasLexer = compose.apply(null, previousPhases.reverse());

	return function * aliasSubstitution(tokens) {
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
