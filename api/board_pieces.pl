clear :- write('\e[2J\n'). % Clears entire screen

ulc :- ansi_format([fg(cyan)], '~c', [9556]). % ╔ : upper left corner
urc :- ansi_format([fg(cyan)], '~c', [9559]). % ╗ : upper right corner
llc :- ansi_format([fg(cyan)], '~c', [9562]). % ╚ : lower left corner
lrc :- ansi_format([fg(cyan)], '~c', [9565]). % ╝ : lower right corner

hdiv :- halfhdiv, halfhdiv. % ══ : horizontal division
vdiv :- ansi_format([fg(cyan)], '~c', [9553]). % ║ : vertical division
mdiv :- ansi_format([fg(cyan)], '~c', [9580]). % ╬ : middle division

halfhdiv :- ansi_format([bold, fg(cyan)], '~c', [9552]). % ═: horizontal division (half because length of hdiv is 2)

tr :- ansi_format([fg(cyan)], '~c', [9568]). % ╠ : T right
tl :- ansi_format([fg(cyan)], '~c', [9571]). % ╣ : T left
td :- ansi_format([fg(cyan)], '~c', [9574]). % ╦ : T down
tu :- ansi_format([fg(cyan)], '~c', [9577]). % ╩ : T up

tr_oneline :- ansi_format([fg(cyan)], '~c', [9567]). % ╟ : T right one line
tl_oneline :- ansi_format([fg(cyan)], '~c', [9570]). % ╢ : T left one line


wt:- ansi_format([bold, fg(white)], '~c', [11044]), write(' '). % White piece
bl:- ansi_format([bold, fg(black)], '~c', [11044]), write(' '). % Black piece

logo_sq :- ansi_format([bold, fg(black)], '~s', ['█']). % Black Bold square for logo printing

null:- write('  '). % Null space
corner:- write(' '). % Board corner
empty:- ansi_format([bold, bg(cyan)], '~s', [' ']), ansi_format([bold, bg(cyan)], '~s', [' ']). % Empty space
