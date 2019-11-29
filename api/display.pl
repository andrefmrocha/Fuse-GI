:- use_module(library(ansi_term)).
:- ensure_loaded('board_pieces.pl').
:- ensure_loaded('board_generation.pl').

% created to ensure there's a clear separation line between board lines
%! middle_separator(+Line, +Head, +End)
% Prints separators for the middle Line's
% using the help of @see middle_separator_helper
% Begins by printing the Head of the Lin and then calls the helper
middle_separator(Line, Head, Tail) :- 
	write(' '), Head, 
	middle_separator_helper(Line, Tail).

% create a separator between the board and the bottom left and right corners

%! middle_separator_helper(+Line, +End)
% Helps to print separators for the middle Line's
% Switches between hdiv and midv until the Line is empty, when it prints the End
middle_separator_helper([_ | []], Element) :- hdiv, Element, nl.

middle_separator_helper([_ | T], Last) :- hdiv, mdiv, middle_separator_helper(T, Last).

%! outskirt_separator_helper(+Line, +Middle, +End)
% Helps to print separators for the outskirt Line's
% Switches between hdiv and Middle until the Line is empty, when it prints the End
outskirt_separator_helper([_ | []], _, End) :- hdiv, End, nl.

outskirt_separator_helper([_ | R], Middle, End) :- hdiv, Middle, outskirt_separator_helper(R, Middle, End).

%! outskirt_separator(+Line, +Head, +Middle, +End)
% Prints separators for the outskirt Line's
% using the help of @see outskirt_separator_helper
% Begins by shortening the Line by 2 and prints the Head of the Line
% (helper takes care of the rest)
outskirt_separator([_, _ | Rest], Head, Middle, End) :-
	write(' '), Head,
	outskirt_separator_helper(Rest, Middle, End).

%! display_first_line(+Board, +RowIndex). -> 0
% Displays firs line of the Board and prints its index (RowIndex)
% Calls @see outskirt_separator to display the first separator
% with ulc as the head of the line, td as the middle separators and urc as the end
% Uses @see display_line to display the line and
% calls @see display_second_line to print the second line after incrementing the row index
display_first_line([H | T], N) :-
	write('   '), outskirt_separator(H, ulc, td, urc),
	write(N), write('  '), display_line(H), nl, !,
	N1 is N + 1,
	display_second_line(T, N1).

% display_second_line(+Board, +RowIndex). -> 1
% Displays second line of the Board and prints its index (RowIndex)
% Calls @see middle_separator to display the second separator
% with ulc as the head of the line and urc as the end
% Uses @see display_line to display the line and, after incrementing the row index,
% calls @see general_line_display to print every other line except the last one
display_second_line([H | T], N) :-
	middle_separator(H, ulc, urc),
	write(N), vdiv, display_line(H), nl, !,
	N1 is N + 1,
	general_line_display(T, N1).

% general_line_display(+Board, +RowIndex). -> [2:N[
% Displays every other line of the Board and prints its index (RowIndex)
% Calls @see middle_separator to display the middle separator
% with tr as the head of the line and tl as the end
% Uses @see display_line to display the line and, after incrementing the row index,
% calls itself to print every other line except the last one, when it
% calls @see display_last_line.
general_line_display([H | []], N):-
	display_last_line(H, N), !.
general_line_display([H | T], N) :-
	middle_separator(H, tr, tl),
	write(N), vdiv, display_line(H), nl, !,
	N1 is N + 1,
	general_line_display(T, N1).

% display_last_line(+Line, +RowIndex). -> N
% Displays last Line of the Board and prints its index (RowIndex)
% Calls @see middle_separator to display the second last separator
% with llc as the head of the line and lrc as the end
% Uses @see display_line to display the line and, finally,
% calls @see outskirt_separator to display the last separator
% with çlc as the head of the line, tu as the middle separators and lrc as the end
display_last_line(Line, N) :-
	middle_separator(Line, llc, lrc),
    write(N),
	write('  '), display_line(Line), nl, !,
	write('   '), outskirt_separator(Line, llc, tu, lrc).

%! display_line(+Line).
% Displays Line (middle part)
% Ex: ║⬤║  ║  ║  ║  ║⬤║
display_line([]).
display_line([corner | []]):-
	corner,
	null.
display_line([Element | Rest]) :- 
	Element, vdiv,
	display_line(Rest).

%! display_game(+Board, +Player)
% Prints player turn and
% Uses @see write_columns_index to print the columns indexes defining the first index to A
% and @see display_first_line that will print the board by calling other functions
% When calling display_first_line it also defines the first row index to 0
display_game([Line | TBoard], Player):-
	format(' Player turn: ~d~n~n', [Player]),
	write_columns_index(Line, 'A'),
	display_first_line([Line | TBoard], 0).

%! write_columns_helper(+Line, +Letter)
% Helper function that writes current Letter and "increments" it in alphabetical order
% until Line is empty, when it ends with a new line.
write_columns_helper([_ | []], Letter) :-
	!, write(Letter), nl.

write_columns_helper([_ | TLine], Letter) :-
	write(Letter), write('  '),
	char_code(Letter, LetterCode),	% TODO: ver se há forma mais simples de iterar
    NextLetterCode is LetterCode + 1,
	char_code(NextLetter, NextLetterCode),
	write_columns_helper(TLine, NextLetter).

%! write_columns_index(+Line, +Letter)
% Uses @see write_columns_helper to write column indexes starting with letter Letter
% Line is used to count number of columns
write_columns_index(Line, Letter) :-
	write('   '), write_columns_helper(Line, Letter).