class MyBoard extends CGFobject {
    constructor(scene, jsonBoard) {
        super(scene);
        this.jsonBoard = jsonBoard;
        this.rows = jsonBoard.length;
        this.cols = jsonBoard[0].length;
    
        this.boardCell = new MyBoardCell(scene, true);
    }

    display() {
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {

                if(this.jsonBoard[row][col] == "corner") continue;

                const translate_x = start_x + col;
                
                this.scene.pushMatrix();
                this.scene.translate(translate_x, 0, translate_z);
                this.boardCell.setInnerCell(this.jsonBoard[row][col] == "empty");
                this.boardCell.display();
                this.scene.popMatrix();
            }
        }
    }
}