class MyAuxBoard extends CGFobject {
    constructor(scene, nPieces, color) {
        super(scene);
        this.nPieces = nPieces;
        this.cols = 5;
        this.rows = Math.ceil(nPieces / this.cols);
    
        this.boardCell = new MyBoardCell(scene, false);
        this.disc = new MyDisc(scene, color);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        let added_pieces = 0;
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {

                const translate_x = start_x + col;
                
                this.scene.pushMatrix();
                this.scene.translate(translate_x, 0, translate_z);

                // display board cell
                this.scene.pushMatrix();
                this.scene.translate(0, .25, 0);
                this.scene.scale(1, 0.5, 1);
                this.boardCell.display();
                this.scene.popMatrix();

                // height of board surface
                if (added_pieces < this.nPieces) {
                    this.scene.pushMatrix();
                    this.scene.translate(0, 0.5, 0);
                    this.disc.display();
                    this.scene.popMatrix(); 
                    added_pieces++;
                }

                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }
}