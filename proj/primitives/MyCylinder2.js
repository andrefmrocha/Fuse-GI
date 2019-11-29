class MyCylinder2 extends CGFobject {

    /**
    * @method constructor
    * @param  {object} scene - Reference to a MyScene object.
    * @param  {number} height - Height of the cylinder along the z axis
    * @param  {number} base - Radius of the base
    * @param  {number} top - Radius of the top
    * @param  {number} slices - Number of division in rotation
    * @param  {number} stacks - Number of divisions in height
    */
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initCylinder();
    }
    /**
     * Inicializes the cylinder vertices and passes down said 
     * information to a Nurbs Surface
     */
    initCylinder() {
        let controlVertices = [	
            // U = 0	
            [ // V = 0,1
                [this.base, 0, 0, 1 ],	
                [this.top, 0, this.height, 1 ]                
            ],
            // U = 1
            [ // V = 0,1
                [this.base, this.base/0.75, 0, 1 ],	
                [this.top, this.top/0.75, this.height, 1 ]      
            ],
            // U = 2
            [ // V = 0,1
                [-this.base, this.base/0.75, 0, 1 ],	
                [-this.top, this.top/0.75, this.height, 1 ]      
            ],
            // U = 3
            [ // V = 0,1
                [-this.base, 0, 0, 1 ],	
                [-this.top, 0, this.height, 1 ]      
            ]
        ];
        let nurbsSurface = new CGFnurbsSurface(3, 1, controlVertices);

        this.nurbsObj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);         
    }
    /**
     * Displays the cylinder
     */
    display() {
        this.nurbsObj.display();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.nurbsObj.display();
        this.scene.popMatrix();
    }
}