const PLAYER_1 = "wt";
const PLAYER_2 = "bl";

class MyGameOrchestrator extends CGFobject {
    constructor(scene) {
        super(scene);

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
    }


    async getMoves() {
        if(!this.currentPlayer)
            this.currentPlayer = PLAYER_1;
        else if (this.currentPlayer == PLAYER_1)
            this.currentPlayer = PLAYER_2;
        else 
            this.currentPlayer = PLAYER_1;
        
        ScoreBoard.displayInfo(this.currentPlayer, this.playerPointsURL, this.boardState);
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

    async initGame() {
        // sizes must be between 2 and 7, inclusive
        const request = {
            columns: 5,
            rows: 5
        };

        const genBoardResponse = await postRequest(this.generateURL, request);
        const boardJson = await genBoardResponse.json();
        this.boardState = boardJson.board;
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
            "wt" : [],
            "bl" : [],
            "empty" : [],
            "corner" : []
        };

        // determine pieces final positions for animation
        const rows = board.length;
        const cols = board[0].length;
        const start_z = -rows/2 + 0.5;
        const start_x = -cols/2 + 0.5;
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

    registerDisc(boardCell, col, row){
        this.scene.registerForPick(registerCounter++,
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

    registerMovement(move){
        this.scene.registerForPick(registerCounter++, () => {
            const zMove = move.move[3] - move.move[1];
            const xMove = move.move[2] - move.move[0];
            const board = this.boardState;

            if (xMove == 0) {
                const indexes = [];
                const reachingIndex = zMove + move.move[1];
                for (let i = 1; i < board.length - 1; i++) {
                    const cell = board[i][move.move[0]];
                    if (this.intersects(i, reachingIndex, zMove, cell)) {
                        indexes.push(i);
                    }
                }

                indexes.forEach((index, i) => {
                    const distance = reachingIndex + ((zMove > 0) ? i + 1 : -i - 1);
                    board[distance][move.move[0]] = board[index][move.move[0]];
                    board[index][move.move[0]] = "empty";
                });

            } else {
                const indexes = [];
                const row = board[move.move[1]];
                const reachingIndex = xMove + move.move[0];
                for (let i = 1; i < row.length - 1; i++) {
                    const cell = row[i];
                    if (this.intersects(i, reachingIndex, xMove, cell)) {
                        indexes.push(i);
                    }
                }

                indexes.forEach((index, i) => {
                    const distance = reachingIndex + ((xMove > 0) ? i + 1 : -i - 1);
                    row[distance] = row[index];
                    row[index] = "empty";
                })
            }

            board[move.move[3]][move.move[2]] = board[move.move[1]][move.move[0]];
            board[move.move[1]][move.move[0]] = "null";
            this.getMoves();
        });
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