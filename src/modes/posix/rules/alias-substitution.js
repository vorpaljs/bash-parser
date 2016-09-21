'use strict';
/* eslint-disable camelcase */
/* eslint-disable babel/arrow-parens */

const compose = require('compose-function');
const identity = require('identity-function');

module.exports = (options, utils, previousPhases) => {
	if (typeof options.resolveAlias !== 'function') {
		return identity;
	}

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

		for (const token of tokens) {
			yield * tryExpandToken(token, []);
		}
	};
};
