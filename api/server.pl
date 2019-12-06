:-use_module(library(http/http_server)).
:-use_module(library(http/http_json)).
:-use_module(library(http/json)).
:- use_module(library(http/json_convert)).
:-ensure_loaded('board_generation.pl').
:-ensure_loaded('move.pl').


:- json_object
    board_size(columns: integer, lines: integer).


:-json_object
    coords(xi: integer, yi: integer, xf: integer, yf: integer).

:- json_object
    board_move(board: list, move: coords/4, player: integer).
    
:- json_object
    board(board: list).

:-http_handler(root(generate), build_board, []).

:-http_handler(root(move), user_move, []).

build_board(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board_size(Columns, Rows)),
    initialize_empty_board(Rows, Columns, EmptyBoard),
    initialize_board(EmptyBoard, Board),
    prolog_to_json(board(Board), JSONOut),
    reply_json(JSONOut).


user_move(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board_move(Board, coords(Xi, Yi, Xf, Yf), Player)),
    move(Board, [Xi, Yi, Xf, Yf], NewBoard, Player),
    prolog_to_json(board(NewBoard), JSONOut),
    reply_json(JSONOut).
