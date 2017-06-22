'use strict';
const filterIterator = require('filter-iterator');
const reverse = require('reverse-arguments');
const curry = require('curry');

const filter = curry.to(2, reverse(filterIterator));

module.exports = filter;
