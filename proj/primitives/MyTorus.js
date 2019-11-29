class MyTorus extends CGFobject {
    /**
     * @method constructor
     * @param  {object} scene - Reference to a MyScene object.
     * @param  {number} innerRadius - Inner radius of a torus slice
     * @param  {number} outerRadius - Outer radius of the torus, from its center to the center of a slice
     * @param  {number} slices - Number of sides around inner radius
     * @param  {number} loops - Number of loops around circular axis
     */
    constructor(scene, innerRadius, outerRadius, slices, loops) {
        super(scene);

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    /**
     * @method initBuffers
     * Initializes the torus buffers
     */
    initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
        this.texCoords = [];

        /*
            References for understanding the torus:
            http://www.it.hiof.no/~borres/j3d/math/param/p-param.html#maparam28
            https://services.math.duke.edu/education/ccp/materials/mvcalc/parasurfs/para1.html
        */ 
        let theta = 0; /* Angle in the xy axis from quadrants 1 -> 4 -> 3 -> 2 */
        let phi = 0; /* Angle in the torus circunference of the current segment */
        const thetaInc = 2 * Math.PI / this.loops;
        const phiInc = 2 * Math.PI / this.slices;
        for (let ring = 0; ring <= this.loops; ring++) {

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            phi = 0;
            for (let seg = 0; seg <= this.slices; seg++) {

                const cosPhi = Math.cos(phi);
                
                /* Vertices coordinates */
                const x = (this.outerRadius + this.innerRadius * cosPhi) * cosTheta;
                const y = (this.outerRadius + this.innerRadius * cosPhi) * sinTheta;
                const z = this.innerRadius * Math.sin(phi);
                this.vertices.push(x, y, z);

                /* Normals */
                const normalx = x - cosTheta*this.outerRadius;
                const normaly = y - sinTheta*this.outerRadius;
                const normalz = z;
                const magn = Math.sqrt(Math.pow(normalx, 2) + Math.pow(normaly,2) + Math.pow(normalz,2));
                this.normals.push(normalx/magn, normaly/magn, normalz/magn);

                /* Texture coordinates */
                const u = 1 - (seg / this.slices);
                const v = 1 - (ring / this.loops);
                this.texCoords.push(u, v);

                phi += phiInc;
            }
            theta += thetaInc;
        }
        
        const verticesPerRing = this.slices+1;
        for (let ring = 0; ring < this.loops; ring++) {
            for (let seg = 0; seg < this.slices; seg++) {
                const first = ring * verticesPerRing + seg;
                const second = first + verticesPerRing;

                this.indices.push(first, second, first+1);
                this.indices.push(second, second+1, first+1);            
            }
        }


        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}