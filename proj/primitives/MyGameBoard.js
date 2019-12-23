class MyGameBoard extends CGFobject {
    constructor(scene, jsonBoard) {
        super(scene);

        this.board = jsonBoard;
        this.rows = jsonBoard.length;
        this.cols = jsonBoard[0].length;
    
        this.boardCell = new MyBoardCell(scene, true);
        this.disc = new MyDisc(scene);
        this.validCell = new MyValidCell(scene);

        this.boardReady = true;
    }
    
    isInside(row, col){
        return row >= 1 && row < this.rows - 1 && col >= 1 && col < this.cols - 1;
    }

    display() {
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        let i = 1;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {
            
                // skip board corners
                const boardCell = this.board[row][col];
                if(boardCell == "corner") continue;

                const translate_x = start_x + col;
                
                this.scene.pushMatrix();
                this.scene.translate(translate_x, 0, translate_z);

                // display board cell
                this.scene.pushMatrix();
                this.scene.translate(0, .25, 0);
                this.scene.scale(1, 0.5, 1);
                this.boardCell.setInnerCell(this.isInside(row, col));
                this.boardCell.display();
                this.scene.popMatrix();

                // height of board surface
                this.scene.pushMatrix();
                this.scene.translate(0, 0.5, 0);

                // display disc if it exists
                if(this.boardReady && boardCell != "empty") {
                    !this.isInside(row, col) && this.scene.registerForPick(registerCounter++,
                        (scene) => {
                            const moves = boardCell == "wt" ? scene.wtMoves : scene.blMoves;
                            moves.filter(move => move[0] == col && move[1] == row).forEach((move) =>
                                scene.possibleMoves.push({
                                    move,
                                    size_x: scene.boardState[0].length - 2, size_z: scene.boardState.length - 2
                                }));
                        }
                    );
                    this.disc.setColor(boardCell);
                    this.disc.display();
                    this.scene.clearPickRegistration();
                }


                this.scene.popMatrix(); 
                this.scene.popMatrix();
            }
        }
    }

    addPiece(row, col, piece) {
        this.board[row][col] = piece;
    }

    removePiece(row, col) {
        this.board[row][col] = "empty";
    }

    getPiece(row, col) {
        return this.board[row][col];
    }

    movePiece(srow, scol, erow, ecol) {
        return;
    }

    setBoardReady(ready) {
        this.boardReady = ready;
    }
}