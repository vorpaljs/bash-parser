import {tokens} from '../../../../utils/index';

export default function end() {
	return {
		nextReduction: null,
		tokensToEmit: [tokens.eof()]
	};
}
