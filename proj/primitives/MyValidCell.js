class MyValidCell extends CGFobject {
    constructor(scene) {
        super(scene);

        this.torus = new MyTorus(scene, 0.05, 0.45, 20, 20);
        this.initMaterial();
    }

    initMaterial() {
        const imgPath = '/proj/scenes/images/';
        this.validMat = new CGFappearance(this.scene);
        this.validMat.setAmbient(0.6, 0.6, 0.6, 1);
        this.validMat.setDiffuse(0.8, 0.8, 0.8, 1);
        this.validMat.setSpecular(0.3, 0.3, 0.3, 1);
        this.validMat.setShininess(10.0);
        this.validMat.loadTexture(imgPath + 'blue_disc.jpg');
        this.validMat.setTextureWrap('REPEAT', 'REPEAT');
    }

    intersects(i,  reachingIndex, move, cell){
        return (cell == "wt" || cell == "bl") && 
               ((move > 0 && i <= reachingIndex) || 
                (move < 0 && i >= reachingIndex));
    }

    display(move) {
        this.scene.pushMatrix();
        this.validMat.apply();
        this.scene.scale(1, 3, 1);
        // console.log(move.move);
        this.scene.translate(move.move[2] - Math.ceil(move.size_x / 2), 0.2, move.move[3] - Math.ceil(move.size_z / 2));
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.registerForPick(registerCounter++, (scene) => {
            const zMove = move.move[3] - move.move[1];
            const xMove = move.move[2] - move.move[0];
            const board = scene.boardState;
            
            if(xMove == 0){
                const indexes = [];
                const reachingIndex = zMove + move.move[1];
                for(let i = 1; i < board.length - 1; i++){
                    const cell = board[i][move.move[0]];
                    if(this.intersects(i, reachingIndex, zMove, cell)){
                        indexes.push(i);
                    }
                }

                console.log(indexes);

                indexes.forEach((index, i) => {
                    const distance = reachingIndex + i + ((zMove > 0) ? 1 : -1);
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
                    const distance = reachingIndex + i + ((xMove > 0) ? 1: -1);
                    row[distance] = row[index];
                    row[index] = "empty";
                })
            }

            board[move.move[3]][move.move[2]] = board[move.move[1]][move.move[0]];
            board[move.move[1]][move.move[0]] = "empty";
            scene.getMoves();
        });
        this.torus.display();
        this.scene.popMatrix();
    }
}