import * as _fieldSplitting from './field-splitting';

export {default as parameterExpansion} from './parameter-expansion';
export {default as commandExpansion} from './command-expansion';
export {default as arithmeticExpansion} from './arithmetic-expansion';
export {default as aliasSubstitution} from './alias-substitution';
export {default as defaultNodeType} from './default-node-type';

export {default as tildeExpanding} from './tilde-expanding';
export {default as pathExpansion} from './path-expansion';
export {default as quoteRemoval} from './quote-removal';
export {default as identifySimpleCommandNames} from './identify-simplecommand-names';
export {default as identifyMaybeSimpleCommands} from './identify-maybe-simple-commands';
export {default as operatorTokens} from './operator-tokens';
export {default as reservedWords} from './reserved-words';
export {default as separator} from './separator';
export {default as linebreakIn} from './linebreak-in';
export {default as forNameVariable} from './for-name-variable';
export {default as functionName} from './function-name';
export {default as ioNumber} from './io-number';
// export {default as removeTempObject} from './remove-temp-object';
export {default as newLineList} from './new-line-list';
export {default as assignmentWord} from './assignment-word';
export {default as syntaxerrorOnContinue} from './syntaxerror-oncontinue';

export const fieldSplitting = _fieldSplitting;
