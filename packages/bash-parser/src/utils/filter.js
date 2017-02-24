import filterIterator from 'filter-iterator';
import reverse from 'reverse-arguments';
import curry from 'curry';

const filter = curry.to(2, reverse(filterIterator));

export default filter;
