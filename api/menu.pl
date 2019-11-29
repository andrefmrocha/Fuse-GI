:- ensure_loaded('interface.pl').
:- ensure_loaded('board_pieces.pl').

% TODO: ver LineSize pq n é bem o tamanho da linha

%! write_line(+LineSize, +Char, +Color).
% Writes line with Char (character) in the desired Color with the LineSize decided
% Uses @see write_center
write_line(LineSize, Char, Color) :-
	write_center(LineSize, Char, Char, Color).

%! write_center(+LineSize, +Content, +Stuffer, +Color)
% Writes centered in a line with size LineSize, the Content with the desired Color (in ANSI format)
% The line is centered with the Stuffer char in equal amount on either side of the Content
write_center(LineSize, Content, Stuffer, Color):-
	char_code(Stuffer, StufferCode),
	ansi_format([fg(Color), bold],'~*t~s~*t~*|', [StufferCode, Content, StufferCode, LineSize]).

%! display_menu(-Option)
% Clears screens and draws logo by calling @see display_logo and menu like the one shown below
% Allows the user to choose between 3 Game Modes (Human vs Human; Human vs Bot; Bot vs Bot)
% ╔═════════════════════════════════╗
% ║                                 ║
% ║        Choose Game Mode         ║
% ║                                 ║
% ╟---------------------------------╢
% ║                                 ║
% ║                                 ║
% ║        1: Human vs Human        ║
% ║        2: Human vs Bot          ║
% ║        3: Bot   vs Bot          ║
% ║        4: Instructions          ║
% ║        0: Exit                  ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
% Asks for an option using @see read_menu and returns it using the argument Option
display_menu(Option) :-
	clear,
	display_logo,
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Choose Game Mode', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, '1: Human vs Human', ' ', white), vdiv, nl,
	vdiv, write_center(50, '2: Human vs Bot ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '3: Bot   vs Bot ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '4: Instructions ', ' ', green), vdiv, nl,
	vdiv, write_center(50, '0: Exit         ', ' ', red), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	llc, write_line(50, '═', cyan), lrc, nl,
	read_menu(Option, main).

%! display_bot_menu(+BotNumber, -Option)
% Clears screen and draws menu like the one shown below
% Allows the user to choose the Bot Level making it use a different algorithm (Random, Greedy or MinMax)
% with different heuristics to evaluate the moves (biggest isle vs difference between the biggest isles)
% ╔═════════════════════════════════╗
% ║                                 ║
% ║           Bot X Level           ║
% ║                                 ║
% ╟---------------------------------╢
% ║                                 ║
% ║                                 ║
% ║          1: Very Easy           ║
% ║          2.1: Easy              ║
% ║          2.2: Normal            ║
% ║          3.1: Hard              ║
% ║          3.2: Very Hard         ║
% ║          0: Back                ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
% Value of X depends on the BotNumber, and allows to use the same menu in different cases
% The option chosen with @see read_menu is returned by the argument Option
display_bot_menu(BotNumber, Option) :-
	clear,
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	format(atom(Title), 'Bot ~sLevel', [BotNumber]),
	vdiv, write_center(50, Title, ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, '1: Very Easy  ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '2.1: Easy     ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '2.2: Normal    ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '3.1: Hard     ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '3.2: Very Hard ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '0: Back        ', ' ', red), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	llc, write_line(50, '═', cyan), lrc, nl,
	read_menu(Option, bot),!.

%! choose_order(-Option)
% Clears Screen and draws menu like the one shown below 
% Allows the user to choose who goes first in the player vs bot Game Mode
% ╔═════════════════════════════════╗
% ║                                 ║
% ║      Choose Who Goes First      ║
% ║                                 ║
% ╟---------------------------------╢
% ║                                 ║
% ║                                 ║
% ║            1: Player            ║
% ║            2: Bot               ║
% ║            0: Back              ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
% The option chosen with @see read_menu is returned by the argument Option
choose_order(Option) :-
	clear, 
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Choose Who Goes First', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, '1: Player', ' ', white), vdiv, nl,
	vdiv, write_center(50, '2: Bot   ', ' ', white), vdiv, nl,
	vdiv, write_center(50, '0: Back  ', ' ', red), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	llc, write_line(50, '═', cyan), lrc, nl,
	read_menu(Option, order), !.

%! interpret_decision(+ReadValue, +GameType)
% Determines the course of action according to ReadValue and GameType
interpret_decision(back, _).
interpret_decision(Difficulty, pvb):-
	choose_order(FirstPlayer), !,
	interpret_decision(Difficulty, FirstPlayer, pvb).
interpret_decision(Difficulty1, bvb):-
	display_bot_menu('2 ', Difficulty2), !,
	interpret_decision(Difficulty1, Difficulty2, bvb).

%! interpret_decision(+ReadValue1, ReadValue2, +GameType)
% For state machines with more states, a second ReadValue is needed.
interpret_decision(_, back, _).
interpret_decision(Difficulty, FirstPlayer, pvb):-
	order_difficulty(FirstPlayer, Difficulty, DifficultyTuple),  !,
	menu_option(game, pvb, DifficultyTuple, FirstPlayer).
interpret_decision(Difficulty1, Difficulty2, bvb):-
	!, menu_option(game, bvb, Difficulty1 - Difficulty2, bot).

%! menu_option(+CurrentOption)
% State machine for drawing and executing the menu.
% Acts accordingly to the current option
menu_option(main):-
	display_menu(Option),
	menu_option(Option).
menu_option(instructions):-
	display_instructions,
	read_string(_).
menu_option(back).
menu_option(exit):-
	write('Bye'),
	abort.
menu_option(pvb) :- 
	display_bot_menu('', Difficulty),
	interpret_decision(Difficulty, pvb).
menu_option(bvb) :- 
	display_bot_menu('1 ', Difficulty),!,
	interpret_decision(Difficulty, bvb).
menu_option(pvp) :- 
	menu_option(game, pvp, _, _).

%! menu_option(game, +GameMode, +Difficulty, +FirstPlayer)
% State machine to actually begin playing the game at the current 
% GameMode, with the given Difficuly, starting with FirstPlayer.
menu_option(game, GameMode, Difficulty, FirstPlayer):-
	read_dimension(Rows, 'Rows'),
	read_dimension(Columns, 'Columns'), nl,
	initialize_empty_board(Rows, Columns, EB),
	initialize_board(EB, BeginBoard),
	!, game_loop(BeginBoard, [0, FirstPlayer], GameMode, Difficulty, 0).



%! display_logo
% Displays Logo as shown below in 2 different colors
% ███████╗██╗   ██╗███████╗███████╗
% ██╔════╝██║   ██║██╔════╝██╔════╝
% █████╗  ██║   ██║███████╗█████╗  
% ██╔══╝  ██║   ██║╚════██║██╔══╝  
% ██║     ╚██████╔╝███████║███████╗
% ╚═╝      ╚═════╝ ╚══════╝╚══════╝
display_logo:-
	write(' '), logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, logo_sq, logo_sq, urc, write('   '),logo_sq, logo_sq, urc, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc,  nl,
	write(' '), logo_sq, logo_sq, ulc, hdiv, hdiv, lrc, logo_sq, logo_sq, vdiv, write('   '),logo_sq, logo_sq, vdiv, logo_sq, logo_sq, ulc, hdiv, hdiv, lrc, logo_sq, logo_sq, ulc, hdiv, hdiv, lrc, nl,
	write(' '), logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, write('  '),logo_sq, logo_sq, vdiv, write('   '),logo_sq, logo_sq, vdiv, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, nl,
	write(' '), logo_sq, logo_sq, ulc, hdiv, lrc, write('  '),logo_sq, logo_sq, vdiv, write('   '),logo_sq, logo_sq, vdiv, llc, hdiv, hdiv, logo_sq, logo_sq, vdiv, logo_sq, logo_sq, ulc, hdiv, lrc, nl,
	write(' '), logo_sq, logo_sq, vdiv, write('     '),llc, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, ulc, lrc, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, vdiv, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, logo_sq, urc, nl,
	write(' '), llc, halfhdiv, lrc, write('      '),llc, hdiv, hdiv, halfhdiv, lrc, write(' '),llc, hdiv, hdiv, hdiv, lrc, llc, hdiv, hdiv, hdiv, lrc,  nl.

%! display_instructions
% Clears Screen and displays the instructions like shown below
% Waits for user to press ENTER to return to the main menu
% ╔═════════════════════════════════╗
% ║                                 ║
% ║          Instructions           ║
% ║                                 ║
% ╟---------------------------------╢
% ║                                 ║
% ║         Welcome to Fuse         ║
% ║                                 ║
% ║    Your objective is to make    ║
% ║        the BIGGEST isle         ║
% ║                                 ║
% ║    Move your pieces from the    ║
% ║     periphery to the center     ║
% ║   pushing other pieces around   ║
% ║                                 ║
% ║                                 ║
% ║    Move format: IC IR FC FR     ║
% ║     (I: Initial; F: Final)      ║
% ║     (C: Column ; R: Row  )      ║
% ║         WITHOUT SPACES          ║
% ║            Ex: a1b2             ║
% ║                                 ║
% ║                                 ║
% ║     Press Enter to continue     ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
display_instructions :-
	clear,
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Instructions', ' ', green), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Welcome to Fuse', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Your objective is to make', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'the BIGGEST isle', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, 'Move your pieces from the', ' ', white), vdiv, nl,	
	vdiv, write_center(50, 'periphery to the center', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'pushing other pieces around', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Move format: IC IR FC FR', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '(I: Initial; F: Final)', ' ', white), vdiv, nl,
	vdiv, write_center(50, '(C: Column ; R: Row  )', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'WITHOUT SPACES', ' ', red), vdiv, nl,
	vdiv, write_center(50, 'Ex: a1b2', ' ', green), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'Press Enter to continue', ' ', cyan), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	llc, write_line(50, '═', cyan), lrc, nl.

%! display_winner(+Points0, +Points1, +GameMode, +DifficultyTuple)
% Displays the Game Winner like shown below
% Waits for user to press ENTER to return to the main menu
% Uses @see display_bottom_part_winner(+Points0, +Points1) to display bottom part
% ╔═════════════════════════════════╗
% ║                                 ║
% ║        WIINER: PLAYER 1         ║
% ║                                 ║
% ╟---------------------------------╢
% ║                                 ║
% ║                                 ║
% ║           Player 0: 4           ║
% ║           Player 1: 6           ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
%
display_winner(Points0, Points1) :-
	Points0 > Points1,
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'WINNER: PLAYER 0', ' ', green), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	display_bottom_part_winner(Points0, Points1).


display_winner(Points0, Points1) :-
	Points0 < Points1,
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'WINNER: PLAYER 1', ' ', green), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	display_bottom_part_winner(Points0, Points1).


display_winner(Points0, Points1) :-
	ulc, write_line(50, '═', cyan), urc, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	vdiv, write_center(50, 'DRAW', ' ', blue), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	tr_oneline, write_line(50, '-', black), tl_oneline, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	display_bottom_part_winner(Points0, Points1).
	
%! display_bottom_part_winner(+Points0, +Points1)
% Prints bottom part of the Game Winner display like shown below
% ║                                 ║
% ║           Player 0: 4           ║
% ║           Player 1: 6           ║
% ║                                 ║
% ║                                 ║
% ╚═════════════════════════════════╝
display_bottom_part_winner(Points0, Points1) :-
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	format(atom(Pontuation0), 'Player 0: ~d', [Points0]),
	format(atom(Pontuation1), 'Player 1: ~d', [Points1]),
	vdiv, write_center(50, Pontuation0, ' ', white), vdiv, nl,
	vdiv, write_center(50, Pontuation1, ' ', white), vdiv, nl,
	vdiv, write_center(50, '', ' ', white), vdiv, nl,	
	vdiv, write_center(50, '', ' ', white), vdiv, nl,
	llc, write_line(50, '═', cyan), lrc, nl.