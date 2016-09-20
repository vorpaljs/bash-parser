'use strict';
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');

module.exports = (options, previousPhases) => {
	const preAliasLexer = compose.apply(null, previousPhases.reverse());
	return function * aliasSubstitution(tokens) {
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
