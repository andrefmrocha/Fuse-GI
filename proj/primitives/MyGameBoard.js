class MyGameBoard extends CGFobject {
    constructor(scene, jsonBoard) {
        super(scene);

        this.board = jsonBoard;
        this.rows = jsonBoard.length;
        this.cols = jsonBoard[0].length;

        this.boardCell = new MyBoardCell(scene, true);
        this.playerPiece = new MyPlayerPiece(scene);
        this.validCell = new MyValidCell(scene);

        this.boardReady = false;
        this.surfaceHeight = 0.5;

        this.isAnimating = false;
        this.animationsOffsets = {};

        this.assignPiecesInitialRotation(jsonBoard);
    }

    isInside(row, col) {
        return row >= 1 && row < this.rows - 1 && col >= 1 && col < this.cols - 1;
    }

    display() {
        const start_z = -this.rows / 2 + 0.5;
        const start_x = -this.cols / 2 + 0.5;
        let i = 1;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {

                // skip board corners
                const boardCell = this.board[row][col];
                if (boardCell == "corner") continue;

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
                this.scene.translate(0, this.surfaceHeight, 0);

                // display disc if it exists
                if (this.boardReady && boardCell != "empty" && boardCell != "null") {
                    if (!this.isAnimating) {
                        if (!this.isInside(row, col))
                            this.scene.gameOrchestrator.registerDisc(boardCell, col, row);
                        else {
                            this.scene.gameOrchestrator.discHasValidMove(col, row);
                        }
                    }

                    const anim_offset = this.animationsOffsets[[row,col]];
                    if (anim_offset) {
                        this.scene.translate(anim_offset.x, anim_offset.y, anim_offset.z);
                    }

                    const pieceRotation = this.piecesRotation[[row,col]];
                    if (pieceRotation) this.scene.rotate(pieceRotation, 0, 1, 0);

                    this.playerPiece.setColor(boardCell);
                    this.playerPiece.display();
                    this.scene.clearPickRegistration();
                }


                this.scene.popMatrix();
                this.scene.popMatrix();
            }
        }
    }

    assignPiecesInitialRotation(board) {
        this.piecesRotation = {};
        const rows = board.length;
        const cols = board[0].length;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {

                let rotation = 0;
                if (row == rows-1) rotation = Math.PI;
                else if (col == 0) rotation = Math.PI/2;
                else if (col == cols-1) rotation = -Math.PI/2;

                // add position to array in corresponding piece type
                this.piecesRotation[[row, col]] = rotation;
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