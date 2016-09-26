'use strict';
export default function end() {
	return {
		nextReduction: null,
		tokensToEmit: [{
			type: 'EOF',
			value: ''
		}]
	};
}
