:- ensure_loaded('interface.pl').
:- ensure_loaded('move.pl').
:- ensure_loaded('display.pl').
:- ensure_loaded('points_calculation.pl').
:- ensure_loaded('menu.pl').

%! order_difficulty(+FirstPlayer, +BotDifficulty, -Difficulty)
% Orders the Difficulty tuple depending on who begins the game
% int the human vs bot game mode
% Case human: If the FirstPlayer is the human, then the tuple will have the BotDifficulty on the right side
order_difficulty(human, Difficulty, 999 - Difficulty).
% Case bot: If the FirstPlayer is the bot, then the tuple will have the BotDifficulty on the left side
order_difficulty(bot, Difficulty, Difficulty - 999).

%! init_game(+GameMode, -DifficultyTuple, -FirstPlayer)
% Function that given a Game Mode returns the difficulty in a tuple (DifficultyTuple) and
% wich is the first player (FirstPlayer) to make a move (bot or human)
% Case pvp: Player vs PLayer -> There is no difficulty tuple and the first player is obviously a player
init_game(pvp, _, human).

% Case pvb: Player vs Bot
% The bot's Difficulty is chosen using the bot menu (@see display_bot_menu)
% And the first player with the help of the @see choose_order menu
% It also calls @see order_difficulty to parse the Difficulty from the bot menu to a tuple
init_game(pvb, DifficultyTuple, FirstPlayer) :- 
	display_bot_menu('', Difficulty), !,
	choose_order(FirstPlayer),
	order_difficulty(FirstPlayer, Difficulty, DifficultyTuple).

% Case bvb: Bot vs Bot
% Both bots difficulty are chosen via the bot menu (@see display_bot_menu) and the 
% First player is obviously a bot
init_game(bvb, Difficulty1 - Difficulty2, bot) :- 
	display_bot_menu('1 ', Difficulty1),!,
	display_bot_menu('2 ', Difficulty2), !.

% Case other: Returns to @see start_game.
init_game(_, _, _):-
	!, start_game.

%! play
% Cicle that calls @see start_game and itself recursively
% Cicle ends when player asks to exit at any point (moves input or Main Menu)
play:-
	start_game,
	play.

%! start_game
% Calls @see menu_option with main argument
% Meaning the main menu will be printed
start_game :-
	menu_option(main).


% finish
%! game_loop(+Board, +PlayerType, +GameMode, +DifficultyTuple, +NumberOfPasses)
% This is the main game loop
% The loop ends when both players had to pass their turn (one after the other): NumberOfPasses = 2
% Case GameFinished:
% NumberOfPasses reached its limit (2) and the Game ends
% The final board is displayed one last time (@see display_game)
% and the score is calculated for each player (@see points_calculation)
% The cicle stops waiting for the Enter key to be pressed to go back to the main menu
game_loop(Board, [Player, _], _, _, 2) :- 
	write('\nGame Finished\n\n'),
	display_game(Board, Player),
	value(Board, wt, Points0),
    value(Board, bl, Points1),
	display_winner(Points0, Points1),
	write('Press enter to continue...'), read_string(_).

% Case HasValidMoves:
% If there is a valid move to be done (@see pass_move), the board is displayed (@see display_game)
% and a move is chosen (@see choose_move), either by a human or a bot.
% Then the turn is passed (@see next_player) and the game_loop is called again
% with the number of passes reset to 0
% A player can exit this loop by writing exit in the move input
game_loop(Board, [Player, Type], GameMode, Difficulty, _) :-
	\+ pass_move(Board, Player),
	display_game(Board, Player),
	stop_and_wait(GameMode),
	choose_move(Board, [Player, Type], Move, Difficulty),
	move(Board, Move, NewBoard, Player), !,
	next_player([Player, Type], NextPlayer, GameMode, Difficulty, NewDifficulty),
	game_loop(NewBoard, NextPlayer, GameMode, NewDifficulty, 0).

% Case Otherwise:
% Otherwise means that there was no valid move.
% The board is displayed (@see display_game) and a message is shown to notify
% the user that they lost their turn. The number of passes is incremented and 
% called @see next_player to get the next player to make a move and its difficulty (in case of a bot)
% Finally the game loop is called with the new values
game_loop(Board, [Player, Type], GameMode, Difficulty, Passes) :-
	display_game(Board, Player),
	%pass_move(Board, Player),
	write(' Next Player\n'),
	NewPasses is Passes + 1,
	next_player([Player, Type], NextPlayer, GameMode, Difficulty, NewDifficulty), !,
	game_loop(Board, NextPlayer, GameMode, NewDifficulty, NewPasses).


%! game_over(+Board, +Player, +Opponent)
% Determines if a game has ended or not by checking if both player
% still have any moves to play.
% This predicate is purely used to exemplify
% this behavior for the report, therefore never actully 
% being used in the code.
game_over(Board, Player, Opponent):-
	valid_moves(Board, Player, []),
	valid_moves(Board, Opponent, []).
