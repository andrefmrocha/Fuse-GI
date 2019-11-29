class MyPlane extends CGFobject {

    constructor(scene, nPartsU, nPartsV) {
        super(scene);
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.initPlane();
    }

    initPlane() {
        let controlVertices = [	
            // U = 0	
            [ // V = 0..1;
                 [-0.5, 0, 0.5, 1 ],
                 [-0.5, 0, -0.5, 1 ]
                
            ],
            // U = 1
            [ // V = 0..1
                 [ 0.5, 0, 0.5, 1 ],
                 [ 0.5, 0, -0.5, 1 ]							 
            ]
        ];

        let nurbsSurface = new CGFnurbsSurface(1, 1, controlVertices);

        this.nurbsObj = new CGFnurbsObject(this.scene, this.nPartsU, this.nPartsV, nurbsSurface);        
    }

    display() {
        this.nurbsObj.display();
    }
}