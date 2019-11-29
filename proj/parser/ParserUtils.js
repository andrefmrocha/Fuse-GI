const parserUtils = {
  reader: new CGFXMLreader(),
  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates3D: (node, messageError) => {
    // x
    const x = parserUtils.reader.getFloat(node, 'x');
    if (!(x != null && !isNaN(x))) return 'unable to parse x-coordinate of the ' + messageError;

    // y
    const y = parserUtils.reader.getFloat(node, 'y');
    if (!(y != null && !isNaN(y))) return 'unable to parse y-coordinate of the ' + messageError;

    // z
    const z = parserUtils.reader.getFloat(node, 'z');
    if (!(z != null && !isNaN(z))) return 'unable to parse z-coordinate of the ' + messageError;

    return [x, y, z];
  },
  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates4D: (node, messageError) => {
    const position = parserUtils.parseCoordinates3D(node, messageError);;

    if (!Array.isArray(position)) return position;

    // w
    const w = parserUtils.reader.getFloat(node, 'w');
    if (!(w != null && !isNaN(w))) return 'unable to parse w-coordinate of the ' + messageError;

    position.push(w);

    return position;
  },

  /**
   * Parse the color components from a node
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseColor: (node, messageError) => {
    // R
    const r = parserUtils.reader.getFloat(node, 'r');
    if (!(r != null && !isNaN(r) && r >= 0 && r <= 1)) return 'unable to parse R component of the ' + messageError;

    // G
    const g = parserUtils.reader.getFloat(node, 'g');
    if (!(g != null && !isNaN(g) && g >= 0 && g <= 1)) return 'unable to parse G component of the ' + messageError;

    // B
    const b = parserUtils.reader.getFloat(node, 'b');
    if (!(b != null && !isNaN(b) && b >= 0 && b <= 1)) return 'unable to parse B component of the ' + messageError;

    // A
    const a = parserUtils.reader.getFloat(node, 'a');
    if (!(a != null && !isNaN(a) && a >= 0 && a <= 1)) return 'unable to parse A component of the ' + messageError;

    return [r, g, b, a];
  },

  parseAttenuation:(node) => {
    const constant = parserUtils.reader.getFloat(node, 'constant');
    const linear = parserUtils.reader.getFloat(node, 'linear');
    const quadratic = parserUtils.reader.getFloat(node, 'quadratic');
    return {
      constant,
      linear,
      quadratic
    }
  }
};