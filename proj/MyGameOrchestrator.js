class MyGameOrchestrator extends CGFobject {
    constructor(scene) {
        super(scene);
        scene.orchestrator = this;

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
    }

    async initGame() {
        // sizes must be between 2 and 7, inclusive
        const request = {
            columns: 4,
            rows: 4
        };

        const genBoardResponse = await postRequest(this.generateURL, request);
        const boardJson = await genBoardResponse.json();
        this.board = new MyGameBoard(this.scene, boardJson.board);

        const piecesPositions = this.determinePiecesInitialPositions(boardJson.board); 
        this.auxBoardWhite = new MyAuxBoard(this.scene, piecesPositions["wt"].length, "wt", this.whiteBoardPos, piecesPositions);
        this.auxBoardBlack = new MyAuxBoard(this.scene, piecesPositions["bl"].length, "bl", this.blackBoardPos, piecesPositions, true);

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

            if (this.auxBoardBlack.startAnimationFinished() && this.auxBoardWhite.startAnimationFinished()) {
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