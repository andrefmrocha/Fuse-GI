const transformationParser = {
  /**
   * @param  {XMLCollection Object} transformationsNode
   * @param  {Object} transformations
   * @param  {MySceneGraph} sceneGraph
   */
  parseTransformations: (transformationsNode, transformations, sceneGraph) => {
    const children = transformationsNode.children;

    // Any number of transformations.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'transformation') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current transformation.
      const transformationID =  parserUtils.reader.getString(children[i], 'id');
      if (!transformationID) return 'no ID defined for transformation';

      // Checks for repeated IDs.
      if (transformations[transformationID] != null)
        return 'ID must be unique for each transformation (conflict: ID = ' + transformationID + ')';

      const grandChildren = children[i].children;
      if (grandChildren.length != 0) {
        // Specifications for the current transformation.
        transformations[transformationID] = transformationParser.parseTransformation(grandChildren, transformationID);
      }
    }

    if (Object.keys(transformations).length == 0) return 'No transformations found!';

    return null;
  },

  /**
   * @param  {XMLCollection Object} transformationChildren
   * @param  {string} transformationID
   */
  parseTransformation: (transformationChildren, transformationID) => {
    let transfMatrix = mat4.create();
    mat4.identity(transfMatrix);

    for (let j = 0; j < transformationChildren.length; j++) {
      switch (transformationChildren[j].nodeName) {
        case 'translate':
          const coordinates = parserUtils.parseCoordinates3D(
            transformationChildren[j],
            'translate transformation for ID ' + transformationID
          );
          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
          break;
        case 'scale':
          const coords = parserUtils.parseCoordinates3D(
            transformationChildren[j],
            `scale information for ID ${transformationID}`
          );
          transfMatrix = mat4.scale(transfMatrix, transfMatrix, coords);
          break;
        case 'rotate':
          // angle
          const rotateInfo = transformationParser.parseRotation(transformationChildren[j]);
          transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotateInfo.angle, rotateInfo.axis);
          break;
      }
    }
    return transfMatrix;
  },

  /**
   * @param  {XMLCollection Object} rotate
   */
  parseRotation: rotate => {
    const axis = parserUtils.reader.getString(rotate, 'axis');
    const angle = parserUtils.reader.getFloat(rotate, 'angle');

    if(!axis || angle == null) console.error("missing rotation value");

    let axisVec;
    switch (axis) {
      case 'x':
        axisVec = [1, 0, 0];
        break;
      case 'y':
        axisVec = [0, 1, 0];
        break;
      case 'z':
        axisVec = [0, 0, 1];
        break;
      default:
        axisVec = [0, 0, 0];
        break;
    }
    return {
      angle: this.DEGREE_TO_RAD * angle,
      axis: axisVec
    };
  }
};
