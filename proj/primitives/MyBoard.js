class MyBoard extends CGFobject {
    constructor(scene, jsonBoard) {
        super(scene);
        this.jsonBoard = jsonBoard;
        this.rows = jsonBoard.length;
        this.cols = jsonBoard[0].length;
    
        this.boardCell = new MyBoardCell(scene, true);
        this.disc = new MyDisc(scene);
    }

    display() {
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {
            
                // skip board corners
                const boardCell = this.jsonBoard[row][col];
                if(boardCell == "corner") continue;

                const translate_x = start_x + col;
                
                this.scene.pushMatrix();
                this.scene.translate(translate_x, 0, translate_z);

                // display board cell
                this.scene.pushMatrix();
                this.scene.translate(0, 0.5, 0);
                this.boardCell.setInnerCell(boardCell == "empty");
                this.boardCell.display();
                this.scene.popMatrix();

                // display disc if it exists
                if(boardCell != "empty") {
                    this.scene.pushMatrix();
                    this.scene.translate(0, 1, 0);
                    this.disc.setColor(boardCell);
                    this.disc.display();
                    this.scene.popMatrix();
                }

                this.scene.popMatrix();
            }
        }
    }
}