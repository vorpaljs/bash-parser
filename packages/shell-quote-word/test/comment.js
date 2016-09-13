var test = require('tape');
var parse = require('../');

test('comment', function (t) {
	t.same(parse('beep#boop'), ['beep', {comment: 'boop'}]);
	t.same(parse('beep #boop'), ['beep', {comment: 'boop'}]);
	t.same(parse('beep # boop'), ['beep', {comment: 'boop'}]);
	t.same(parse('beep # "> boop"'), ['beep', {comment: '"> boop"'}]);
	t.same(parse('beep "#"'), ['beep', '#']);
	t.same(parse('beep #"#"#'), ['beep', {comment: '"#"#'}]);
	t.end();
});
