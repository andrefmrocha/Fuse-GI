class MyBoardCell extends CGFobject {
    constructor(scene) {
        super(scene);
        this.isInner = true;

        this.rectangle = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);
        this.initMaterial();
    }

    initMaterial() {
        const imgPath = '/proj/scenes/images/';
        this.innerCellTop = new CGFappearance(this.scene);
        this.innerCellTop.setAmbient(0.6, 0.6, 0.6, 1);
        this.innerCellTop.setDiffuse(0.8, 0.8, 0.8, 1);
        this.innerCellTop.setSpecular(0.3, 0.3, 0.3, 1);
        this.innerCellTop.setShininess(10.0);
        this.innerCellTop.loadTexture(imgPath + 'board_cell.jpg');
        this.innerCellTop.setTextureWrap('REPEAT', 'REPEAT');

        this.outerCellTop = new CGFappearance(this.scene);
        this.outerCellTop.setAmbient(0.6, 0.6, 0.6, 1);
        this.outerCellTop.setDiffuse(0.8, 0.8, 0.8, 1);
        this.outerCellTop.setSpecular(0.3, 0.3, 0.3, 1);
        this.outerCellTop.setShininess(10.0);
        this.outerCellTop.loadTexture(imgPath + 'outer_board_cell.jpg');
        this.outerCellTop.setTextureWrap('REPEAT', 'REPEAT');
        
        this.cellBase = new CGFappearance(this.scene);
        this.cellBase.setAmbient(0.6, 0.6, 0.6, 1);
        this.cellBase.setDiffuse(0.8, 0.8, 0.8, 1);
        this.cellBase.setSpecular(0.3, 0.3, 0.3, 1);
        this.cellBase.setShininess(10.0);
        this.cellBase.loadTexture(imgPath + 'board_wood.jpg');
        this.cellBase.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        this.cellBase.apply();

        // front
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.5);
        this.rectangle.display();
        this.scene.popMatrix();
        
        // back
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.rectangle.display();
        this.scene.popMatrix();
        
        // left
        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.rectangle.display();
        this.scene.popMatrix();
        
        // right
        this.scene.pushMatrix();
        this.scene.translate(-0.5, 0, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.rectangle.display();
        this.scene.popMatrix();
        
        // bottom
        this.scene.pushMatrix();
        this.scene.translate(0, -0.5, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();

        // apply correct material
        if (this.isInner) this.innerCellTop.apply();
        else this.outerCellTop.apply();
        
        // top
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.rectangle.display();
        this.scene.popMatrix();
    }

    setInnerCell(isInner) {
        this.isInner = isInner;
    }
}