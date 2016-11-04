import filter from './filter';

export const nonNull = tk => {
	return tk !== null;
};

export default filter(nonNull);
