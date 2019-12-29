class MyAuxBoard extends CGFobject {
    constructor(scene, nPieces, color, centerPos, piecesPositions, boardRotated) {
        super(scene);
        this.nPieces = nPieces;
        this.cols = 2;
        this.rows = Math.ceil(nPieces / this.cols);
        this.boardRotated = boardRotated || false;

        this.centerPos = centerPos;
    
        this.boardCell = new MyBoardCell(scene, false);
        this.playerPiece = new MyPlayerPiece(scene, color);

        // Start animation variables
        this.startAnimationDuration = 3;
        this.startAnimationHeight = 6;
        this.startAnimationRotations = 5;
        this.finishedStartAnimation = false; // checked by game orchestrator
        this.gameStarted = false; // set by game orchestrator

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

    startAnimationFinished() {
        return this.finishedStartAnimation == true;
    }

    setGameStarted(val) {
        this.gameStarted = val;
    }

    calculateInitialPiecesPositions() {

        let piecesPositions = [];
        
        let added_pieces = 0;
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const rotated_row = this.boardRotated ? this.rows - 1 - row : row;
            const translate_z = start_z + rotated_row;
            for (let col = 0; col < this.cols; col++) {

                const rotated_col = this.boardRotated ? col : this.cols - 1 - col;
                const translate_x = start_x + rotated_col;

                const cellPos = [translate_x, 0 ,translate_z];
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
        if (!this.finishedStartAnimation) {

            // determine start time if not started yet
            if (!this.startAnimStartTime) {
                this.startAnimStartTime = time;
                this.startAnimEndTime = time + this.startAnimationDuration * 1000;
            }

            // proportion of time since animation started
            const time_factor = (time - this.startAnimStartTime) / (this.startAnimEndTime - this.startAnimStartTime);
            
            // animation finished
            if (time_factor > 1) { 
                this.finishedStartAnimation = true;
                
                // place pieces at their end position with no rotation
                Object.keys(this.piecesTransformations).forEach( key => {
                    const transforms = this.piecesTransformations[key];
                    const anim_translate = transforms.start.map((val, i) => -val + transforms.end[i]);
                    transforms.translate = anim_translate;
                    transforms.rotate.z = 0;
                });
            }
            // animation in progress
            else {
                Object.keys(this.piecesTransformations).forEach( key => {

                    const transforms = this.piecesTransformations[key];
        
                    const start = transforms.start;
                    const end = transforms.end; 

                    // parabolic path
                    const anim_x = (1-time_factor)*start[0] + time_factor * end[0];
                    const anim_z = (1-time_factor)*start[2] + time_factor * end[2];

                    // symmetric parabole from start to end with height this.startAnimationHeight
                    const anim_y = -4 * this.startAnimationHeight * Math.pow(time_factor, 2) + 
                                    4 * this.startAnimationHeight * time_factor;
                    const anim_vals = [anim_x, anim_y, anim_z];

                    // vector from start to animation position
                    const anim_translate = start.map((val, i) => -val + anim_vals[i]);
        
                    // vector from start position to end position
                    transforms.translate = anim_translate;

                    // rotation around z axis
                    transforms.rotate.z = 2*Math.PI * time_factor * this.startAnimationRotations;
                });
            }                
        }        
    }

    display() {

        let added_pieces = 0;
        const start_z = -this.rows/2 + 0.5;
        const start_x = -this.cols/2 + 0.5;
        for (let row = 0; row < this.rows; row++) {
            const rotated_row = this.boardRotated ? this.rows - 1 - row : row;
            const translate_z = start_z + rotated_row;
            for (let col = 0; col < this.cols; col++) {

                const rotated_col = this.boardRotated ? col : this.cols - 1 - col;
                const translate_x = start_x + rotated_col;

                // display board cell in its position
                this.scene.pushMatrix();
                this.scene.translate(translate_x, .25, translate_z);
                this.scene.scale(1, 0.5, 1);
                this.boardCell.display();
                this.scene.popMatrix();

                // height of board surface
                if (!this.gameStarted && added_pieces < this.nPieces) {
                    // console.log("Meias");
                    this.scene.pushMatrix();

                    // object animation transformations
                    const anim_translate = this.piecesTransformations[added_pieces].translate;
                    const anim_scale = this.piecesTransformations[added_pieces].scale;
                    const anim_rotate = this.piecesTransformations[added_pieces].rotate;
                    
                    this.scene.translate(...anim_translate);
                    this.scene.translate(translate_x, 0.5, translate_z);

                    this.scene.rotate(anim_rotate.z, 0, 0, 1);
                    this.scene.rotate(anim_rotate.y, 0, 1, 0);
                    this.scene.rotate(anim_rotate.x, 1, 0, 0);

                    this.scene.scale(...anim_scale);

                    this.playerPiece.display();
                    this.scene.popMatrix();
                    added_pieces++;
                }
            }
        }
    }
}