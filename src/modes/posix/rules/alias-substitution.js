'use strict';
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');

module.exports = (options, utils, previousPhases) => {
	const preAliasLexer = compose.apply(null, previousPhases.reverse());
	return function * aliasSubstitution(tokens) {
		function * tryExpandToken(token, expandingAliases) {
			if (expandingAliases.indexOf(token.value) === -1 && token._.maybeSimpleCommandName) {
				const result = options.resolveAlias(token.value);
				if (result !== undefined) {
					for (const newToken of preAliasLexer(result)) {
						if (!newToken.is('EOF')) {
							yield * tryExpandToken(
								newToken,
								expandingAliases.concat(token.value)
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
