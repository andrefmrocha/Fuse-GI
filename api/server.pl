:-use_module(library(http/http_server)).
:-use_module(library(http/http_json)).
:- use_module(library(http/http_error)).
:- use_module(library(http/http_cors)).
:-use_module(library(http/json)).
:- use_module(library(http/json_convert)).
:-ensure_loaded('board_generation.pl').
:-ensure_loaded('move.pl').
:-ensure_loaded('points_calculation.pl').


:- json_object
    board_size(columns: integer, lines: integer).


:- set_setting(http:cors, [*]).

:-json_object
    coords(xi: integer, yi: integer, xf: integer, yf: integer).

:- json_object
    board_move(board: list, player: integer).

:- json_object
    board_bot(board: list, player: integer, difficulty: integer).
    
:- json_object
    board(board: list).

:- json_object
    board_moves(move: list).

:- json_object
    score(wt: integer, bl: integer).

:-http_handler(root(generate), build_board, []).

:-http_handler(root(move), user_move, []).

:-http_handler(root(bot), bot_move, []).

:-http_handler(root(points), board_points, []).

build_board(Request):-
    http_read_json(Request, JSONIn),
    cors_enable,
    json_to_prolog(JSONIn, board_size(Columns, Rows)),
    initialize_empty_board(Rows, Columns, EmptyBoard),
    initialize_board(EmptyBoard, Board),
    prolog_to_json(board(Board), JSONOut),
    reply_json(JSONOut).


user_move(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board_move(Board, Player)),
    valid_moves(Board, Player, Moves),
    maplist(transform_moves, Moves, NewMoves),
    prolog_to_json(board_moves(NewMoves), JSONOut),
    reply_json(JSONOut).

bot_move(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board_bot(Board, Player, Difficulty)),
    choose_move(Board, [Player, bot], [Xi, Yi, Xf, Yf], Difficulty-_), !,
    prolog_to_json(coords(Xi, Yi, Xf, Yf), JSONOut),
    reply_json(JSONOut).

bot_move(_):-
    format('Status: 204~n'),
    format('Content-type: text/plain~n~n'),
    format('No valid moves~n').


board_points(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board(Board)),
    value(Board, wt, Points0),
    value(Board, bl, Points1),
    prolog_to_json(score(Points0, Points1), JSONOut),
    reply_json(JSONOut).



