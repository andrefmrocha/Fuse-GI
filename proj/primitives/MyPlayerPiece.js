class MyPlayerPiece extends CGFobject {
    constructor(scene, color) {
        super(scene);
        
        this.disc = new MyBasedCylinder(scene, 0.15, 0.4, 0.4, 20, 20);        
        
        this.fighter = new CGFOBJModel(scene, '/proj/cgfobjreader/models/fighter.obj');
        this.spaceship = new CGFOBJModel(scene, '/proj/cgfobjreader/models/spaceship.obj');

        this.link = new CGFOBJModel(scene, '/proj/cgfobjreader/models/link.obj');
        this.tie_fighter = new CGFOBJModel(scene, '/proj/cgfobjreader/models/tie_fighter.obj');

		this.mario = new CGFOBJModel(scene, '/proj/cgfobjreader/models/mario.obj');
		this.toad = new CGFOBJModel(scene, '/proj/cgfobjreader/models/toad.obj');

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

        this.whiteMat = new CGFappearance(this.scene);
        this.whiteMat.setAmbient(.8, .8, .8, 1);
        this.whiteMat.setDiffuse(0.8, 0.8, 0.8, 1);
        this.whiteMat.setSpecular(0.3, 0.3, 0.3, 1);
        this.whiteMat.setShininess(10.0);
        this.whiteMat.setTextureWrap('REPEAT', 'REPEAT');

        this.blackMat = new CGFappearance(this.scene);
        this.blackMat.setAmbient(0.4, 0.4, 0.4, 1);
        this.blackMat.setDiffuse(0.1, 0.1, 0.1, 1);
        this.blackMat.setSpecular(0, 0, 0, 1);
        this.blackMat.setShininess(10.0);
        this.blackMat.setTextureWrap('REPEAT', 'REPEAT');
        
    }

    // TODO maybe pass rotation of object to display?
    display() {
        if (this.color == "wt") this.whiteTex.apply();
        else if (this.color == "bl") this.blackTex.apply();

        this.scene.pushMatrix();

        const currentAmbient = this.scene.graph.selectedAmbient;
        switch(currentAmbient) {
            // space
            case 'Space':
                if (this.color == "wt") { 
                    this.whiteMat.apply();
                    if (this.scene.orchestrator.piecesInBoard) this.scene.translate(0, 0.2, 0);
                    this.scene.rotate(-Math.PI/2, 1, 0, 0);
                    this.scene.scale(0.3, 0.3, 0.3);
                    this.fighter.display();
                } 
                else if (this.color == "bl") {
                    this.blackMat.apply();
                    if (this.scene.orchestrator.piecesInBoard) this.scene.translate(0, 0.2, 0);
                    this.scene.rotate(Math.PI, 0, 1, 0);
                    this.scene.translate(0, 0, 0.2);
                    this.scene.scale(0.13, 0.13, 0.13);
                    this.spaceship.display();
                }
                break;

            // zelda + up
            case 'Zelda':
                if (this.color == "wt") { 
                    this.whiteMat.apply();
                    this.scene.rotate(-Math.PI/2, 0, 1, 0);
                    this.scene.translate(-0.52, 0, 0.47);
                    this.scene.scale(0.007, 0.008, 0.007);
                    this.link.display();
                } 
                else if (this.color == "bl") {
                    this.blackMat.apply();
                    if (this.scene.orchestrator.piecesInBoard) this.scene.translate(0, 0.5, 0);
                    this.scene.scale(0.15, 0.15, 0.15);
                    this.tie_fighter.display();
                }
                break;

            // super mario
            case 'Mario World':
                this.scene.scale(0.005, 0.005, 0.005);
                if (this.color == "wt") { 
                    this.whiteMat.apply();
                    this.mario.display();
                } 
                else if (this.color == "bl") {
                    this.blackMat.apply();
                    this.toad.display();
                }
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