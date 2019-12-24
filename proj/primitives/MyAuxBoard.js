class MyAuxBoard extends CGFobject {
    constructor(scene, nPieces, color, centerPos, piecesPositions) {
        super(scene);
        this.nPieces = nPieces;
        this.cols = 5;
        this.rows = Math.ceil(nPieces / this.cols);

        this.centerPos = centerPos;
    
        this.boardCell = new MyBoardCell(scene, false);
        this.disc = new MyDisc(scene, color);

        this.finishedAnimation = false;
        this.gameStarted = false;

        // calculate start position of pieces
        const startPositions = this.calculateInitialPiecesPositions();

        // transformations used by animation
        this.piecesTransformations = {};
        for (let i = 0; i < this.nPieces; i++) {
            this.piecesTransformations[i] = {
                start : startPositions[i],
                end : piecesPositions[color][i],
                translate: [0, 0, 0],
                scale: [1, 1, 1],
                rotate: {
                    x : 0,
                    y: 0,
                    z: 0
                }
            };
        }
    }

    calculateInitialPiecesPositions() {

        let piecesPositions = [];
        
        let added_pieces = 0;
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const translate_z = start_z + row;
            for (let col = 0; col < this.cols; col++) {

                const translate_x = start_x + col;

                // must rotate 90 degrees because of transform applied
                const cellPos = [translate_z, 0 , -translate_x];
                const cellAbsolutePos = cellPos.map((val, i) => val + this.centerPos[i]);

                // height of board surface
                if (added_pieces < this.nPieces) {
                    piecesPositions.push(cellAbsolutePos);
                    added_pieces++;
                }
            }
        }
        return piecesPositions;
    }

    update(time) {
        Object.keys(this.piecesTransformations).forEach( (key, key_i) => {
            const transforms = this.piecesTransformations[key];
            const start = transforms.start;
            const end = transforms.end;

            
            const vec_to_origin = start.map(val => -val);
            transforms.translate = vec_to_origin.map((val, i) => val + end[i]);

            console.log("going from", transforms.start, " to ", transforms.end, ". translate is ", vec_to_origin.map((val, i) => val + end[i]));
        });
    }

    display() {

        if (this.gameStarted) return;

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

                // display board cell in its position
                this.scene.pushMatrix();
                this.scene.translate(0, .25, 0);
                this.scene.scale(1, 0.5, 1);
                this.boardCell.display();
                this.scene.popMatrix();

                // height of board surface
                if (added_pieces < this.nPieces) {
                    this.scene.pushMatrix();
                    // position the disc at board height
                    this.scene.translate(0, 0.5, 0);

                    this.scene.pushMatrix();

                    // object animation transformations
                    const translate = this.piecesTransformations[added_pieces].translate;
                    const scale = this.piecesTransformations[added_pieces].scale;
                    const rotate = this.piecesTransformations[added_pieces].rotate;
                    
                    this.scene.translate(...translate);
                    this.scene.rotate(rotate.z, 0, 0, 1);
                    this.scene.rotate(rotate.y, 0, 1, 0);
                    this.scene.rotate(rotate.x, 1, 0, 0);
                    this.scene.scale(...scale);

                    this.disc.display();
                    this.scene.popMatrix();

                    this.scene.popMatrix(); 
                    added_pieces++;
                }

                this.scene.popMatrix();
            }
        }
        this.scene.popMatrix();
    }
}