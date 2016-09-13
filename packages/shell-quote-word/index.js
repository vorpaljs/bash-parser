'use strict';

var META = '|&;()<> \\t';
var BAREWORD = '(\\\\[\'"' + META + ']|[^\\s\'"' + META + '])+';
var SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
var DOUBLE_QUOTE = '\'((\\\\\'|[^\'])*?)\'';

var TOKEN = '';
for (var i = 0; i < 4; i++) {
	TOKEN += (Math.pow(16, 8) * Math.random()).toString(16);
}

module.exports = function parse(s) {
	var chunker = new RegExp([
		'(' + BAREWORD + '|' + SINGLE_QUOTE + '|' + DOUBLE_QUOTE + ')*'
	].join('|'), 'g');
	var match = s.match(chunker).filter(Boolean);
	var commented = false;

	if (!match) {
		return [];
	}

	return match.map((s, j) => {
		if (commented) {
			return undefined;
		}

		// Hand-written scanner/parser for Bash quoting rules:
		//
		//  1. inside single quotes, all characters are printed literally.
		//  2. inside double quotes, all characters are printed literally
		//	 except variables prefixed by '$' and backslashes followed by
		//	 either a double quote or another backslash.
		//  3. outside of any quotes, backslashes are treated as escape
		//	 characters and not printed (unless they are themselves escaped)
		//  4. quote context can switch mid-token if there is no whitespace
		//	 between the two quote contexts (e.g. all'one'"token" parses as
		//	 "allonetoken")
		var SQ = '\'';
		var DQ = '"';
		var BS = '\\';
		var quote = false;
		var esc = false;
		var out = '';

		for (var i = 0, len = s.length; i < len; i++) {
			var c = s.charAt(i);
			if (esc) {
				out += c;
				esc = false;
			} else if (quote) {
				if (c === quote) {
					quote = false;
				} else if (quote === SQ) {
					out += c;
				} else if (c === BS) {
					i += 1;
					c = s.charAt(i);
					if (c === DQ || c === BS) {
						out += c;
					} else {
						out += BS + c;
					}
				} else {
					out += c;
				}
			} else if (c === DQ || c === SQ) {
				quote = c;
			} else if (RegExp('^#$').test(c)) {
				commented = true;
				if (out.length) {
					return [out, {comment: s.slice(i + 1) + match.slice(j + 1).join(' ')}];
				}
				return [{comment: s.slice(i + 1) + match.slice(j + 1).join(' ')}];
			} else if (c === BS) {
				esc = true;
			} else {
				out += c;
			}
		}

		return out;
	})
	// finalize parsed aruments
	.reduce((prev, arg) => {
		if (arg === undefined) {
			return prev;
		}
		return prev.concat(arg);
	}, []);
};
