class MyBasedCylinder extends CGFobject {

	constructor(scene, height, base, top, slices, stacks) {
		super(scene);
		this.height = height;
		this.base = base;
		this.top = top;
		this.slices = slices;
		this.stacks = stacks*2;
		this.initBuffers();
	}

	initSide() {
		/*
			sizePerStack - z increment by division along the z axis
			radius - radius of current side division, resulting from interpolating base and top
			theta - angle in the xy plane
			sideDivVertices - number of vertices per latitude band

			the vertices go from quadrants on the xy plane: 1 -> 4 -> 3 -> 2

			u ranges linearly from 0.0 at z = 0 to 1.0 at z = height, 
			and v ranges from 0.0 at the +y axis, to 0.25 at the +x axis, 
			to 0.5 at the -y axis, to 0.75 at the \-x axis, and back to 1.0 at the +y axis
		*/
		const alphaTan = Math.abs(this.top - this.base) / this.height;
		const normalMagn = Math.sqrt(1 + Math.pow(alphaTan, 2)); /* x=sin, y=cos -> x^2 + y^2 = 1 */
		const normalz = -alphaTan/normalMagn;

		const sizePerStack = this.height / this.stacks;
		let z = 0;
		const thetaInc = 2 * Math.PI / this.slices;
		for (let sideDiv = 0; sideDiv <= this.stacks; sideDiv++) {

			const radius = (this.top*1.0 - this.base) / this.height * z + this.base;
			let theta = 0;
			for (let radiusDiv = 0; radiusDiv <= this.slices; radiusDiv++) {

				/* Vertices coordinates */
				const x = Math.cos(theta);
				const y = Math.sin(theta);
				this.vertices.push(x * radius, y * radius, z)

				/* Normals */
				this.normals.push(x/normalMagn, y/normalMagn, normalz);

				/* Texture coordinates */
				const u = radiusDiv / this.slices;
				const v = 1 - (sideDiv / this.stacks);
				this.texCoords.push(u, v);

				theta += thetaInc;
			}
			z += sizePerStack;
		}

		let sideDivVertices = this.slices+1;
		for (let sideDiv = 0; sideDiv < this.stacks; sideDiv++) {
			for (let radiusDiv = 0; radiusDiv < this.slices; radiusDiv++) {
				const first = sideDiv * sideDivVertices + radiusDiv;
				const second = first + sideDivVertices;

				this.indices.push(first, first + 1, second);
				this.indices.push(second, first + 1, second + 1);
			}
		}
	}

	initBases() {

		/* Base and top outer vertices */
		let theta = 0;
		const thetaInc = 2 * Math.PI / this.slices;
		for (let radiusDiv = 0; radiusDiv <= this.slices; radiusDiv++) {

			/* Vertices coordinates */
			const x = Math.cos(theta);
			const y = Math.sin(theta);
			this.vertices.push(x * this.base, y * this.base, 0);
			this.vertices.push(x * this.top, y * this.top, this.height);

			/* Normals */
			this.normals.push(0, 0, -1);
			this.normals.push(0, 0, 1);

			/* Texture coordinates */
			this.texCoords.push(-x/2 + 0.5, -y/2 + 0.5);
			this.texCoords.push(x/2 + 0.5, -y/2 + 0.5);

			theta += thetaInc;
		}

		/* Center vertices */
		this.vertices.push(0, 0, 0);
		this.vertices.push(0, 0, this.height);

		this.normals.push(0,0,-1);
		this.normals.push(0,0,1);

		this.texCoords.push(0.5, 0.5);
		this.texCoords.push(0.5, 0.5);
		
		/* Indexes */
		const vertexCount = (this.slices+1) * (this.stacks+1);
		const centerBase = vertexCount + this.slices*2;
		const centerTop = centerBase+1;
		for (let radiusDiv = 0; radiusDiv < this.slices; radiusDiv++) {
			const indexBase = vertexCount + radiusDiv*2;			
			const indexTop = vertexCount + radiusDiv*2 + 1;

			this.indices.push(indexBase, centerBase, indexBase+2);
			this.indices.push(centerTop, indexTop, indexTop+2);
		}
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		this.initSide();
		this.initBases();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}

}