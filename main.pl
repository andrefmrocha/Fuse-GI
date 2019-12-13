:-use_module(library(http/http_server)).
:-use_module(library(http/http_server_files)).
:-use_module(library(http/http_files)).
:- use_module(library(http/http_path)).
:- ensure_loaded('api/server.pl').


:- multifile user:file_search_path/2.


user:file_search_path(document_root,'/srv/htdocs').
user:file_search_path(game, document_root(proj)).


:- http_handler(root(.), http_reply_from_files('.', []), [prefix]).


server:-http_server([port(8001)]).