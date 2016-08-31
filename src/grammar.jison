/* -------------------------------------------------------
   The grammar symbols
   ------------------------------------------------------- */
%token  WORD
%token  ASSIGNMENT_WORD
%token  NAME
%token  NEWLINE
%token  IO_NUMBER
%token  NEWLINE_LIST
%token  LINEBREAK_IN
%token  SEPARATOR_OP


/* The following are the operators mentioned above. */

%token  AND_IF    OR_IF   DSEMI
/*      '&&'      '||'     ';;'   */
%token  OPEN_PAREN CLOSE_PAREN
%token  LESS  GREAT
%token  DLESS DGREAT  LESSAND GREATAND  LESSGREAT DLESSDASH
/*      '<<'   '>>'   '<&'     '>&'     '<>'       '<<-'   */

%token  CLOBBER
/*      '>|'   */

%token  PIPE
/*      '|'   */

/* The following are the reserved words. */

%token  If    Then    Else    Elif    Fi    Do    Done
/*      'if'  'then'  'else'  'elif'  'fi'  'do'  'done'   */

%token  Case    Esac    While   Until   For
/*      'case'  'esac'  'while' 'until' 'for'  */

/* These are reserved words, not operator tokens, and are
   recognized when reserved words are recognized. */

%token  Lbrace    Rbrace    Bang
/*      '{'      '}'       '!'   */

%token  In
/*      'in'   */
%token  EOF



/* -------------------------------------------------------
   The Grammar
   ------------------------------------------------------- */
%ebnf



%start  complete_command
%%
complete_command : list separator EOF
					  { return $list }
				 | list EOF
					  { return $list }
				 ;
list             : list separator and_or
					  -> yy.listAppend($list, $and_or)
				 | and_or
					  -> yy.list($and_or)
				 ;
and_or           : pipeline
					  -> $pipeline
				 | and_or AND_IF linebreak pipeline
					  -> yy.andAndOr($and_or, $pipeline)
				 | and_or OR_IF linebreak pipeline
					  -> yy.orAndOr($and_or, $pipeline)
				 ;
pipeline         : pipe_sequence
					-> yy.pipeLine($pipe_sequence)
				 | Bang pipe_sequence
					  -> yy.bangPipeLine($pipe_sequence)
				 ;
pipe_sequence   : command
					  -> yy.pipeSequence($command)
				 | pipe_sequence PIPE linebreak command
					  -> yy.pipeSequenceAppend($pipe_sequence, $command)
				 ;
command         : simple_command
				 | compound_command
				 | compound_command redirect_list
				 | function_definition
				 ;
compound_command : brace_group
				 | subshell
				 | for_clause
				 | case_clause
				 | if_clause
				 | while_clause
				 | until_clause
				 ;
subshell         : OPEN_PAREN compound_list CLOSE_PAREN
					-> yy.subshell($compound_list)
				 ;
compound_list   : term -> $term
				 | NEWLINE_LIST term -> $term

				 | term separator -> $term
				 | NEWLINE_LIST term separator -> $term
				 ;

term             : term separator and_or
				  -> yy.termAppend($term, $and_or)
				 | and_or
				  -> yy.term($and_or)
				 ;
for_clause       : For name linebreak do_group
				 	-> yy.forClauseDefault($name, $do_group, $For.loc)
				 | For name LINEBREAK_IN separator do_group
				 	-> yy.forClauseDefault($name, $do_group, $For.loc)
				 | For name In separator do_group
				 	-> yy.forClauseDefault($name, $do_group, $For.loc)
				 | For name in wordlist separator do_group
					-> yy.forClause($name, $wordlist, $do_group, $For.loc)  /* todo: here allow only ';' separator */
				 ;
name             : NAME                    /* Apply rule 5 */
				 ;
in               : In                      /* Apply rule 6 */
				 ;
wordlist         : WORD+
				 ;
case_clause     : Case WORD linebreak in linebreak case_list    Esac
					-> yy.caseClause($WORD, $case_list, $Case.loc, $Esac.loc)
				 | Case WORD linebreak in linebreak case_list_ns Esac
				 	-> yy.caseClause($WORD, $case_list_ns, $Case.loc, $Esac.loc)
				 | Case WORD linebreak in linebreak             Esac
				 	-> yy.caseClause($WORD, null, $Case.loc, $Esac.loc)
				 ;
case_list_ns     : case_list case_item_ns
					-> yy.caseListAppend($case_list, $case_item_ns)
				 | case_item_ns
				 	-> yy.caseList($case_item_ns)
				 ;
case_list        : case_list case_item
					-> yy.caseListAppend($case_list, $case_item)
				 | case_item
				 	-> yy.caseList($case_item)
				 ;
case_item_ns     : pattern CLOSE_PAREN linebreak
				 	-> yy.caseItem($pattern, null, $pattern[0].loc, $CLOSE_PAREN.loc)
				 | pattern CLOSE_PAREN compound_list linebreak
				 	-> yy.caseItem($pattern, $compound_list, $pattern[0].loc, $compound_list.loc)
				 | OPEN_PAREN pattern CLOSE_PAREN linebreak
				 	-> yy.caseItem($pattern, null, $OPEN_PAREN.loc, $CLOSE_PAREN.loc )
				 | OPEN_PAREN pattern CLOSE_PAREN compound_list linebreak
				 	-> yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $compound_list.loc)
				 ;
case_item        : pattern CLOSE_PAREN linebreak DSEMI linebreak
					-> yy.caseItem($pattern, null, $pattern[0].loc, $DSEMI.loc)
				 | pattern CLOSE_PAREN compound_list DSEMI linebreak
				 	-> yy.caseItem($pattern, $compound_list, $pattern[0].loc, $DSEMI.loc)
				 | OPEN_PAREN pattern CLOSE_PAREN linebreak     DSEMI linebreak
				 	-> yy.caseItem($pattern, null, $OPEN_PAREN.loc, $DSEMI.loc )
				 | OPEN_PAREN pattern CLOSE_PAREN compound_list DSEMI linebreak
				 	-> yy.caseItem($pattern, $compound_list, $OPEN_PAREN.loc, $DSEMI.loc)
				 ;
pattern         : WORD        /* Apply rule 4 */
					-> yy.pattern($WORD)
				 | pattern PIPE WORD        /* Do not apply rule 4 */
				 	-> yy.patternAppend(pattern, $WORD)
				 ;
if_clause       : If compound_list Then compound_list else_part Fi
					-> yy.ifClause($2, $4, $else_part, $If.loc, $Fi.loc)
				 | If compound_list Then compound_list           Fi
					-> yy.ifClause($2, $4, null, $If.loc, $Fi.loc)
				 ;
else_part       : Elif compound_list Then compound_list
					-> yy.ifClause($2, $4, null, $Elif.loc, $4.loc)
				 | Elif compound_list Then compound_list else_part
					-> yy.ifClause($2, $4, $else_part, $Elif.loc, $else_part.loc)
				 | Else compound_list
					-> yy.elseClause($compound_list, $Else)
				 ;
while_clause     : While compound_list do_group
					-> yy.while($2, $3, $While)
				 ;
until_clause     : Until compound_list do_group
					-> yy.until($2, $3, $Until)
				 ;
function_definition : fname OPEN_PAREN CLOSE_PAREN linebreak function_body
					-> yy.functionDefinition($fname, $function_body)
				 ;
function_body   : compound_command                /* Apply rule 9 */
				 | compound_command redirect_list /* Apply rule 9 */
				 ;

fname           : NAME                            /* Apply rule 8 */
				 ;
brace_group     : Lbrace compound_list Rbrace
					-> yy.braceGroup($compound_list, $Lbrace.loc, $Rbrace.loc)
				 ;
do_group         : Do compound_list Done           /* Apply rule 6 */
					-> yy.doGroup($compound_list, $Do.loc, $Done.loc)
				 ;
simple_command   : cmd_prefix cmd_word cmd_suffix
					->yy.command($cmd_prefix, $cmd_word, $cmd_suffix)
				 | cmd_prefix cmd_word
					->yy.command($cmd_prefix, $cmd_word, null)
				 | cmd_prefix
					->yy.command($cmd_prefix, {text:'', type:'word'})
				 | cmd_name cmd_suffix
					->yy.command(null, $cmd_name, $cmd_suffix)
				 | cmd_name
					->yy.command(null, $cmd_name)
				 ;
cmd_name         : WORD
					->yy.commandName(yytext) /* Apply rule 7a */
				 ;
cmd_word         : WORD
					-> yytext  /* Apply rule 7B */
				 ;
cmd_prefix       :  io_redirect
					-> yy.prefix($io_redirect)
				 | cmd_prefix io_redirect
					-> yy.prefixAppend($1, $2)
				 |  ASSIGNMENT_WORD
				   -> yy.prefix($1)
				 | cmd_prefix ASSIGNMENT_WORD
					-> yy.prefixAppend($1, $2)
				 ;
cmd_suffix       : io_redirect
					-> yy.suffix($io_redirect)
				 | cmd_suffix io_redirect
					-> yy.suffixAppend($cmd_suffix, $io_redirect)
				 | WORD
					-> yy.suffix($1)
				 | cmd_suffix WORD
					-> yy.suffixAppend($cmd_suffix, $2)
				 ;
redirect_list   : io_redirect
					-> [$io_redirect]
				 | redirect_list io_redirect
					-> [$redirect_list.concat($io_redirect)]
				 ;
io_redirect     : io_file
					-> $io_file
				 | IO_NUMBER io_file
					-> yy.numberIoRedirect($io_file, $1)
				 |           io_here
				 | IO_NUMBER io_here
				 ;
io_file         : LESS      filename
					->yy.ioRedirect($1, $filename)
				 | LESSAND   filename
					->yy.ioRedirect($1, $filename)
				 | GREAT     filename
					->yy.ioRedirect($1, $filename)
				 | GREATAND filename
					->yy.ioRedirect($1, $filename)
				 | DGREAT   filename
					->yy.ioRedirect($1, $filename)
				 | LESSGREAT filename
					->yy.ioRedirect($1, $filename)
				 | CLOBBER   filename
					->yy.ioRedirect($1, $filename)
				 ;


filename         : WORD                     /* Apply rule 2 */
				 ;
io_here         : DLESS    here_end
				 | DLESSDASH here_end
				 ;
here_end         : WORD                     /* Apply rule 3 */
				 ;
linebreak       : NEWLINE_LIST
				 | /* empty */
				 ;

separator       : SEPARATOR_OP
				 | NEWLINE_LIST
				 ;
