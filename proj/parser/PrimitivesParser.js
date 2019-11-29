
/**
 * @param  {XMLCollection Object} primitive
 * @param  {string} attribute
 * @param  {string} errorMessage
 * @param  {MySceneGraph} sceneGraph
 */
function getPrimitiveFloatInfo(primitive, attribute, errorMessage, sceneGraph) {
  const attributeValue = parserUtils.reader.getFloat(primitive, attribute);

  if (!(attributeValue != null && !isNaN(attributeValue))) sceneGraph.onXMLError(errorMessage);
  else return attributeValue;
}

/**
 * @param  {XMLCollection Object} primitive
 * @param  {string} attribute
 * @param  {string} errorMessage
 * @param  {MySceneGraph} sceneGraph
 */
function getPrimitiveIntInfo(primitive, attribute, errorMessage, sceneGraph) {
  const attributeValue = parserUtils.reader.getInteger(primitive, attribute);

  if (!(attributeValue != null && !isNaN(attributeValue))) sceneGraph.onXMLError(errorMessage);
  else return attributeValue;
}

const primitiveParsers = {
  /**
   * @param  {XMLCollection Object} primitivesNode
   * @param  {Object} primitives
   * @param  {MySceneGraph} sceneGraph
   */
  parsePrimitives: (primitivesNode, primitives, sceneGraph) => {
    var children = primitivesNode.children;

    // Any number of primitives.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'primitive') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current primitive.
      var primitiveId = parserUtils.reader.getString(children[i], 'id');
      if (!primitiveId) return 'no ID defined for texture';

      // Checks for repeated IDs.
      if (primitives[primitiveId] != null)
        return 'ID must be unique for each primitive (conflict: ID = ' + primitiveId + ')';

      const grandChildren = children[i].children;

      const primitiveType = grandChildren[0].nodeName;
      // Validate the primitive type
      if (
        grandChildren.length != 1 ||
        (primitiveType != 'rectangle' &&
          primitiveType != 'triangle' &&
          primitiveType != 'cylinder' &&
          primitiveType != 'sphere' &&
          primitiveType != 'torus' &&
          primitiveType != 'plane' &&
          primitiveType != 'patch' &&
          primitiveType != 'cylinder2')
      ) {
        return 'There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus, plane, patch, cylinder2)';
      }

      // Specifications for the current primitive.
      let primitive;

      // Retrieves the primitive coordinates.
      switch (primitiveType) {
        case 'rectangle':
          primitive = primitiveParsers.parseRectangle(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'cylinder':
          primitive = primitiveParsers.parseCylinder(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'sphere':
          primitive = primitiveParsers.parseSphere(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'torus':
          primitive = primitiveParsers.parseTorus(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'triangle':
          primitive = primitiveParsers.parseTriangle(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'plane':
          primitive = primitiveParsers.parsePlane(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;
        
        case 'patch':
          primitive = primitiveParsers.parsePatch(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'cylinder2':
          primitive = primitiveParsers.parseCylinder2(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        default:
          console.warn('Unkown primitive!');
      }
      if (primitive && sceneGraph.loadedOk) primitives[primitiveId] = primitive;
    }

    if (Object.keys(primitives).length == 0) return 'No valid primitives found!';
    return null;
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseRectangle: (component, scene, primitiveId, sceneGraph) => {
    // x1
    const x1 = getPrimitiveFloatInfo(
      component,
      'x1',
      'unable to parse x1 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // y1
    const y1 = getPrimitiveFloatInfo(
      component,
      'y1',
      'unable to parse y1 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // x2
    const x2 = getPrimitiveFloatInfo(
      component,
      'x2',
      'unable to parse x2 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // y2
    const y2 = getPrimitiveFloatInfo(
      component,
      'y2',
      'unable to parse y2 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    return new MyRectangle(scene, x1, x2, y1, y2);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseCylinder: (component, scene, primitiveId, sceneGraph) => {
    const base = getPrimitiveFloatInfo(
      component,
      'base',
      'unable to parse base of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const top = getPrimitiveFloatInfo(
      component, 
      'top',
      'unable to parse top of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const height = getPrimitiveFloatInfo(
      component,
      'height',
      'unable to parse height of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderSlices = getPrimitiveIntInfo(
      component,
      'slices',
      'unable to parse slices of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderStacks = getPrimitiveIntInfo(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyCylinder(scene, height, base, top, cylinderSlices, cylinderStacks);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseSphere: (component, scene, primitiveId, sceneGraph) => {
    const sphereStacks = getPrimitiveIntInfo(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const sphereSlices = getPrimitiveIntInfo(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const sphereRadius = getPrimitiveFloatInfo(
      component,
      'radius',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MySphere(scene, sphereRadius, sphereSlices, sphereStacks);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseTorus: (component, scene, primitiveId, sceneGraph) => {
    const torusSlices = getPrimitiveIntInfo(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusInner = getPrimitiveFloatInfo(
      component,
      'inner',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusOuter = getPrimitiveFloatInfo(
      component,
      'outer',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusLoops = getPrimitiveIntInfo(
      component,
      'loops',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyTorus(scene, torusInner, torusOuter, torusSlices, torusLoops);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseTriangle: (component, scene, primitiveId, sceneGraph) => {
    const triX1 = getPrimitiveFloatInfo(
      component,
      'x1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triX2 = getPrimitiveFloatInfo(
      component,
      'x2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triX3 = getPrimitiveFloatInfo(
      component,
      'x3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY1 = getPrimitiveFloatInfo(
      component,
      'y1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY2 = getPrimitiveFloatInfo(
      component,
      'y2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY3 = getPrimitiveFloatInfo(
      component,
      'y3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ1 = getPrimitiveFloatInfo(
      component,
      'z1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ2 = getPrimitiveFloatInfo(
      component,
      'z2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ3 = getPrimitiveFloatInfo(
      component,
      'z3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyTriangle(scene, triX1, triY1, triZ1, triX2, triY2, triZ2, triX3, triY3, triZ3);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parsePlane: (component, scene, primitiveId, sceneGraph) => {
    const nPartsU = getPrimitiveIntInfo(
      component,
      'npartsU',
      'unable to parse npartsU of the primitive with ID = ' + primitiveId,
      sceneGraph
    );

    const nPartsV = getPrimitiveIntInfo(
      component,
      'npartsV',
      'unable to parse npartsV of the primitive with ID = ' + primitiveId,
      sceneGraph
    );
    
    return new MyPlane(scene, nPartsU, nPartsV);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parsePatch: (component, scene, primitiveId, sceneGraph) => {
    const nPointsU = getPrimitiveIntInfo(
      component,
      'npointsU',
      'unable to parse npointsU of the primitive with ID = ' + primitiveId,
      sceneGraph
    );

    const nPointsV = getPrimitiveIntInfo(
      component,
      'npointsV',
      'unable to parse npointsU of the primitive with ID = ' + primitiveId,
      sceneGraph
    );

    const nPartsU = getPrimitiveIntInfo(
      component,
      'npartsU',
      'unable to parse npartsU of the primitive with ID = ' + primitiveId,
      sceneGraph
    );

    const nPartsV = getPrimitiveIntInfo(
      component,
      'npartsV',
      'unable to parse npartsV of the primitive with ID = ' + primitiveId,
      sceneGraph
    );

    let controlPoints = [];
    for (let i = 0; i < component.children.length; i++) {

      const index = parseInt(i / nPointsV);
      if (index >= controlPoints.length) {
        controlPoints.push([]);
      }
      controlPoints[index].push(primitiveParsers.parseControlPoint(component.children[i]));
    }

    if (component.children.length != nPointsU*nPointsV)
      sceneGraph.onXMLError('number of control points defined does not match nPointsU*nPointsV, for primitive id = ' + primitiveId);

    return new MyPatch(scene, nPointsU, nPointsV, nPartsU, nPartsV, controlPoints);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseControlPoint: (component, primitiveId, sceneGraph) => {
    
    const xx = parserUtils.reader.getFloat(component, 'xx');
    const yy = parserUtils.reader.getFloat(component, 'yy');
    const zz = parserUtils.reader.getFloat(component, 'zz');

    if(xx == null || yy == null || zz == null)
      sceneGraph.onXMLError('unable to parse control point of primitive with id = ' + primitiveId);

    return [xx, yy, zz, 1];
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseCylinder2: (component, scene, primitiveId, sceneGraph) => {
    const base = getPrimitiveFloatInfo(
      component,
      'base',
      'unable to parse base of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const top = getPrimitiveFloatInfo(
      component, 
      'top',
      'unable to parse top of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const height = getPrimitiveFloatInfo(
      component,
      'height',
      'unable to parse height of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderSlices = getPrimitiveIntInfo(
      component,
      'slices',
      'unable to parse slices of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderStacks = getPrimitiveIntInfo(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    return new MyCylinder2(scene, base, top, height, cylinderSlices, cylinderStacks);
  }
};
