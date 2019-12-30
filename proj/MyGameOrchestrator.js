const PLAYER_1 = "wt";
const HUMAN = "human";
const BOT = "robot";
const PLAYER_2 = "bl";
const CAMERA_ANIMATION_TIME = 3;
const MOVEMENT_ANIMATION_TIME = 1;

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


        this.gameReady = false;
        this.piecesInBoard = false;
        this.initGame();


        this.auxBoardWhite = new MyAuxBoard(scene, 0, "wt");
        this.auxBoardBlack = new MyAuxBoard(scene, 0, "bl");
        this.board = new MyGameBoard(scene, [[]]);
        this.possibleMoves = [];
        this.validCell = new MyValidCell(scene);
        this.moves = [];
        this.animations = [];
    }

    switchPlayers() {
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


    getMoves() {
        this.switchPlayers();
        if (this.playerInfo[this.currentPlayer].type == HUMAN)
            this.getPlayerMoves();
        else
            this.getBotMove();
    }

    async getPlayerMoves() {
        const wtResponse = await postRequest(this.userMoveURL, {
            board: this.boardState,
            player: 0
        });

        const wtmovesJson = await wtResponse.json();
        this.wtMoves = wtmovesJson.move;

        const blResponse = await postRequest(this.userMoveURL, {
            board: this.boardState,
            player: 1
        });

        const blmovesJson = await blResponse.json();
        this.blMoves = blmovesJson.move;

    }

    async getBotMove() {
        const response = await postRequest(this.botMoveURL, {
            board: this.boardState,
            player: this.currentPlayer == PLAYER_1 ? 0 : 1,
            difficulty: this.playerInfo[this.currentPlayer].difficulty
        })

        const movement = await response.json();

        const move = [movement.xi, movement.yi, movement.xf, movement.yf];
        this.moveBoard(move, this.boardState, true);

        this.moves.push({ move, type: BOT });
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
        this.getMoves();
        this.board = new MyGameBoard(this.scene, this.boardState);

        const piecesPositions = this.determinePiecesInitialPositions(boardJson.board);
        this.auxBoardWhite =
            new MyAuxBoard(this.scene, piecesPositions["wt"].length, "wt", this.whiteBoardPos, piecesPositions);
        this.auxBoardBlack =
            new MyAuxBoard(this.scene, piecesPositions["bl"].length, "bl", this.blackBoardPos, piecesPositions, true);

        this.gameReady = true;
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
        if (this.gameReady && !this.piecesInBoard) {
            this.auxBoardBlack.update(time);
            this.auxBoardWhite.update(time);

            if (this.auxBoardBlack.finishedStartAnimation && this.auxBoardWhite.finishedStartAnimation) {
                this.piecesInBoard = true;
                this.auxBoardBlack.setGameStarted(true);
                this.auxBoardWhite.setGameStarted(true);
                this.board.setBoardReady(true);
            }
        }

        this.animations.forEach(animation => animation.update(time));
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
                    const moves = boardCell == "wt" ? this.wtMoves :
                        this.blMoves;
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
                animate && this.animateMovement([index, move[0]], [distance, move[0]], false);
                board[distance][move[0]] = board[index][move[0]];
                board[index][move[0]] = "empty";
            });

        } else {
            const indexes = [];
            const row = board[move[1]];
            const reachingIndex = xMove + move[0];
            this.checkIntersections(indexes, (i) => row[i], xMove, row.length, reachingIndex);
            indexes.forEach((index, i) => {
                const distance = reachingIndex + (indexes.length - i) * ((xMove > 0) ? 1 : -1);
                animate && this.animateMovement([move[1], index], [move[1], distance], false);
                row[distance] = row[index];
                row[index] = "empty";
            })
        }
       
        animate && this.animateMovement([move[1], move[0]], [move[3], move[2]], true);
        board[move[3]][move[2]] = board[move[1]][move[0]];
        board[move[1]][move[0]] = "null";
    }

    registerMovement(move) {
        this.scene.registerForPick(registerCounter++, () => {
            this.moveBoard(move.move, this.boardState, true);
            this.moves.push({ ...move, type: HUMAN });
        });
    }

    discHasValidMove(col, row) {
        const discMove = this.possibleMoves.find((move) => move.move[2] == col && move.move[3] == row);
        if (discMove) {
            this.registerMovement(discMove);
        }
    }

    undo() {
        if (this.moves.length == 0) return;
        if (this.moves[this.moves.length - 1].type == BOT) {
            this.switchPlayers();
            this.moves.splice(this.moves.length - 1, 1);
        }

        this.moves.splice(this.moves.length - 1, 1);

        const board = this.initialBoard.map(row => row.slice());
        this.moves.forEach((move) => this.moveBoard(move.move, board, false));
        this.boardState = board;
        this.board.board = board;
        this.switchPlayers();
        this.getPlayerMoves();
    }

    cameraChange(initialTime, initialCamera, finalCamera) {
        const finalTime = initialTime + 1000 * CAMERA_ANIMATION_TIME;

        const animation = new MyAnimation(
            (time) => {
                const timeFactor = 1 - (finalTime - time) / (finalTime - initialTime);
                if(timeFactor >= 1) return true;
                const camera = []; 
                
                ['fov','near', 'far'].forEach((key) => {
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
                this.animations.splice(this.animations.indexOf(animation, 1));
                this.scene.sceneCamera = new CGFcamera(...Object.keys(finalCamera).map(key => finalCamera[key]));
            }
        );
        this.animations.push(animation);
    }

    animateMovement(initialPos, endPos, changePlayer) {
        const initialTime = this.scene.currentTime;
        const finalTime = initialTime + 1000 * MOVEMENT_ANIMATION_TIME;

        const start_x = initialPos[1];
        const end_x = endPos[1];
        const start_z = initialPos[0];
        const end_z = endPos[0];

        // initial offset, to avoid visual delay until the next update
        this.board.animationsOffsets[[endPos[0], endPos[1]]] = {
            x: -(end_x - start_x),
            y: 0,
            z: -(end_z - start_z)
        };

        const animation = new MyAnimation(
            (time) => {
                // disable player interaction
                this.board.isAnimating = true;

                const timeFactor = 1 - (finalTime - time) / (finalTime - initialTime);
                if(timeFactor >= 1) return true;

                // animation is inverted, calculates from end to start position
                const anim_x_offset = -(end_x - start_x) * (1-timeFactor);
                const anim_z_offset = -(end_z - start_z) * (1-timeFactor);

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
                if(changePlayer) this.getMoves();
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