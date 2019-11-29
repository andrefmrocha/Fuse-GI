class MyTriangle extends CGFobject {  
  
  /**
   * @method constructor
   * @param  {object} scene - Reference to MyScene object
   * @param  {number} x1 - X coordinate of vertex 1
   * @param  {number} y1 - Y coordinate of vertex 1
   * @param  {number} z1 - Z coordinate of vertex 1
   * @param  {number} x2 - X coordinate of vertex 2
   * @param  {number} y2 - Y coordinate of vertex 2
   * @param  {number} z2 - Z coordinate of vertex 2
   * @param  {number} x3 - X coordinate of vertex 3
   * @param  {number} y3 - Y coordinate of vertex 3
   * @param  {number} z3 - Z coordinate of vertex 3
   */
  constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    super(scene);

    this.x1 = x1;
    this.x2 = x2;
    this.x3 = x3;
    this.y1 = y1;
    this.y2 = y2;
    this.y3 = y3;
    this.z1 = z1;
    this.z2 = z2;
    this.z3 = z3;

    this.a = Math.sqrt(Math.pow(this.x1 - this.x2, 2) + Math.pow(this.y1 - this.y2, 2) + Math.pow(this.z1 - this.z2, 2));
    this.b = Math.sqrt(Math.pow(this.x2 - this.x3, 2) + Math.pow(this.y2 - this.y3, 2) + Math.pow(this.z2 - this.z3, 2));
    this.c = Math.sqrt(Math.pow(this.x3 - this.x1, 2) + Math.pow(this.y3 - this.y1, 2) + Math.pow(this.z3 - this.z1, 2));

    this.cosBeta = (Math.pow(this.a, 2) + Math.pow(this.b, 2) - Math.pow(this.c, 2)) / (2 * this.a * this.b);
    this.sinBeta = Math.sqrt(1 - Math.pow(this.cosBeta, 2));

    this.initBuffers();
  }

  /**
   * @method initBuffers
   * Initializes the triangle buffers
   */
  initBuffers() {
    /* Vertices */
    this.vertices = [this.x1, this.y1, this.z1, this.x2, this.y2, this.z2, this.x3, this.y3, this.z3];

    /* Indices */
    this.indices = [0, 1, 2];

    /* Normals */
    const v12 = [this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1];
    const v13 = [this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1];

    const cross_p = [
      v12[1] * v13[2] - v12[2] * v13[1],
      -(v12[0] * v13[2] - v12[2] * v13[0]),
      v12[0] * v13[1] - v12[1] * v13[0]
    ];
    const magnitude = Math.sqrt(Math.pow(cross_p[0], 2) + Math.pow(cross_p[1], 2) + Math.pow(cross_p[2], 2));

    const normalx = cross_p[0] / magnitude;
    const normaly = cross_p[1] / magnitude;
    const normalz = cross_p[2] / magnitude;
    this.normals = [normalx, normaly, normalz, normalx, normaly, normalz, normalx, normaly, normalz];

    /* Texture coordinates */
    this.texCoords = [
      0, 1, 
      this.a, 1, 
      this.c * this.cosBeta, 1 - this.c * this.sinBeta
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  
  /**
   * @method updateTexCoords
   * Updates the list of texture coordinates of the triangle
   * @param {number} length_s - Texture length in the u axis
   * @param {number} length_t - Texture length in the v axis
   */
  updateTexCoords(length_s, length_t) {
    this.texCoords = [
      0, 1, 
      this.a / length_s, 1,
      (this.c * this.cosBeta) / length_s, 1 - (this.c * this.sinBeta) / length_t
    ];
    this.updateTexCoordsGLBuffers();
  }
}
