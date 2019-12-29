class MyPlayerPiece extends CGFobject {
    constructor(scene, color) {
        super(scene);
        
        this.disc = new MyBasedCylinder(scene, 0.15, 0.4, 0.4, 20, 20);
        this.color = color;
        this.initMaterials();
    }

    initMaterials() {
        const imgPath = '/proj/scenes/images/';
        this.whiteTex = new CGFappearance(this.scene);
        this.whiteTex.setAmbient(0.6, 0.6, 0.6, 1);
        this.whiteTex.setDiffuse(0.8, 0.8, 0.8, 1);
        this.whiteTex.setSpecular(0.3, 0.3, 0.3, 1);
        this.whiteTex.setShininess(10.0);
        this.whiteTex.loadTexture(imgPath + 'white_disc.jpg');
        this.whiteTex.setTextureWrap('REPEAT', 'REPEAT');

        this.blackTex = new CGFappearance(this.scene);
        this.blackTex.setAmbient(0.6, 0.6, 0.6, 1);
        this.blackTex.setDiffuse(0.8, 0.8, 0.8, 1);
        this.blackTex.setSpecular(0.3, 0.3, 0.3, 1);
        this.blackTex.setShininess(10.0);
        this.blackTex.loadTexture(imgPath + 'black_disc.jpg');
        this.blackTex.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        if (this.color == "wt") this.whiteTex.apply();
        else if (this.color == "bl") this.blackTex.apply();

        this.scene.pushMatrix();

        const currentAmbient = this.scene.graph.selectedAmbient;
        switch(currentAmbient) {
            // space
            case 0:
                this.scene.rotate(-Math.PI/2, 1, 0, 0);
                this.disc.display();
                break;

            // zelda + up
            case 1:
                this.disc.display();
                break;

            // super mario
            case 2:
                this.scene.rotate(-Math.PI/2, 0, 1, 0);
                this.disc.display();
                break;
            
            default:
                this.scene.rotate(-Math.PI/2, 1, 0, 0);
                this.disc.display();
                break;
        }

        this.scene.popMatrix();
    }

    setColor(color) {
        this.color = color;
    }
}