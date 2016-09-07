'use strict';
require('babel-polyfill');
const bashParser = require('../src');

const $ = global.$;
const ast = bashParser('echo hello world');
$('#ast').html(JSON.stringify(ast, null, 2));
