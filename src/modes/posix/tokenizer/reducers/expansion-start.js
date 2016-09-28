'use strict';

import last from 'array-last';
import expansionSpecialParameter from './expansion-special-parameter';
import expansionParameter from './expansion-parameter';
import expansionCommandOrArithmetic from './expansion-command-or-arithmetic';
import expansionParameterExtended from './expansion-parameter-extended';

import {isSpecialParameter} from '..';

export default function expansionStart(state, char) {
	if (char === '{') {
		return {
			nextReduction: expansionParameterExtended,
			nextState: state.appendChar(char)
		};
	}

	if (char === '(') {
		return {
			nextReduction: expansionCommandOrArithmetic,
			nextState: state.appendChar(char)
		};
	}

	if (char.match(/[a-zA-Z_]/)) {
		const newXp = {
			...last(state.expansion),
			parameter: char,
			type: 'parameter_expansion'
		};
		const expansion = state.expansion
			.slice(0, -1)
			.concat(newXp);

		return {
			nextReduction: expansionParameter,
			nextState: state.appendChar(char).setExpansion(expansion)
		};
	}

	if (isSpecialParameter(char)) {
		return expansionSpecialParameter(state, char);
	}

	return state.previousReducer(state, char);
}
