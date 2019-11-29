const componentParser = {
  /**
   * @param  {XML Collection} componentsNode
   * @param  {MySceneGraph} sceneGraph
   */
  parseComponents: (componentsNode, sceneGraph) => {
    const children = componentsNode.children;

    sceneGraph.components = {};

    // Any number of components.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'component') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current component.
      const componentID = parserUtils.reader.getString(children[i], 'id');
      if (!componentID) return 'no ID defined for componentID';

      // Checks for repeated IDs.
      if (sceneGraph.components[componentID] != null)
        return 'ID must be unique for each component (conflict: ID = ' + componentID + ')';

      const grandChildren = children[i].children;

      const nodeNames = [];
      for (let j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      const transformationIndex = nodeNames.indexOf('transformation');
      const materialsIndex = nodeNames.indexOf('materials');
      const textureIndex = nodeNames.indexOf('texture');
      const childrenIndex = nodeNames.indexOf('children');
      const animationIndex = nodeNames.indexOf('animationref');

 
      if (transformationIndex == -1) onXMLError('Missing transformation tag on component');
      if (materialsIndex == -1) onXMLError('Missing materials tag on component');
      if (textureIndex == -1) onXMLError('Missing texture tag on component');
      if (childrenIndex == -1) onXMLError('Missing children tag on component');

      if (transformationIndex != 0) console.warn('transformation tag out of place!');
      if ((materialsIndex != 1 && animationIndex == -1) || (animationIndex != -1 && materialsIndex != 2))
        console.warn('materials tag out of place!');
      if ((textureIndex != 2 && animationIndex == -1) || (animationIndex != -1 && textureIndex != 3))
        console.warn('texture tag out of place!');
      if ((childrenIndex != 3 && animationIndex == -1) || (animationIndex != -1 && childrenIndex != 4))
        console.warn('children tag out of place!');
      if (animationIndex != -1 && animationIndex != 1) console.warn('animation tag out of place!');

      const currentComponent = {};

      // Transformations
      currentComponent.transformation = componentParser.parseComponentTransformations(
        grandChildren[transformationIndex].children,
        sceneGraph
      );

      // Materials
      currentComponent.materials = componentParser.parseComponentMaterials(
        grandChildren[materialsIndex].getElementsByTagName('material'),
        sceneGraph.materials
      );

      // Texture
      currentComponent.texture = componentParser.parseComponentTexture(
        grandChildren[textureIndex],
        sceneGraph
      );

      // Children
      currentComponent.children = componentParser.parsePrimitiveChildren(
        grandChildren[childrenIndex].getElementsByTagName('primitiveref'),
        sceneGraph.primitives
      );
      currentComponent.children = currentComponent.children.concat(
        componentParser.parseComponentChildren(
          grandChildren[childrenIndex].getElementsByTagName('componentref'),
        )
      );

      if (animationIndex != -1) {
        currentComponent.animation = componentParser.parseAnimationChildren(
          grandChildren[animationIndex],
          sceneGraph
        );
      }


      if (!currentComponent.texture) {
        sceneGraph.onXMLError("Component parser, missing texture");
      }
      else if (!currentComponent.materials || currentComponent.materials.length == 0) {
        sceneGraph.onXMLError("Component parser, missing materials");
      }
      else if (!currentComponent.children || currentComponent.children.length == 0) {
        sceneGraph.onXMLError("Component parser, missing children");
      }
      else {
        sceneGraph.components[componentID] = currentComponent;
      }
    }
  },
  /**
   * @param  {string} textureRef
   * @param  {object} textures
   * @param  {MySceneGraph} sceneGraph
   */
  parseComponentTexture: (textureRef, sceneGraph) => {
    const textures = sceneGraph.textures;
    const textureID = parserUtils.reader.getString(textureRef, 'id');
    if (!textureID) console.error("missing texture ID");

    if (textureID == 'inherit' || textureID == 'none') {
      if (
        parserUtils.reader.hasAttribute(textureRef, 'length_s') &&
        parserUtils.reader.hasAttribute(textureRef, 'length_t')
      )
        sceneGraph.onXMLMinorError('length_s and lengh_t should not be defined!');
      return {
        texture: textureID ? textureID : null
      };
    }
    const texture = textures[textureID];
    const lengthS = parserUtils.reader.hasAttribute(textureRef, 'length_s')
      ? parserUtils.reader.getFloat(textureRef, 'length_s')
      : null;
    const lengthT = parserUtils.reader.hasAttribute(textureRef, 'length_t')
      ? parserUtils.reader.getFloat(textureRef, 'length_t')
      : null;
    if (!lengthS || !lengthT) sceneGraph.onXMLMinorError('length_s and lengh_t must be defined!');
    return {
      lengthS: lengthS ? lengthS : 1,
      lengthT: lengthT ? lengthT : 1,
      texture: texture ? texture : null
    };
  },

  /**
   * @param  {XMLCollection Object} componentTransformation
   * @param  {Object} transformations
   * @param  {MySceneGraph} sceneGraph
   */
  parseComponentTransformations: (componentTransformation, sceneGraph) => {
    const transformations = sceneGraph.transformations;
    const transformationChildren = [];
    for (var j = 0; j < componentTransformation.length; j++) {
      transformationChildren.push(componentTransformation[j].nodeName);
    }
    const primitiveRefIndex = transformationChildren.indexOf('transformationref');
    if (primitiveRefIndex != -1) {
      const transformationID = parserUtils.reader.getString(componentTransformation[primitiveRefIndex], 'id');
      if (!transformationID) console.error("missing transformation id");

      return transformations[transformationID];
    }
    return transformationParser.parseTransformation(componentTransformation, transformations, sceneGraph);
  },


  /**
   * @param  {XMLCollection Object} materialsNode
   * @param  {Object} materials
   */
  parseComponentMaterials: (materialsNode, materials) => {
    const componentMaterials = [];
    for (let i = 0; i < materialsNode.length; i++) {
      const materialID = parserUtils.reader.getString(materialsNode[i], 'id');
      if (!materialID) console.error("missing material id");

      componentMaterials.push(materialID === 'inherit' ? materialID : materials[materialID]);
    }
    return componentMaterials;
  },


  /**
   * @param  {XMLCollection Object} componentChildren
   */
  parseComponentChildren: (componentChildren) => {
    const componentsChildren = [];
    for (let i = 0; i < componentChildren.length; i++) {
      const childID = parserUtils.reader.getString(componentChildren[i], 'id');
      if (!childID) console.error("missing component child id");

      componentsChildren.push(childID);
    }
    return componentsChildren;
  },

  /**
   * @param  {XMLCollection Object} primitiveChildren
   * @param  {Object} primitives
   */
  parsePrimitiveChildren: (primitiveChildren, primitives) => {
    const components = [];
    for (let i = 0; i < primitiveChildren.length; i++) {
      const childID = parserUtils.reader.getString(primitiveChildren[i], 'id');
      if (!childID) console.error("missing primitive child id");

      components.push(primitives[childID]);
    }
    return components;
  },

  parseAnimationChildren: (animationsNode, sceneGraph) => {
    const id = parserUtils.reader.getString(animationsNode, 'id');
    if (!id) sceneGraph.onXMLError('No id on animation ref');
    return sceneGraph.animations[id];
  }
}
