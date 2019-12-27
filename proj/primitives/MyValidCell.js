class MyValidCell extends CGFobject {
    constructor(scene) {
        super(scene);


        this.selection = new MyBasedCylinder(scene, 0.2, 0.5, 0.5, 20, 20);
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


    display(move) {
        this.scene.pushMatrix();
        this.validMat.apply();
        this.scene.scale(1, 3, 1);
        this.scene.translate(move.move[2] - Math.ceil(move.size_x / 2), 0.2, move.move[3] - Math.ceil(move.size_z / 2));
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.gameOrchestrator.registerMovement(move);
        this.selection.display();
        this.scene.popMatrix();
    }
}