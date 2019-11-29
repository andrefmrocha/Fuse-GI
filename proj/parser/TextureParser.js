const textureParser = {
  /**
   * @param  {XMLCollection Object} texturesNode
   * @param  {Object} textures
   * @param  {MyScene} scene
   */
  parseTextures: (texturesNode, textures, scene) => {
    const childrenNodes = texturesNode.getElementsByTagName('texture');
    for (let i = 0; i < childrenNodes.length; i++) {
      const id = parserUtils.reader.getString(childrenNodes[i], 'id');
      const file = parserUtils.reader.getString(childrenNodes[i], 'file');
      if (!id || !file) {
        return 'no id or file defined for texture'
      }
      textures[id] = new CGFtexture(scene, file);
    }
    if (Object.keys(textures).length == 0) return 'No valid textures found!';
    return null;
  }
};
