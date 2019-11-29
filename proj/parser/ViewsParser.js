const viewsParser = {
  /**
   * @param  {XMLCollection Object} perspectiveNodes
   * @param  {MySceneGraph} sceneGraph
   */
  parsePerspectiveViews: (perspectiveNodes, sceneGraph) => {
    for (let i = 0; i < perspectiveNodes.length; i++) {
      const id = parserUtils.reader.getString(perspectiveNodes[i], 'id');
      const near = parserUtils.reader.getFloat(perspectiveNodes[i], 'near');
      const far = parserUtils.reader.getFloat(perspectiveNodes[i], 'far');
      const angle = parserUtils.reader.getFloat(perspectiveNodes[i], 'angle') * DEGREE_TO_RAD;
      const perspectiveChildren = perspectiveNodes[i].children;

      const errorMessage = `Error parsing of from object of perspective of ${id}`;
      if(!id || near == null || far == null || angle == null) return errorMessage;

      let from, to;
      for (let j = 0; j < perspectiveChildren.length; j++) {
        if (perspectiveChildren[j].nodeName == 'from') {
          from = parserUtils.parseCoordinates3D(perspectiveChildren[j], errorMessage);
        } else if (perspectiveChildren[j].nodeName == 'to') {
          to = parserUtils.parseCoordinates3D(perspectiveChildren[j], errorMessage);
        }
      }
      if (from === errorMessage || to === errorMessage) sceneGraph.onXMLError(errorMessage);
      else sceneGraph.perspectives[id] = new CGFcamera(angle, near, far, from, to);
    }
  },

  /**
   * @param  {XMLCollection Object} orthoNodes
   * @param  {MySceneGraph} sceneGraph
   */
  parseOrthoViews: (orthoNodes, sceneGraph) => {
    for (let i = 0; i < orthoNodes.length; i++) {
      const id = parserUtils.reader.getString(orthoNodes[i], 'id');
      const near = parserUtils.reader.getFloat(orthoNodes[i], 'near');
      const far = parserUtils.reader.getFloat(orthoNodes[i], 'far');
      const left = parserUtils.reader.getFloat(orthoNodes[i], 'left');
      const right = parserUtils.reader.getFloat(orthoNodes[i], 'right');
      const top = parserUtils.reader.getFloat(orthoNodes[i], 'top');
      const bottom = parserUtils.reader.getFloat(orthoNodes[i], 'bottom');
      const orthoChildren = orthoNodes[i].children;

      const errorMessage = `Error parsing of from object of perspective of ${id}`;      
      if(!id || near == null || far == null || left == null || right == null || top == null || bottom == null) return errorMessage;
      
      let from, to, up;
      for (let j = 0; j < orthoChildren.length; j++) {
        if (orthoChildren[j].nodeName == 'from') {
          from = parserUtils.parseCoordinates3D(orthoChildren[j], errorMessage);
        } else if (orthoChildren[j].nodeName == 'to') {
          to = parserUtils.parseCoordinates3D(orthoChildren[j], errorMessage);
        } else if (orthoChildren[j].nodeName == 'up') {
          up = parserUtils.parseCoordinates3D(orthoChildren[j], errorMessage);
        }
      }
      up = up ? up : [0, 1, 0];
      if (from === errorMessage || to === errorMessage || up === errorMessage) sceneGraph.onXMLError(errorMessage);
      else sceneGraph.perspectives[id] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
    }
  }
};
