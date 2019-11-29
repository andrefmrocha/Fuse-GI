/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyRectangle extends CGFobject {
  constructor(scene, x1, x2, y1, y2) {
    super(scene);
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;

    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [
      this.x1,
      this.y1,
      0, //0
      this.x2,
      this.y1,
      0, //1
      this.x1,
      this.y2,
      0, //2
      this.x2,
      this.y2,
      0 //3
    ];

    //Counter-clockwise reference of vertices
    this.indices = [0, 1, 2, 1, 3, 2];

    //Facing Z positive
    this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    /*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

    this.texCoords = [0, 1, 1, 1, 0, 0, 1, 0];
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  /**
   * @method updateTexCoords
   * Updates the list of texture coordinates of the rectangle
   * @param {number} length_s - Texture length in the u axis
   * @param {number} length_t - Texture length in the v axis
   */
  updateTexCoords(length_s, length_t) {
    const a = this.x2 - this.x1;
    const b = this.y2 - this.y1;

    const u = a / length_s;
    const v = b / length_t;

    this.texCoords = [
      0, v,
      u, v,
      0, 0,
      u, 0
    ];

    this.updateTexCoordsGLBuffers();
  }
}
