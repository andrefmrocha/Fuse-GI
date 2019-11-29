%! ccA(?X)
% Returns or verifies if X is the code of 'A'
ccA(X) :- char_code('A', X).

%! cc0(?X)
% Returns or verifies if X is the code of 0
cc0(X) :- char_code('0', X).

%! read_move(-Move, +Board) :- 
% Returns list with the move in the format [ICN, IRN, FCN, FRN].
% ICN :- Initial Column Number
% IRN :- Initial Row Number
% FCN :- Final Column Number
% FRN :- Final Row Number
% This is accomplished with the help of @see read_string to read the input
% and a parser (@see parse_move)
read_move(Move, Board):-
    write(' Move: '),
    read_string(Input),
    parse_move(Input, Move, Board).

%! parse_move(+Input, -Move, +Board)
% Tests whether the length of the input is 4
% and calls @see valid_move_input to validate it
parse_move(Input, Move, Board) :-
	length(Input, 4),
	valid_move_input(Input, Move, Board).

% Case stuck in error: calls read_move again
parse_move(Input, Move, Board) :-
	length(Input, 4),
	valid_move_input(Input, _, Board), !, read_move(Move, Board).

% Case Enter: If only enter was pressed the input is empty and @see read_move is called again
parse_move([], M, B) :- !, read_move(M, B).

% Case Exit: If exit is written, abort program
parse_move(['e', 'x', 'i', 't'], _, _) :- write(' Exiting\n'), !, abort.

% Case Invalid Input: shows error message warning the user and calls @see read_move
parse_move(_, M, B) :- write(' Wrong format: InitialColumn InitialRow FinalColumn FinalRow (without spacing).\n Ex:a1d1\n\n'), !, read_move(M, B).

%! valid_move_input(+Input, -Move, +Board)
% Validates each of the four input chars 
% by calling @see valid_column_input and @see valid_row_input
% tests if the initial and final position are different and 
% transforms each of the Inputs to a Number returned in the list Move in the same order
valid_move_input([IC, IR, FC, FR], [IC_N, IR_N, FC_N, FR_N], [Line | Board]) :-
	valid_column_input(IC, IC_N, Line),
	valid_row_input(IR, IR_N, [Line | Board]),
	valid_column_input(FC, FC_N, Line),
	valid_row_input(FR, FR_N, [Line | Board]),
	[IC_N, IR_N] \== [FC_N, FR_N].

%! valid_column_input(+Input, -ColumnNumber, +Line)
% Receives an atom letter as an input and parses it to a Number
% Verifies if that ColumnNumber can be an index of the Line
valid_column_input(Input, ColumnNumber, BoardLine) :-
	upcase_atom(Input, Upper),	% upper cases the IC
	char_code(Upper, CodeC),
	ccA(CCA),
	ColumnNumber is CodeC - CCA,
	ColumnNumber >= 0,
	length(BoardLine, Comp),
	ColumnNumber < Comp.

%! valid_row_input(+Input, -RowNumber, +Line)
% Receives a atom number as an input and
% Verifies if that RowNumber can be an index of the Board
valid_row_input(Input, RowNumber, Board) :-
	atom_number(Input, RowNumber),
	RowNumber >= 0,
	length(Board, Comp),
	RowNumber < Comp.

%! read_string(-CharList)
% reads the input, parses it to atom codes
% from this to a string and finally to a list of characters that is returned
read_string(CharList) :-
    current_input(Input),
    read_line_to_codes(Input, Codes),
    string_codes(String, Codes),
	atom_chars(String, CharList).

%! read_menu(-Option, +Type)
% Reads Menu Input (@see read_string) and parses it depending on the type (@see parse_menu)
% Returning a list with the character corresponding to the chosen option
read_menu(Option, Type):-
    write(' Option: '),
    read_string(Input), 
    parse_menu(Input, Option, Type).

%! parse_menu(+Input, -Option, +Type)
% Parses Input depending on the menu Type and
% Returns the parsed option to the Option argument
% May through error signal if no valid input was given
% in this case the user will be asked for the Option again
parse_menu(['0'], exit, main).
parse_menu(['1'], pvp, main).
parse_menu(['2'], pvb, main).
parse_menu(['3'], bvb, main).
parse_menu(['4'], instructions, main).

parse_menu(['0'], back, bot).
parse_menu(['1'], 0, bot).
parse_menu(['2', '.', '1' ], 1, bot).
parse_menu(['2', '.', '2' ], 2, bot).
parse_menu(['3', '.', '1' ], 3, bot).
parse_menu(['3', '.', '2' ], 4, bot).

parse_menu(['0'], back, order).
parse_menu(['1'], human, order).
parse_menu(['2'], bot, order).

parse_menu([], O, Type) :- !, read_menu(O, Type).
parse_menu(_, O, Type) :- 
	noptions(Type, NOptions),
	format(' Invalid Menu Option (choose a number from 0 to ~d)~n', [NOptions]),
	!, read_menu(O, Type).

%! noptions(?MenuType, ?NumberOfOptions)
% Associates a MenuType with its NumberOfOptions
noptions(main, 4).
noptions(bot, 4).
noptions(order, 2).

%! read_dimension(-Output, +Dimension)
% Asks for the Dimension defined (width = columns or height = rows)
% Reads the user answer (@see read_string) and parses it
% using @see parse_dimensions
read_dimension(Output, Dimension):-
	format(' Number of ~s: ', [Dimension]),
    read_string(Input),
    parse_dimension(Input, Output, Dimension).

%! parse_dimension(+Input, -Output, +Dimension)
% Parses the Input verifying if it is an integer
% between 0 (minimum board size) and 8 (maximum board size)
parse_dimension([Input], Output, _) :-
	atom_number(Input, Output),
	Output > 0, Output < 7, !.

% Case Enter: If only enter was pressed the input is empty and @see read_dimension is called again
parse_dimension([], Output, Dimension) :- !, read_dimension(Output, Dimension).

% Case Exit: If exit is written, abort program immediatly
parse_dimension(['e', 'x', 'i', 't'], _, _) :- write(' Exiting\n'), !, abort.

% Case Invalid Input: shows error message warning the user about the minimum and maximum board sizes and calls @see read_dimension
parse_dimension(_, Output, Dimension) :- format(' ~s must be an integer between 0 and 7~n', [Dimension]), !, read_dimension(Output, Dimension).

stop_and_wait(bvb):-
	write('Press Enter to continue...'),
	read_string(_).
stop_and_wait(_).
