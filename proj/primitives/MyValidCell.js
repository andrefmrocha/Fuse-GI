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

    display() {
        this.scene.pushMatrix();
        this.validMat.apply();
        this.scene.scale(1, 3, 1);
        this.scene.translate(0, 0.05, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.torus.display();
        this.scene.popMatrix();
    }
}