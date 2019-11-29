:- ensure_loaded('board_states.pl').
:- ensure_loaded('interface.pl').
:- ensure_loaded('move.pl').
:- ensure_loaded('display.pl').
:- ensure_loaded('points_calculation.pl').

% Only for debug purposes
read_move_debug(Move) :-
	empty_board(X),
	read_move(Move, X).

move_debug(Player) :- 
	%empty_board(X),
	%initialize_board(X, Board), !, 
	second_middle_board(Board),
	display_game(Board, Player),
	read_move(Move, Board),
	move(Board, Move, NewBoard, Player), !,
	next_player(Player, NextPlayer),
	display_game(NewBoard, NextPlayer).

display_debug :- 
	clear,
	%empty_board(X),
	debug_board(X),
	initialize_board(X, Board), !,
	display_game(Board, 'John Doe').

findall_moves(Player, List) :-
	second_middle_board(Board),
	display_game(Board, Player),
	findall([IC, IR] - [FC, FR], move(Board, [IC, IR, FC, FR], _, Player), List).

move_debug_2(IC, IR, FC, FR) :- 
	%empty_board(X),
	%initialize_board(X, Board), !, 
	second_middle_board(Board),
	move(Board, [IC, IR, FC, FR], _, 0).

move_debug_3(IC, IR) :- 
	%empty_board(X),
	%initialize_board(X, Board), !, 
	second_middle_board(Board),
	move(Board, [IC, IR, 2, 3], _, 0).

inside_board_debug(C, R) :-
	empty_board(X),
	inside_board(X, C, R).

all_moves_debug(Player, Moves) :- 
	second_middle_board(Board),
	findall_moves(Board, Player, Moves).

pass_move_debug(Player) :-
	second_middle_board(Board),
	pass_move(Board, Player).

points_calculation_debug:-
    final_board(X),
    value(X, wt, Points),
    write('Points: '), write(Points).

rand_move_db(Player, Move) :-
	second_middle_board(X),
	random_move(X, Player, Move).