:- use_module(library(lists)).
:- use_module(library(clpfd)).

%! second_last(+List, ?Element)
% Gets/Verifies penultimate element of the List
second_last(L, X) :- append(_, [X, _], L).

%! rotate_board_clockwise(+Matrix, -NewMatrix, NumberRotations)
% Rotates the Matrix N (NumberRotations) times clockwise using @see rotate_board_helper
% If the number is negative, the matrix will rotate counter-clockwise
rotate_board_clockwise(Board, NewBoard, N) :-
	Nmod is N mod 4,
	rotate_board_helper(Nmod, Board, NewBoard).

%! rotate_board_helper(NMod4, +Matrix, -NewMatrix)
% Applies the correct transformations to the Matrix bearing the mod 4 of the Number of Rotations
% Case 0: Matrix is return in its original form
rotate_board_helper(0, Board, Board).

% Case 1: Matrix is transposed and reversed each line to rotate one time clockwise
rotate_board_helper(1, Board, NewBoard) :-
	transpose(Board, ProvBoard),
	maplist(reverse, ProvBoard, NewBoard).

% Case 2: Matrix is reversed one time as a whole and each line to rotate two times 
rotate_board_helper(2, Board, NewBoard) :-
	reverse(Board, ProvBoard),
	maplist(reverse, ProvBoard, NewBoard).

% Case 3: Matrix is transposed and then reversed to rotate counter-clockwise one time
rotate_board_helper(3, Board, NewBoard) :-
	transpose(Board, ProvBoard),
	reverse(ProvBoard, NewBoard).

%! replace_column(+Position,+Element,+List,-NewList).
% Replace the Element in the desired Position of the List
% Returns the result to the NewList argument
% (Can also be used to verify if the NewList is equal to the List with the new Element)
replace_column(0, Value, [_|T], [Value | T]) :- !.
replace_column(Column, Value, [H | T], [H | T2]) :-
	Column > 0,
	NextColumn is Column - 1,
	replace_column(NextColumn, Value, T, T2).

%! replace_matrix(+Row, +Column, +Element, +Matrix, -NewMatrix).
% Replace the Element in the desired Row and Column of the input Matrix
% Returns the result with the NewMatrix
% Uses @see replace_column after finding the correct Row
% (Can also be used to verify if the NewMatrix is equal to the Matrix with the new Element)
replace_matrix(0, Column, Value, [Line | T], [Line2 | T]) :- !, replace_column(Column, Value, Line, Line2).
replace_matrix(Row, Column, Value, [H | T], [H | T2]) :-
	Row > 0,
	NextRow is Row - 1,
	replace_matrix(NextRow, Column, Value, T, T2).

%! replace_row(+RowNumber, +NewRow, +Matrix, -NewMatrix)
% Replaces NewRow in the RowNumber position in the Matrix
% Returns the Matrix with the NewRow in the desired position to the NewMatrix arg
% (Can also be used to verify if the NewMatrix is equal to the Matrix with the new row)
replace_row(0, NewRow, [_ | T], [NewRow | T]) :- !.
replace_row(Row, NewRow, [H | T], [H | T2]) :-
	Row > 0,
	NextRow is Row - 1,
	replace_row(NextRow, NewRow, T, T2).

%! get_element_matrix(+Matrix, +Row, +Column, -Element)
% Gets the Element in the position defined by the Row and Column in the Matrix
% (Can also be used to verify if the Element is in the Row - Column position of the Matrix)
get_element_matrix(Matrix, Row, Column, Element) :-
	nth0(Row, Matrix, SearchedRow),
	nth0(Column, SearchedRow, Element).