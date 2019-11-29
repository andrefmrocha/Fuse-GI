class MyPatch extends CGFobject {

    /**
     * @param  {object} scene - Reference to a MyScene object.
     * @param  {Number} nPointsU - Number of points in U of  patch
     * @param  {Number} nPointsV - Number of points in V of  patch
     * @param  {Number} nPartsU - Number of parts of a patch in U. Adds further complexion in U. 
     * @param  {Number} nPartsV - Number of parts of a patch in V. Adds further complexion in V. 
     * @param  {Number[][][]} controlVertices - Control vertices coordinates to design the patch 
     */
    constructor(scene, nPointsU, nPointsV, nPartsU, nPartsV, controlVertices) {
        super(scene);
        this.degree1 = nPointsU-1;
        this.degree2 = nPointsV-1;
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.controlVertices = controlVertices;

        this.initPatch();
    }

    
    /**
     * Create the nurbs surface patch
     */
    initPatch() {
        let nurbsSurface = new CGFnurbsSurface(this.degree1, this.degree2, this.controlVertices);

        this.nurbsObj = new CGFnurbsObject(this.scene, this.nPartsU, this.nPartsV, nurbsSurface);        
    }

    /**
     * Display the patch
     */

    display() {
        this.nurbsObj.display();
    }
}