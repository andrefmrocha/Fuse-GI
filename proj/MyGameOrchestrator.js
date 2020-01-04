const PLAYER_1 = "wt";
const HUMAN = "human";
const BOT = "robot";
const PLAYER_2 = "bl";
const START_DELAY_TIME = 5;
const CAMERA_ANIMATION_TIME = 3;
const MOVEMENT_ANIMATION_VELOCITY = 0.3;
let animationID = 0;

class MyGameOrchestrator extends CGFobject {
    constructor(scene, player1, player2, gameInfo) {
        super(scene);
        scene.orchestrator = this;

        this.playerInfo = {}
        this.gameInfo = gameInfo;
        this.playerInfo[PLAYER_1] = player1;
        this.playerInfo[PLAYER_2] = player2;

        // endpoints to interact with Prolog server
        const serverURL = "http://localhost:8001";
        this.generateURL = serverURL + "/generate";
        this.userMoveURL = serverURL + "/move";
        this.botMoveURL = serverURL + "/bot";
        this.playerPointsURL = serverURL + "/points";

        // auxiliar board positions
        this.auxBoardOffset = 7;
        this.whiteBoardPos = [this.auxBoardOffset, 0, 0];
        this.blackBoardPos = [-this.auxBoardOffset, 0, 0];

        this.board = new MyGameBoard(scene, [[]]);
        this.auxBoardWhite = new MyAuxBoard(scene, this.board, 0, "wt");
        this.auxBoardBlack = new MyAuxBoard(scene, this.board, 0, "bl");
        this.possibleMoves = [];
        this.validCell = new MyValidCell(scene);
        this.moves = [];
        this.animations = [];
        this.movesPassed = 0;
        this.scoreBoard = new ScoreBoard(gameInfo['Move Time'], this);

        this.gameReady = false; // initGame finished
        this.piecesInBoard = false; // initial animation finished
        this.initGame();
    }

    switchPlayers(player) {
        if (player) {
            this.currentPlayer = player;
            ScoreBoard.displayInfo(this.currentPlayer, this.playerPointsURL, this.boardState);
            return;
        }

        switch (this.currentPlayer) {
            case PLAYER_1:
                this.currentPlayer = PLAYER_2;
                break;
            case PLAYER_2:
                this.currentPlayer = PLAYER_1;
                break;
            default:
                this.currentPlayer = PLAYER_1;
        }

        ScoreBoard.displayInfo(this.currentPlayer, this.playerPointsURL, this.boardState);
    }


    async getMoves() {
        if (this.movesPassed == 2) {
            // game ended
            this.playerMoves = undefined;
            this.movesPassed = 0;
            this.gameEnded = true;
            const points = await ScoreBoard.displayInfo(this.currentPlayer, this.playerPointsURL, this.boardState);

            // alert the user of the game result
            if (points[PLAYER_1] == points[PLAYER_2]) {
                alert("It's a tie!")
            }
            else if (points[PLAYER_1] > points[PLAYER_2]) {
                alert('Player 1 has won!');
            } else {
                alert('Player 2 has won!');
            }

            // add buttons in GUI to replay moves and to restart game
            this.scene.addReplayButton();
            this.scene.addResetButton();
            return;
        }

        // read next moves and store them
        this.switchPlayers();
        if (this.playerInfo[this.currentPlayer].type == HUMAN)
            this.getPlayerMoves();
        else
            this.getBotMove();
    }

    async getPlayerMoves() {
        // player turn started
        this.scoreBoard.startTimer(this.scene.currentTime);

        // ask server for valid moves
        const response = await postRequest(this.userMoveURL, {
            board: this.boardState,
            player: this.currentPlayer == PLAYER_1 ? 0 : 1
        });

        const moves = await response.json()
        this.playerMoves = moves.move;

        if (moves.move.length == 0) {
            // no valid moves
            this.movesPassed++;
            this.getMoves();
        } else {
            this.movesPassed = 0;
        }

    }

    async getBotMove() {
        // ask server for valid moves
        const response = await postRequest(this.botMoveURL, {
            board: this.boardState,
            player: this.currentPlayer == PLAYER_1 ? 0 : 1,
            difficulty: this.playerInfo[this.currentPlayer].difficulty
        });

        if (response.status == 204) {
            this.movesPassed++;
            this.getMoves();
            return;
        }

        this.movesPassed = 0;

        const movement = await response.json();

        this.botMove = [movement.xi, movement.yi, movement.xf, movement.yf];
    }

    async initGame() {
        // sizes must be between 2 and 7, inclusive
        const request = {};
        request.rows = this.gameInfo['Board Rows'];
        request.columns = this.gameInfo['Board Columns'];

        const genBoardResponse = await postRequest(this.generateURL, request);
        const boardJson = await genBoardResponse.json();
        this.boardState = boardJson.board;
        this.initialBoard = this.boardState.map(row => row.slice());
        this.board = new MyGameBoard(this.scene, this.boardState);

        // determine pieces absolute positions, for the initial animation
        const piecesPositions = this.determinePiecesInitialPositions(boardJson.board);

        // auxiliar boards
        this.auxBoardWhite =
            new MyAuxBoard(this.scene, this.board, piecesPositions["wt"].length,
             "wt", this.whiteBoardPos, piecesPositions);
        this.auxBoardBlack =
            new MyAuxBoard(this.scene, this.board, piecesPositions["bl"].length,
             "bl", this.blackBoardPos, piecesPositions, true);
        
        this.gameReady = true;

        // set delay before initial animation starts
        setTimeout(() => {
            this.delayEnded = true;
        }, START_DELAY_TIME * 1000);
    }

    /**
     * Determines the absolute initial position of each piece in the board, 
     * grouped by type: wt, bl, empty or corner.
     * @param {string[][]} board
     */
    determinePiecesInitialPositions(board) {
        let piecesPositions = {
            "wt": [],
            "bl": [],
            "empty": [],
            "corner": []
        };

        // determine pieces final positions for animation
        const rows = board.length;
        const cols = board[0].length;
        const start_z = -rows / 2 + 0.5;
        const start_x = -cols / 2 + 0.5;
        for (let row = 0; row < rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < cols; col++) {
                const translate_x = start_x + col;

                // disc position
                const cellPos = [translate_x, 0, translate_z];

                // add position to array in corresponding piece type
                piecesPositions[board[row][col]].push(cellPos);
            }
        }
        return piecesPositions;
    }

    update(time) {
        // initial animation
        if (this.delayEnded && !this.piecesInBoard) {
            this.auxBoardBlack.update(time);
            this.auxBoardWhite.update(time);

            // animation finished
            if (this.auxBoardBlack.finishedStartAnimation && this.auxBoardWhite.finishedStartAnimation) {
                this.piecesInBoard = true;
                this.auxBoardBlack.setGameStarted(true);
                this.auxBoardWhite.setGameStarted(true);
                this.board.setBoardReady(true);
                this.getMoves();
            }
        }

        if (this.scoreBoard.update(time)) {
            this.getMoves();
        }

        // update pieces and cameras animations
        this.animations.forEach(animation => animation.update(time));

        if (!this.piecesInBoard) return;

        // perform bot move if its the bot turn
        if (this.botMove) {
            const move = this.botMove;
            this.moveBoard(move, this.boardState, true);
            this.moves.push({ move, player: this.currentPlayer });
            this.botMove = null;
        }
    }

    display() {
        // initGame hasn't finished
        if (!this.gameReady) return;

        // main game board
        this.board.display();

        // player 1 auxiliar board
        this.scene.pushMatrix();
        this.scene.translate(...this.whiteBoardPos);
        this.auxBoardWhite.display();
        this.scene.popMatrix();

        // player 2 auxiliar board
        this.scene.pushMatrix();
        this.scene.translate(...this.blackBoardPos);
        this.auxBoardBlack.display();
        this.scene.popMatrix();

        // display valid moves of selected piece
        this.possibleMoves.forEach((move) => this.validCell.display(move));
    }

    registerDisc(boardCell, col, row) {
        this.playerInfo[this.currentPlayer].type == HUMAN && this.currentPlayer == boardCell
            && this.scene.registerForPick(registerCounter++,
                () => {
                    const moves = this.playerMoves;
                    const validMoves = moves.filter(move => move[0] == col && move[1] == row);
                    validMoves.forEach((move) =>
                        this.possibleMoves.push({
                            move,
                            size_x: this.boardState[0].length - 2,
                            size_z: this.boardState.length - 2
                        }));
                }
            );
    }


    intersects(i, reachingIndex, move, cell) {
        return (cell == "wt" || cell == "bl") &&
            ((move > 0 && i <= reachingIndex) ||
                (move < 0 && i >= reachingIndex));
    }

    checkIntersections(indexes, getCell, move, length, reachingIndex) {
        if (move > 0) {
            for (let i = 1; i < length - 1; i++) {
                const cell = getCell(i);
                if (this.intersects(i, reachingIndex + indexes.length, move, cell)) {
                    indexes.push(i);
                }
                indexes.sort((a, b) => b - a)
            }
        } else {
            for (let i = length - 2; i >= 1; i--) {
                const cell = getCell(i);
                if (this.intersects(i, reachingIndex - indexes.length, move, cell)) {
                    indexes.push(i);
                }
            }
            indexes.sort((a, b) => a - b);
        }
    }

    /**
     * Performs a movement on the board, moving the necessary pieces.
     * @param {number[]} move Move to be performed
     * @param {string[][]} board Variable holding the board, to be updated
     * @param {bool} animate Whether the movement should be animated or not
     */
    moveBoard(move, board, animate) {
        const zMove = move[3] - move[1];
        const xMove = move[2] - move[0];

        // only has movement on z axis
        if (xMove == 0) {
            const indexes = [];
            const reachingIndex = zMove + move[1];
            this.checkIntersections(indexes, (i) => board[i][move[0]], zMove, board.length, reachingIndex);

            // for each piece which will be pushed
            indexes.forEach((index, i) => {
                const distance = reachingIndex + (indexes.length - i) * ((zMove > 0) ? 1 : -1);
                const animation_delay = Math.abs(Math.abs(distance - index) - Math.abs(zMove)) 
                                        * MOVEMENT_ANIMATION_VELOCITY * 1000;
                
                // animate movement if animate is set
                animate && this.animateMovement([index, move[0]], [distance, move[0]], false, animation_delay);
                
                // update board to reflect positions change
                this.switchBoardPositions(board, move[0], index, move[0], distance, "empty");
            });
        
        // movement on x axis
        } else {
            const indexes = [];
            const row = board[move[1]];
            const reachingIndex = xMove + move[0];
            this.checkIntersections(indexes, (i) => row[i], xMove, row.length, reachingIndex);
            
            // for each piece which will be pushed
            indexes.forEach((index, i) => {
                const distance = reachingIndex + (indexes.length - i) * ((xMove > 0) ? 1 : -1);
                const animation_delay = Math.abs(Math.abs(distance - index) - Math.abs(xMove)) 
                                        * MOVEMENT_ANIMATION_VELOCITY * 1000;
                
                // animate movement if animate is set
                animate && this.animateMovement([move[1], index], [move[1], distance], false, animation_delay);
                
                // update board to reflect positions change
                this.switchBoardPositions(board, index, move[1], distance, move[1], "empty");
            });
        }

        // piece that was selected by the player
        animate && this.animateMovement([move[1], move[0]], [move[3], move[2]], true, 0);
        this.switchBoardPositions(board, move[0], move[1], move[2], move[3], "null");
    }

    switchBoardPositions(board, x1, y1, x2, y2, remainingVal) {
        // update elements in the board
        board[y2][x2] = board[y1][x1];
        board[y1][x1] = remainingVal;

        // update pieces rotation of the positions in the MyGameBoard
        this.board.piecesRotation[[y2, x2]] = this.board.piecesRotation[[y1, x1]];
        this.board.piecesRotation[[y1, x1]] = 0;
    }

    registerMovement(move) {
        this.scene.registerForPick(registerCounter++, () => {
            this.moveBoard(move.move, this.boardState, true);
            this.moves.push({ ...move, player: this.currentPlayer });
        });
    }

    discHasValidMove(col, row) {
        const discMove = this.possibleMoves.find((move) => move.move[2] == col && move.move[3] == row);
        if (discMove) {
            this.registerMovement(discMove);
        }
    }

    isBotGame() {
        return this.playerInfo[PLAYER_1].type == BOT
            && this.playerInfo[PLAYER_2].type == BOT;
    }

    /**
     * Undo the previous player movement
     */
    undo() {
        // only bots playing
        if (this.gameEnded || this.moves.length == 0 || this.isBotGame()) return;

        // remove moves until the last player move
        while (this.playerInfo[this.moves[this.moves.length - 1].player].type == BOT) {

            // check if there are only bot moves
            const onlyBotMoves = this.moves.reduce((acc, curr) =>
                acc && this.playerInfo[curr.player].type == BOT, true);

            // can not call undo if there are no player moves
            if (onlyBotMoves) return;

            this.moves.splice(this.moves.length - 1, 1);
        }

        this.possibleMoves.splice(0, this.possibleMoves.length);

        this.moves.splice(this.moves.length - 1, 1);

        // reset board
        const board = this.initialBoard.map(row => row.slice());
        this.boardState = board;
        this.board.board = board;

        // switch player
        this.switchPlayers(
            this.moves.length != 0
                && this.moves[this.moves.length - 1].player == PLAYER_1 ? PLAYER_2 : PLAYER_1);
        
        // replay moves
        this.board.assignPiecesInitialRotation(board);
        this.moves.forEach((move) => this.moveBoard(move.move, board, false));

        // store valid moves of next player
        this.getPlayerMoves();
    }

    cameraChange(initialTime, initialCamera, finalCamera) {
        const finalTime = initialTime + 1000 * CAMERA_ANIMATION_TIME;

        const animation = new MyAnimation(animationID++,
            (time) => {
                const timeFactor = 1 - (finalTime - time) / (finalTime - initialTime);
                if (timeFactor >= 1) return true;
                const camera = [];

                ['fov', 'near', 'far'].forEach((key) => {
                    const finalValue = finalCamera[key];
                    const initialValue = initialCamera[key];
                    camera.push(((finalValue - initialValue) * timeFactor) + initialValue);
                });

                ['position', 'target'].forEach((key) => {
                    const finalValue = finalCamera[key];
                    const initialValue = initialCamera[key];
                    camera.push(finalValue.map((value, index) =>
                        ((value - initialValue[index]) * timeFactor) + initialValue[index]));
                });

                this.scene.sceneCamera = new CGFcamera(...camera);

            },
            () => {
                this.animations.splice(this.animations.indexOf(animation), 1);
                this.scene.changeViewActivity(false);
                this.scene.sceneCamera = new CGFcamera(...Object.keys(finalCamera).map(key => finalCamera[key]));
            }
        );
        this.animations.push(animation);
    }

    reset() {
        location.reload();
    }

    /**
     * Animate the movement of a player piece on the board.
     * Assumes the piece is already at the end position and calculates an offset based on that.
     * @param {number[]} move Starting position of the movement
     * @param {number[]} endPos Ending position of the movement
     * @param {bool} changePlayer Whether the player should change when animation ends
     * @param {number} startDelay Time to wait before animation starts
     */
    animateMovement(initialPos, endPos, changePlayer = false, startDelay = 0) {
        // add delay to initial time
        const initialTime = this.scene.currentTime + startDelay;

        const start_x = initialPos[1];
        const end_x = endPos[1];
        const start_z = initialPos[0];
        const end_z = endPos[0];

        // calculate time needed for animation
        const travelDist = Math.max(Math.abs(end_x - start_x), Math.abs(end_z - start_z));
        const finalTime = initialTime + 1000 * travelDist * MOVEMENT_ANIMATION_VELOCITY;

        // initial offset, to avoid visual delay until the next update
        this.board.animationsOffsets[[endPos[0], endPos[1]]] = {
            x: -(end_x - start_x),
            y: 0,
            z: -(end_z - start_z)
        };

        const animation = new MyAnimation(animationID++,
            (time) => {
                // disable player interaction
                this.board.isAnimating = true;

                const timeFactor = 1 - (finalTime - time) / (finalTime - initialTime);
                if (timeFactor >= 1) return true;

                // wait till animation starts
                if (timeFactor < 0) return;

                // animation is inverted, calculates from end to start position
                const anim_x_offset = -(end_x - start_x) * (1 - timeFactor);
                const anim_z_offset = -(end_z - start_z) * (1 - timeFactor);

                // store piece offset
                this.board.animationsOffsets[[endPos[0], endPos[1]]] = {
                    x: anim_x_offset,
                    y: 0,
                    z: anim_z_offset
                };
            },
            () => {
                // remove current animation from animations
                this.animations.splice(this.animations.indexOf(animation), 1);

                // set offset to 0
                delete this.board.animationsOffsets[[endPos[0], endPos[1]]];

                // enable player interaction
                if (!Object.keys(this.board.animationsOffsets).length)
                    this.board.isAnimating = false;

                // handle next move
                if (!this.gameEnded && changePlayer) this.getMoves();

                // replay the next move
                if (this.gameEnded && !this.board.isAnimating && this.nextMoveReplay != null && this.nextMoveReplay < this.moves.length) {
                    this.moveBoard(this.moves[this.nextMoveReplay++].move, this.boardState, true);
                }
            }
        );
        this.animations.push(animation);
    }

    /**
     * Replay the moves, iterating over them and animating.
     * Only the first move is triggered but, since a replay variable is set, the
     * animation knows, when it ends, it should trigger the next move
     */
    replayMoves() {
        // reset board
        const board = this.initialBoard.map(row => row.slice());
        this.boardState = board;
        this.board.board = board;

        // reset pieces rotation
        this.board.assignPiecesInitialRotation(board);

        // set variable to enable replay
        this.nextMoveReplay = 0;

        // perform first move
        if (this.moves.length) 
            this.moveBoard(this.moves[this.nextMoveReplay++].move, this.boardState, true);
    }

}

/**
 * Perform a post request to given URL with the given body.
 * Should be used to fetch json information.
 * @param {object} body Request body
 */
function postRequest(url, body) {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}