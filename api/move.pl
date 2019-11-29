:- use_module(library(random)).
:- use_module(library(lists)).
:- ensure_loaded('interface.pl').
:- ensure_loaded('utils.pl').
:- ensure_loaded('board_pieces.pl').
:- ensure_loaded('points_calculation.pl').

%! move(+Board, +Move, -NewBoard, +Player)
% Moves the given Board, with the given Move array for the given Player, forming 
% NewBoard
% @param Move is a list of 4 board coordinates

move(Board, [IC, IR, FC, FR], NewBoard, Player) :-
	get_element_matrix(Board, IR, IC, Element),
	select_piece(Player, Element),
	valid_push(IC, IR, FC, FR, Board, ProvNewBoard), %!, % descomentar para só dar T/F
	replace_matrix(IR, IC, null, ProvNewBoard, NewBoard).

%! valid_push(+IC, +IR, +FC, +FR, +Board, -NewBoard)
% Attempts to push the dis at (IC, IR) to (FC, FR) in the given board.
% It will try to move the piece in all directions. Stores result in NewBoard

valid_push(IC, IR, FC, FR, Board, NewBoard) :- top_move(IC, IR, FC, FR, Board, NewBoard).
valid_push(IC, IR, FC, FR, Board, NewBoard) :- bottom_move(IC, IR, FC, FR, Board, NewBoard).
valid_push(IC, IR, FC, FR, Board, NewBoard) :- right_move(IC, IR, FC, FR, Board, NewBoard).
valid_push(IC, IR, FC, FR, Board, NewBoard) :- left_move(IC, IR, FC, FR, Board, NewBoard).

%! top_move(+IC, +IR, +FC, +FR, +Board, -NewBoard):-
% Attemps to make a move from the top, being that, for this to happen,
% the initial row (IR) must be 0. Stores result in NewBoard.
% @param IR must be 0

top_move(IC, 0, FC, FR, [Line | TailBoard], NewBoard) :-
	FR > 0,
	vertical_move(IC, FC , Line, UpperBound),
	Column is UpperBound - IC,
	push_top(Column, FR, [Line | TailBoard], NewBoard).

%! bottom_move(+IC, +IR, +FC, +FR, +Board, -NewBoard):-
% Attemps to make a move from the bottom. Stores result in NewBoard.

bottom_move(IC, IR, FC, FR, [Line | BoardT], NewBoard) :-
	FR < IR,
	length([Line | BoardT], Comp),
	LastRow is Comp - 1,
	IR == LastRow,
	vertical_move(IC, FC , Line, _),
	Index is IR - FR,
	push_bottom(IC, Index, [Line | BoardT], NewBoard).

%! right_move(+IC, +IR, +FC, +FR, +Board, -NewBoard):-
% Attemps to make a move from the right. Stores result in NewBoard.
right_move(IC, IR, FC, FR, [Line | BoardT], NewBoard) :-
	FC < IC,
	length(Line, Comp),
	LastColumn is Comp - 1,
	IC == LastColumn,
	horizontal_move(IR, FR , [Line | BoardT], UpperBound),
	Index is IC - FC,
	Row is UpperBound - IR,
	push_right(Row, Index, [Line | BoardT], NewBoard).

%! left_move(+IC, +IR, +FC, +FR, +Board, -NewBoard):-
% Attemps to make a move from the left, being that, for this to happen,
% the initial column (IC) must be 0. Stores result in NewBoard.
% @param IC must be 0
left_move(0, IR, FC, FR, Board, NewBoard) :-
	FC > 0,
	horizontal_move(IR, FR , Board, _),
	push_left(IR, FC, Board, NewBoard).

%! horizontal_move(+Row, +Row, +Board, -UpperBound).
% Verifies if an horizontal move is possible and stores its bound in UpperBound
horizontal_move(Row, Row, Board, UpperBound) :-
	Row > 0, 
	length(Board, Comp),
	UpperBound is Comp - 1,
	Row < UpperBound.


%! vertical_move(+Row, +Row, +Board, -UpperBound).
% Verifies if an vertical move is possible and stores its bound in UpperBound
vertical_move(Column, Column, Line, UpperBound) :-
	Column > 0,
	length(Line, Comp),
	UpperBound is Comp - 1,
	Column < UpperBound.

%! next_player(+CurrentPlayer, -NextPlayer, +GameMode, +PrevDifficulty, -NewDifficulty)
% Determines who is the NextPlayer in the game according to the GameMode. 
% Also provides boards with bots participating what is its difficulty. 
next_player([PrevPlayer, human], [Player, human], pvp, _, _) :-
	ProvPlayer is PrevPlayer + 1,
	Player is mod(ProvPlayer, 2).

next_player([PrevPlayer, human], [Player, bot], pvb, PD - BD, BD - PD) :-
	ProvPlayer is PrevPlayer + 1,
	Player is mod(ProvPlayer, 2).

next_player([PrevPlayer, bot], [Player, human], pvb, BD - PD, PD - BD) :-
	ProvPlayer is PrevPlayer + 1,
	Player is mod(ProvPlayer, 2).

next_player([PrevPlayer, bot], [Player, bot], bvb, B1D - B2D, B2D - B1D) :-
	ProvPlayer is PrevPlayer + 1,
	Player is mod(ProvPlayer, 2).

%! push(+FinalIndex, +Row, -NewRow)
% Attempts to actually push the given Board position.
push(Index, [H | Tail], Solution) :- 
	push_helper(Index, Tail, Solution, H).


%! push_helper(+FinalIndex, RowTail, NewRowTail, H).
% Helper predicate for push predicate.
push_helper(0, Sol, [H | Sol], H) :- !.

push_helper(Index, [empty | Tail], [empty | TailSol], H) :-
	NewIndex is Index - 1,
	!, push_helper(NewIndex, Tail, TailSol, H).

push_helper(Index, [Other | Tail], [empty | TailSol], H) :-
	push(1, [Other | Tail], [_ | NewTail]),
	NewIndex is Index - 1,
	!, push_helper(NewIndex, NewTail, TailSol, H).

%! push_left(+Row, +Index, +Board, -NewBoard)
% Attemps push to the left the given Row index 
% to the given final Index of the Board, making NewBoard

push_left(Row, Index, Board, NewBoard) :-
	nth0(Row, Board, SearchedRow),
	push(Index, SearchedRow, NewRow),
	replace_row(Row, NewRow, Board, NewBoard).

%! push_top(+Column, +Index, +Board, -NewBoard)
% Attemps push from the top the given Column index 
% to the given final Index of the Board, making NewBoard
push_top(Column, Index, Board, NewBoard) :-
	rotate_board_clockwise(Board, RotatedBoard, -1),
	push_left(Column, Index, RotatedBoard, NewRotatedBoard),
	rotate_board_clockwise(NewRotatedBoard, NewBoard, 1).
	
%! push_right(+Row, +Index, +Board, -NewBoard)
% Attemps push to the right the given Row index 
% to the given final Index of the Board, making NewBoard

push_right(Row, Index, Board, NewBoard) :-
	rotate_board_clockwise(Board, RotatedBoard, 2),
	push_left(Row, Index, RotatedBoard, NewRotatedBoard),
	rotate_board_clockwise(NewRotatedBoard, NewBoard, 2).

%! push_bottom(+Column, +Index, +Board, -NewBoard)
% Attemps push from the bottom the given Column index 
% to the given final Index of the Board, making NewBoard
push_bottom(Column, Index, Board, NewBoard) :-
	rotate_board_clockwise(Board, RotatedBoard, 1),
	push_left(Column, Index, RotatedBoard, NewRotatedBoard),
	rotate_board_clockwise(NewRotatedBoard, NewBoard, -1).
	
%! inside_board(+Board, -Column, -Row)
% Determines valid final positions inside the board,
% storing them in Column and Row.
inside_board([Line | TBoard], Column, Row) :-
	get_element_matrix([Line | TBoard], Row, Column, _),
	horizontal_move(Row, Row, [Line | TBoard], _), 
	vertical_move(Column, Column, Line, _).

%! findall_moves_helper(+FinalPos, +Board, +Player,MovesAccumulator -Moves)
% findall_moves helper predicate whose task is to accumulate all the 
% different possible solutions of moves
% @param FinalPos is a list of final coordinates
findall_moves_helper([], _, _, Prov, Prov) :- !.

findall_moves_helper([[FC, FR] | Remain], Board, Player, Moves, Sol) :-
	findall([IC, IR] - [FC, FR], move(Board, [IC, IR, FC, FR], _, Player), List),
	!, append(Moves, List, NewMoves),
	!, findall_moves_helper(Remain, Board, Player, NewMoves, Sol).
	
%! valid_moves(+Board, +Player, -Moves)
% Finds all the current possible moves for the given
% Board and Player, storing it in Moves.
valid_moves(Board, Player, Moves) :-
	findall([FC, FR], inside_board(Board, FC, FR), FinalPos),
	!, findall_moves_helper(FinalPos, Board, Player, _, Moves).

%! random_move(+Board, +Player, -Move)
% Selects a random Move from the Board. Applied 
% very easy difficulty of the game. 
random_move(Board, Player, Move) :-
	valid_moves(Board, Player, Moves),
	length(Moves, NMoves),
	NMoves > 0,
	LastIndex is NMoves - 1,
	random_between(0, LastIndex, RandomIndex),
	nth0(RandomIndex, Moves, Move).

%! pass_move(+Board, +Player)
% Determines if the current Player will have to 
% pass his turn
pass_move(Board, Player) :-
	valid_moves(Board, Player, []).

%! generate_move_points(+Board, +Player, +Opponent, +Move, -PlayerPoints, -OpponentPoints)
% Generates a given move points for both the Player as well as the opponent
generate_move_points(Board, Player, Opponent, [IC, IR]-[FC, FR], PlayerPoints, OpponentPoints):-
	move(Board, [IC, IR, FC, FR], NewBoard, Player),
	select_piece(Player, PlayerDisc),
	value(NewBoard, PlayerDisc, PlayerPoints),
	select_piece(Opponent, OpponentDisc),
	value(NewBoard, OpponentDisc, OpponentPoints).

%! get_best_with_difference(+Moves, +PlayerPoints, +OpponentPoints, -Move)
% Get the best Move out of Moves, according to the current Player and Opponent
% points, given that the best move will be the one whose difference between the player's
% points and the opponent's is the largest.
get_best_with_difference(Moves, PlayerPoints, OpponentPoints, Move):-
	maplist(difference, PlayerPoints, OpponentPoints, PointsDifference),
	max_list(PointsDifference, MaxDifference),
	nth0(Index, PointsDifference, MaxDifference),
	nth0(Index, Moves, Move).

%! greedy_max_move(+Player, +Opponent, +Board, -Moves, -Move)
% Using a greedy approach, get the current best Move by analyzing
% the highest scored move out of all.
greedy_max_move(Player, Opponent, Board, Moves, Move):-
	maplist(generate_move_points(Board, Player, Opponent), Moves, Scores, _),
	max_list(Scores, Max),
	nth0(Index, Scores, Max),
	nth0(Index, Moves, Move).

%! greedy_difference_move(+Player, +Opponent, +Board, +Moves, -Move)
% Using a greedy approach, get the current best Move by analyzing
% the biggest difference of scores between the player and opponent.
greedy_difference_move(Player, Opponent, Board, Moves, Move):-
	maplist(generate_move_points(Board, Player, Opponent), Moves, PlayerPoints, OpponentPoints),
	get_best_with_difference(Moves, PlayerPoints, OpponentPoints, Move).
	
%! greedy_move(+Player, +Opponent, +Board, -Move)
% Using a greedy approach, by analzing only the next player's move
% determines the best Move.
greedy_move(Player, Opponent, Board, Move):-
	valid_moves(Board, Player, Moves),
	greedy_max_move(Player, Opponent, Board, Moves, Move).

%! get_new_boards(+InitialBoard, +Moves, -NewBoards, +Player)
% Gets all the NewBoards for the given Moves for the given Player 
get_new_boards(_,  [], [], _).
get_new_boards(InitialBoard, [[IC, IR]-[FC, FR] | MoveT], [NewBoard | T2], Player):-
	move(InitialBoard, [IC, IR, FC, FR], NewBoard, Player),
	get_new_boards(InitialBoard, MoveT, T2, Player).

%! get_best_move_points(+Opponent, +Player, +Board, +Moves, -OpponentPoints, -PlayerPoints)
% Using a greedy approach, gets the best move OpponentPoints and PlayerPoints.
get_best_move_points(Opponent, Player, Board, [], OpponentPoints, PlayerPoints):-
	select_piece(Opponent, OpponentDisc),
	select_piece(Player, PlayerDisc),
	value(Board, OpponentDisc, OpponentPoints),
	value(Board, PlayerDisc, PlayerPoints).
get_best_move_points(Opponent, Player, Board, Moves, OpponentPoints, PlayerPoints):-
	greedy_max_move(Opponent, Player, Board, Moves, Move),
	generate_move_points(Board, Opponent, Player, Move, OpponentPoints, PlayerPoints).
	

%! generate_board_points(+Opponent, +Player, +Board, -OpponentPoints, -PlayerPoints) 
% Gets all the moves from the given board for the Opponent, calculating OpponentPoints 
% as well as PlayerPoints
generate_board_points(Opponent, Player, Board, OpponentPoints, PlayerPoints):-
	valid_moves(Board, Opponent, Moves),
	get_best_move_points(Opponent, Player, Board, Moves, OpponentPoints, PlayerPoints).

%! difference(+PlayerPoints, +OpponentPoints, -PointsDifference)
% Calculates the difference between PlayerPoints and OpponentPoints
% storing it in PointsDifference
difference(PlayerPoints, OpponentPoints, PointsDifference):-
	PointsDifference is PlayerPoints - OpponentPoints.

%! minimax_worst_play(+FirstDegreeMoves, _, +OpponentPoints, -Move)
% Calculates the worst move for the given opponent by seeing its
% worse score.
minimax_worst_play(FirstDegreeMoves, _, OpponentPoints, Move):-
	min_list(OpponentPoints, WorstPoints),
	nth0(Index, OpponentPoints, WorstPoints),
	nth0(Index, FirstDegreeMoves, Move).

%! minimax(+Board, +Player, +Func, -Move)
% Using the minimax algoritm, searches for the best move
% for the given Board for the given Player. Uses Func to 
% decide which is the best move for Player
% @param Func is a predicate of arity 4
minimax(Board, Player, Func, Move):-
	valid_moves(Board, Player, FirstDegreeMoves),
	get_new_boards(Board, FirstDegreeMoves, FirstDegreeBoards, Player),
	NextPlayer is Player + 1,
	Opponent is mod(NextPlayer, 2),
	maplist(generate_board_points(Opponent, Player), FirstDegreeBoards, OpponentPoints, PlayerPoints),
	Pred=..[Func, FirstDegreeMoves, PlayerPoints, OpponentPoints, Move],
	Pred.

%! choose_move(+Board, +[Player, PlayerType], -NewMove, +Difficulty)
% Chooses a move to take according to its Player, and PlayerType,
% storing in it in NewMove. If Player is a bot, it will try to 
% obtain the best move according to current Difficulty. 
choose_move(Board, [_, human], Move, _):-
	read_move(Move, Board).

choose_move(Board, [Player, bot], [IC, IR, FC, FR], 0 - _):-
	random_move(Board, Player, [IC, IR]-[FC, FR]).

choose_move(Board, [Player, bot], [IC, IR, FC, FR], 1 - _):-
	NextPlayer is Player + 1,
	Opponent is mod(NextPlayer, 2),
	greedy_move(Player, Opponent, Board , [IC, IR]-[FC, FR]).

choose_move(Board, [Player, bot], [IC, IR, FC, FR], 2 - _):-
	NextPlayer is Player + 1,
	Opponent is mod(NextPlayer, 2),
	greedy_move(Player, Opponent, Board , [IC, IR]-[FC, FR]).

choose_move(Board, [Player, bot], [IC, IR, FC, FR], 3 - _):-
	minimax(Board, Player , minimax_worst_play, [IC, IR]-[FC, FR]).
	
choose_move(Board, [Player, bot], [IC, IR, FC, FR], 4 - _):-
	minimax(Board, Player , get_best_with_difference, [IC, IR]-[FC, FR]).