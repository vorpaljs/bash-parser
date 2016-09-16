'use strict';

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
module.exports = function newLineList() {
	return function * (tokens) {
		let lastToken = {EMPTY: true};
		for (const tk of tokens) {
			if (tk.NEWLINE) {
				if (lastToken.NEWLINE_LIST) {
					lastToken.NEWLINE_LIST += '\n';
					if (lastToken.loc) {
						lastToken.loc.endLine++;
					}
					continue;
				} else {
					tk.NEWLINE_LIST = '\n';
					delete tk.NEWLINE;
				}
			}
			if (!lastToken.EMPTY) {
				yield lastToken;
			}
			lastToken = tk;
		}

		if (!lastToken.EMPTY) {
			yield lastToken;
		}
	};
};

