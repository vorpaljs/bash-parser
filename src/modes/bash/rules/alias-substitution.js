'use strict';

const compose = require('compose-function');
const identity = require('identity-function');
const map = require('../../../vendored/map-iterable');
const values = require('object-values');
const merge = require('../../../vendored/transform-spread-iterable');
const tokens = require('../../../utils/tokens');

const expandAlias = (preAliasLexer, resolveAlias, reservedWords) => {
	function * tryExpandToken(token, expandingAliases) {
		if (expandingAliases.indexOf(token.value) !== -1) {
			yield token;
			return;
		}
		const result = resolveAlias(token.value);
		if (result === undefined) {
			yield token;
		} else {
			for (const newToken of preAliasLexer(result)) {
				if (newToken.is('WORD') || reservedWords.some(word => newToken.is(word))) {
					yield * tryExpandToken(
						newToken,
						expandingAliases.concat(token.value)
					);
				} else if (!newToken.is('EOF')) {
					yield newToken;
				}
			}
		}
	}

	function expandToken(tk) {
		return Array.from(tryExpandToken(tk, []));
	}

	const visitor = {
		WORD: expandToken
	};

	reservedWords.forEach(w => {
		visitor[w] = expandToken;
	});
	return visitor;
};

module.exports = (options, mode, previousPhases) => {
	if (typeof options.resolveAlias !== 'function') {
		return identity;
	}

	const preAliasLexer = compose.apply(null, previousPhases.reverse());
	const visitor = expandAlias(preAliasLexer, options.resolveAlias, values(mode.enums.reservedWords));

	return compose(
		merge,
		map(
			tokens.applyTokenizerVisitor(visitor)
		)
	);
};
