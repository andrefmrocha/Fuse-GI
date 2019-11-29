class MySphere extends CGFobject {
    /**
     * @method constructor
     * @param  {object} scene - Reference to a MyScene object.
     * @param  {number} radius - Radius of the sphere
     * @param  {number} slices - Number of slices around Z axis
     * @param  {number} stacks - Number of stacks along Z axis, from the center to a pole
     */
    constructor(scene, radius, slices, stacks) {
        super(scene);

        this.radius = radius;
        this.latBands = stacks*2;
        this.longBands = slices;

		this.initBuffers();
    }

    /**
     * @method initBuffers
     * Initializes the sphere buffers
     */
    initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
        
        /* 
        * Calculate sphere vertex positions, normals, and texture coordinates.
        *
        * Visual representation of the calculus below:
        * https://mse.redwoods.edu/darnold/math50c/mathjax/spherical/spherical3.png
        * phi and theta below are the same as in the picture.
        */
       let phi = 0;
       let theta = 0;
       const phiInc = Math.PI / this.latBands;
       const thetaInc = 2 * Math.PI / this.longBands;
        for (let latNum = 0; latNum <= this.latBands; latNum++) {
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            theta = 0;
            for (let longNum = 0; longNum <= this.longBands; longNum++) {
                
                /* Vertices coordinates */
                const x = Math.cos(theta) * sinPhi;
                const y = Math.sin(theta) * sinPhi;
                const z = cosPhi;
                this.vertices.push(this.radius * x, this.radius * y, this.radius * z);

                /* Normals */
                this.normals.push(x,y,z);

                /* Texture coordinates */
                const u = longNum / this.longBands;
                const v = latNum / this.latBands;
                this.texCoords.push(u, v);

                theta += thetaInc;
            }

            phi += phiInc;
        }

        /* Number of vertices per latitude band */
        const latBandVertices = this.longBands+1;

        /* Calculate sphere indices */
        for (let latNum = 0; latNum < this.latBands; latNum++) {
            for (let longNum = 0; longNum < this.longBands; longNum++) {
                const first = latNum * latBandVertices + longNum;
                const second = first + latBandVertices;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second+1, first+1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}