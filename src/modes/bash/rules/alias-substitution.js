'use strict';
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');
const values = require('object-values');
const reservedWords = values(require('../../posix/enums/reserved-words'));

module.exports = (options, utils, previousPhases) => {
	const preAliasLexer = compose.apply(null, previousPhases.reverse());

	return function * aliasSubstitution(tokens) {
		function * tryExpandToken(token, expandingAliases) {
			const isName = token.is('WORD') || reservedWords.some(word => token.is(word));
			const name = isName ? token.value : '';

			if (name && expandingAliases.indexOf(name) === -1 && token._.maybeStartOfSimpleCommand) {
				const result = options.resolveAlias(name);
				if (result !== undefined) {
					for (const newToken of preAliasLexer(result)) {
						if (!newToken.is('EOF')) {
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
