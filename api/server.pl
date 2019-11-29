:-use_module(library(http/http_server)).
:-use_module(library(http/http_json)).
:-use_module(library(http/json)).
:- use_module(library(http/json_convert)).
:-ensure_loaded('board_generation.pl').


server:-
    http_server([port(8080)]).


:- json_object
    board_size(columns: integer, lines: integer).
    
:- json_object
    board(board: list).

:- http_handler(root(.),
                http_redirect(moved, location_by_id(home_page)),
                []).
:- http_handler(root(home), home_page, []).

:-http_handler(root(generate), build_board, []).

build_board(Request):-
    http_read_json(Request, JSONIn),
    json_to_prolog(JSONIn, board_size(Columns, Rows)),
    initialize_empty_board(Rows, Columns, EmptyBoard),
    initialize_board(EmptyBoard, Board),
    prolog_to_json(board(Board), JSONOut),
    reply_json(JSONOut).


home_page(_Request) :-
    reply_html_page(
        title('Demo server'),
        [ h1('Hello world!')
        ]).