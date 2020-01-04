const PLAYER_1 = "wt";
const HUMAN = "human";
const BOT = "robot";
const PLAYER_2 = "bl";
const START_DELAY_TIME = 5;
const CAMERA_ANIMATION_TIME = 3;
const MOVEMENT_ANIMATION_VELOCITY = 0.3;
let animationID = 0;

class MyGameOrchestrator extends CGFobject {
    constructor(scene, player1, player2) {
        super(scene);
        scene.orchestrator = this;

        this.playerInfo = {}
        this.playerInfo[PLAYER_1] = player1;
        this.playerInfo[PLAYER_2] = player2;

        const serverURL = "http://localhost:8001";
        this.generateURL = serverURL + "/generate";
        this.userMoveURL = serverURL + "/move";
        this.botMoveURL = serverURL + "/bot";
        this.playerPointsURL = serverURL + "/points";

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
        this.scoreBoard = new ScoreBoard(30, this);

        this.gameReady = false;
        this.piecesInBoard = false;
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
            console.info('Game has finished!');
            this.playerMoves = undefined;
            const points = await ScoreBoard.displayInfo(this.currentPlayer, this.playerPointsURL, this.boardState);

            if (points[PLAYER_1] == points[PLAYER_2]) {
                alert("It's a tie!")
            }
            else if (points[PLAYER_1] > points[PLAYER_2]) {
                alert('Player 1 has won!');
            } else {
                alert('Player 2 has won!');
            }
            this.scene.addResetButton();
            return;
        }

        this.switchPlayers();
        if (this.playerInfo[this.currentPlayer].type == HUMAN)
            this.getPlayerMoves();
        else
            this.getBotMove();
    }

    async getPlayerMoves() {
        this.scoreBoard.startTimer(this.scene.currentTime);
        const response = await postRequest(this.userMoveURL, {
            board: this.boardState,
            player: this.currentPlayer == PLAYER_1 ? 0 : 1
        });

        const moves = await response.json()
        this.playerMoves = moves.move;
        if (moves.move.length == 0) {
            this.movesPassed++;
            this.getMoves();
        } else {
            this.movesPassed = 0;
        }

    }

    async getBotMove() {
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
        const request = {
            columns: 5,
            rows: 5
        };

        const genBoardResponse = await postRequest(this.generateURL, request);
        const boardJson = await genBoardResponse.json();
        this.boardState = boardJson.board;
        this.initialBoard = this.boardState.map(row => row.slice());
        this.board = new MyGameBoard(this.scene, this.boardState);

        const piecesPositions = this.determinePiecesInitialPositions(boardJson.board);
        this.auxBoardWhite =
            new MyAuxBoard(this.scene, this.board, piecesPositions["wt"].length,
             "wt", this.whiteBoardPos, piecesPositions);
        this.auxBoardBlack =
            new MyAuxBoard(this.scene, this.board, piecesPositions["bl"].length,
             "bl", this.blackBoardPos, piecesPositions, true);

        this.gameReady = true;
        setTimeout(() => {
            this.delayEnded = true;
        }, START_DELAY_TIME * 1000);
    }

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
        if (this.delayEnded && !this.piecesInBoard) {
            this.auxBoardBlack.update(time);
            this.auxBoardWhite.update(time);

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


        this.animations.forEach(animation => animation.update(time));

        if (!this.piecesInBoard) return;

        if (this.botMove) {
            const move = this.botMove;
            this.moveBoard(move, this.boardState, true);
            this.moves.push({ move, player: this.currentPlayer });
            this.botMove = null;
        }
    }

    display() {
        if (!this.gameReady) return;

        this.board.display();

        this.scene.pushMatrix();
        this.scene.translate(...this.whiteBoardPos);
        this.auxBoardWhite.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(...this.blackBoardPos);
        this.auxBoardBlack.display();
        this.scene.popMatrix();
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

    moveBoard(move, board, animate) {
        const zMove = move[3] - move[1];
        const xMove = move[2] - move[0];

        if (xMove == 0) {
            const indexes = [];
            const reachingIndex = zMove + move[1];
            this.checkIntersections(indexes, (i) => board[i][move[0]], zMove, board.length, reachingIndex);

            indexes.forEach((index, i) => {
                const distance = reachingIndex + (indexes.length - i) * ((zMove > 0) ? 1 : -1);
                const animation_delay = Math.abs(Math.abs(distance - index) - Math.abs(zMove)) 
                                        * MOVEMENT_ANIMATION_VELOCITY * 1000;
                animate && this.animateMovement([index, move[0]], [distance, move[0]], false, animation_delay);
                this.switchBoardPositions(board, move[0], index, move[0], distance, "empty");
            });

        } else {
            const indexes = [];
            const row = board[move[1]];
            const reachingIndex = xMove + move[0];
            this.checkIntersections(indexes, (i) => row[i], xMove, row.length, reachingIndex);
            indexes.forEach((index, i) => {
                const distance = reachingIndex + (indexes.length - i) * ((xMove > 0) ? 1 : -1);
                const animation_delay = Math.abs(Math.abs(distance - index) - Math.abs(xMove)) 
                                        * MOVEMENT_ANIMATION_VELOCITY * 1000;
                animate && this.animateMovement([move[1], index], [move[1], distance], false, animation_delay);
                this.switchBoardPositions(board, index, move[1], distance, move[1], "empty");
            });
        }

        animate && this.animateMovement([move[1], move[0]], [move[3], move[2]], true);
        this.switchBoardPositions(board, move[0], move[1], move[2], move[3], "null");
    }

    switchBoardPositions(board, x1, y1, x2, y2, remainingVal) {
        board[y2][x2] = board[y1][x1];
        board[y1][x1] = remainingVal;

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

    undo() {
        // only bots playing
        if (this.moves.length == 0 || this.isBotGame()) return;

        console.log(this.moves);

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

        // recalculate board, iterating over remaining moves
        const board = this.initialBoard.map(row => row.slice());
        this.boardState = board;
        this.board.board = board;
        this.switchPlayers(
            this.moves.length != 0
                && this.moves[this.moves.length - 1].player == PLAYER_1 ? PLAYER_2 : PLAYER_1);
        this.board.assignPiecesInitialRotation(board);
        this.moves.forEach((move) => this.moveBoard(move.move, board, false));
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

    animateMovement(initialPos, endPos, changePlayer = false, startDelay = 0) {
        // add delay to initial time
        const initialTime = this.scene.currentTime + startDelay;

        const start_x = initialPos[1];
        const end_x = endPos[1];
        const start_z = initialPos[0];
        const end_z = endPos[0];

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
                this.animations.splice(this.animations.indexOf(animation), 1);

                // set offset to 0
                delete this.board.animationsOffsets[[endPos[0], endPos[1]]];

                // enable player interaction
                if (!Object.keys(this.board.animationsOffsets).length)
                    this.board.isAnimating = false;

                // handle next move
                if (changePlayer) this.getMoves();
            }
        );
        this.animations.push(animation);
    }

}

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