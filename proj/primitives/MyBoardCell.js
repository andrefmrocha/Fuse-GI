class MyBoardCell extends CGFobject {
    constructor(scene, isInner) {
        super(scene);
        this.isInner = isInner != null ? isInner : true;

        this.rectangle = new MyRectangle(scene, -0.5, 0.5, -0.5, 0.5);

        this.initTextures();
        this.initMaterials();
    }

    initTextures() {
        const imgPath = '/proj/scenes/images/';
        this.cellBase = new CGFtexture(this.scene, imgPath + 'board_wood.jpg');
        this.innerCellTop = new CGFtexture(this.scene, imgPath + 'board_cell.jpg');
        this.outerCellTop = new CGFtexture(this.scene, imgPath + 'outer_board_cell.jpg');
        
        this.vortex = new CGFtexture(this.scene, imgPath + 'vortex.jpg');
        this.space = new CGFtexture(this.scene, imgPath + 'starfield.jpg');
        this.space_border = new CGFtexture(this.scene, imgPath + 'starfield_border.jpg');
    
        this.pipe_top = new CGFtexture(this.scene, imgPath + 'pipe_top.jpg');
        this.pipe_side = new CGFtexture(this.scene, imgPath + 'pipe_side.jpg');
        this.mario_brick = new CGFtexture(this.scene, imgPath + 'mario_brick.jpg');
    
        this.tree_trunk = new CGFtexture(this.scene, imgPath + 'tree_trunk.jpg');
        this.tree_leaves = new CGFtexture(this.scene, imgPath + 'tree_leaves.jpg');
        this.grass = new CGFtexture(this.scene, imgPath + 'grass.jpg');

    }

    initMaterials() {
        this.mat = new CGFappearance(this.scene);
        this.mat.setAmbient(0.6, 0.6, 0.6, 1);
        this.mat.setDiffuse(0.8, 0.8, 0.8, 1);
        this.mat.setSpecular(0.3, 0.3, 0.3, 1);
        this.mat.setShininess(10.0);
        this.mat.setTextureWrap('REPEAT', 'REPEAT');
    }

    display() {
        const currentAmbient = this.scene.graph.selectedAmbient;
        switch(currentAmbient) {
            // space
            case 'Space':
                this.mat.setTexture(this.space);
                break;

            // zelda + up
            case 'Zelda':
                this.mat.setTexture(this.tree_trunk);
                break;

            // super mario
            case 'Mario World':
                this.mat.setTexture(this.pipe_side);
                break;
            
            default:
                this.mat.setTexture(this.cellBase);
                break;
        }
        this.mat.apply();

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

        switch(currentAmbient) {
            // space
            case 'Space':
                if (this.isInner) this.mat.setTexture(this.space_border);
                else this.mat.setTexture(this.vortex);
                break;

            // zelda + up
            case 'Zelda':
                if (this.isInner) this.mat.setTexture(this.grass);
                else this.mat.setTexture(this.tree_leaves);
                break;

            // super mario
            case 'Mario World':
                if (this.isInner) this.mat.setTexture(this.mario_brick);
                else this.mat.setTexture(this.pipe_top);
                break;
            
            default:
                if (this.isInner) this.mat.setTexture(this.innerCellTop);
                else this.mat.setTexture(this.outerCellTop);
                break;
        }
        this.mat.apply();
        
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