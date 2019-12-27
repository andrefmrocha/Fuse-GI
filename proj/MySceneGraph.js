'use strict';
var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
  /**
   * @constructor
   */

  constructor(ambientsNames, scene) {
    this.DEGREE_TO_RAD = Math.PI / 180;
    this.loadedOk = true;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null; // The id of the root element.
    this.materialSwitch = 0;

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // Store the name of all valid ambients
    this.ambients = {};
    this.ambientsNames = ambientsNames;
    this.selectedAmbient = 0;
    this.newAmbient = 0;
    this.ambientsNames.forEach((name, i) => this.ambients[i] = {});

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    parserUtils.reader.open('scenes/' + this.ambientsNames[this.selectedAmbient], this);
  }

  /*
    Change selected ambient and load it if needed
  */
  onSelectedAmbient() {
    if (Object.keys(this.ambients[this.newAmbient]).length == 0) {
      this.ambients[this.newAmbient] = {};
      parserUtils.reader.open('scenes/' + this.ambientsNames[this.newAmbient], this);
    }
    else {
      this.selectedAmbient = this.newAmbient;
    }
  }

  getAmbientName() { return this.ambientsNames[this.newAmbient]; }
  getIDRoot() { return this.ambients[this.newAmbient].idRoot; }
  getPrimitives() { return this.ambients[this.newAmbient].primitives; }
  getComponents() { return this.ambients[this.newAmbient].components; }
  getMaterials() { return this.ambients[this.newAmbient].materials; }
  getTextures() { return this.ambients[this.newAmbient].textures; }
  getTransformations() { return this.ambients[this.newAmbient].transformations; }
  getAnimations() { return this.ambients[this.newAmbient].animations; }
  getPerspectives() { return this.ambients[this.newAmbient].perspectives; }
  getLights() { return this.ambients[this.newAmbient].lights; }
  getBackground() { return this.ambients[this.newAmbient].background; }
  getGlobalAmbient() { return this.ambients[this.newAmbient].ambient; }

  /*
   * Callback to be executed after successful reading
   */
  onXMLReady() {
    this.log('XML Loading finished.');
    var rootElement = parserUtils.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseXMLFile(rootElement);
    if (error != null) {
      this.onXMLError(error);
      return;
    }
    
    let comps = this.getComponents();
    this.assignChildReferences(comps[this.getIDRoot()]);

    /* As the graph loaded ok, signal the scene so that any additional
     initialization depending on the graph can take place
    */
    let anims = this.getAnimations();
    Object.keys(anims).forEach((key) =>{
      anims[key].initialTime = 0; 
    });

    this.selectedAmbient = this.newAmbient;

    console.log("loaded");
    this.scene.onGraphLoaded();
  }

  /**
   * Parses the XML file, processing each block.
   * @param {XML root element} rootElement
   */
  parseXMLFile(rootElement) {
    if (rootElement.nodeName != 'lxs') return 'root tag <lxs> missing';

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
      nodeNames.push(nodes[i].nodeName);
    }

    this.scene.resetGUI();

    var error;

    // Processes each node, verifying errors.

    // <scene>
    var index;
    if ((index = nodeNames.indexOf('scene')) == -1) return 'tag <scene> missing';
    else {
      if (index != SCENE_INDEX) this.onXMLMinorError('tag <scene> out of order ' + index);

      //Parse scene block
      if ((error = this.parseScene(nodes[index])) != null) return error;
    }

    // <views>
    if ((index = nodeNames.indexOf('views')) == -1) return 'tag <views> missing';
    else {
      if (index != VIEWS_INDEX) this.onXMLMinorError('tag <views> out of order');

      //Parse views block
      if ((error = this.parseView(nodes[index])) != null) return error;
    }

    // <ambient>
    if ((index = nodeNames.indexOf('globals')) == -1) return 'tag <globals> missing';
    else {
      if (index != AMBIENT_INDEX) this.onXMLMinorError('tag <globals> out of order');

      //Parse ambient block
      if ((error = this.parseGlobals(nodes[index])) != null) return error;
    }

    // <lights>
    if ((index = nodeNames.indexOf('lights')) == -1) return 'tag <lights> missing';
    else {
      if (index != LIGHTS_INDEX) this.onXMLMinorError('tag <lights> out of order');

      //Parse lights block
      if ((error = this.parseLights(nodes[index])) != null) return error;
    }
    // <textures>
    if ((index = nodeNames.indexOf('textures')) == -1) return 'tag <textures> missing';
    else {
      if (index != TEXTURES_INDEX) this.onXMLMinorError('tag <textures> out of order');

      //Parse textures block
      this.ambients[this.newAmbient].textures = [];
      const texs = this.getTextures();
      if ((error = textureParser.parseTextures(nodes[index], texs, this.scene)) != null) return error;
    }

    // <materials>
    if ((index = nodeNames.indexOf('materials')) == -1) return 'tag <materials> missing';
    else {
      if (index != MATERIALS_INDEX) this.onXMLMinorError('tag <materials> out of order');

      //Parse materials block
      this.ambients[this.newAmbient].materials = [];
      const materials = this.getMaterials();
      if ((error = materialsParser.parseMaterials(nodes[index], materials, this)) != null) return error;
    }

    // <transformations>
    if ((index = nodeNames.indexOf('transformations')) == -1) return 'tag <transformations> missing';
    else {
      if (index != TRANSFORMATIONS_INDEX) this.onXMLMinorError('tag <transformations> out of order');

      //Parse transformations block
      this.ambients[this.newAmbient].transformations = [];
      const transforms = this.getTransformations();
      if ((error = transformationParser.parseTransformations(nodes[index], transforms, this)) != null)
        return error;
    }

    // <animations>
    if ((index = nodeNames.indexOf('animations')) == -1) return 'tag <animations> missing';
    else {
      if (index != ANIMATIONS_INDEX) this.onXMLMinorError('tag <animations> out of order');

      //Parse primitives block
      if ((error = animationsParser.parseAnimations(nodes[index], this)) != null) return error;
    
    }

    // <primitives>
    if ((index = nodeNames.indexOf('primitives')) == -1) return 'tag <primitives> missing';
    else {
      if (index != PRIMITIVES_INDEX) this.onXMLMinorError('tag <primitives> out of order');

      //Parse primitives block
      this.ambients[this.newAmbient].primitives = [];
      const prims = this.getPrimitives();
      if ((error = primitiveParsers.parsePrimitives(nodes[index], prims, this)) != null) return error;
    }

    // <components>
    if ((index = nodeNames.indexOf('components')) == -1) return 'tag <components> missing';
    else {
      if (index != COMPONENTS_INDEX) this.onXMLMinorError('tag <components> out of order');

      //Parse components block
      if ((error = componentParser.parseComponents(nodes[index], this)) != null) return error;
    }


    this.scene.addAmbients();
    this.log('all parsed');
  }

  /**
   * Parses the <scene> block.
   * @param {scene block element} sceneNode
   */
  parseScene(sceneNode) {
    // Get root of the scene.
    var root = parserUtils.reader.getString(sceneNode, 'root');
    if (!root) return 'no root defined for scene';

    this.ambients[this.newAmbient].idRoot = root;

    // Get axis length
    var axis_length = parserUtils.reader.getFloat(sceneNode, 'axis_length');
    if (axis_length == null) this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

    this.ambients[this.newAmbient].referenceLength = axis_length || 1;

    this.log('Parsed scene');

    return null;
  }

  /**
   * Parses the <views> block.
   * @param {view block element} viewsNode
   */
  parseView(viewsNode) {
    this.ambients[this.newAmbient].perspectives = {};
    viewsParser.parsePerspectiveViews(viewsNode.getElementsByTagName('perspective'), this);
    viewsParser.parseOrthoViews(viewsNode.getElementsByTagName('ortho'), this);

    const perspectives = this.getPerspectives();
    if (Object.keys(perspectives).length == 0) {
      return 'No perspectives found!';
    }

    this.scene.views = perspectives;

    const defaultCamera = parserUtils.reader.getString(viewsNode, 'default');
    if (!defaultCamera) this.onXMLError('default camera not specified');

    this.scene.addViews(defaultCamera);
    this.scene.onSelectedView();
    return null;
  }

  /**
   * Parses the <ambient> node.
   * @param {ambient block element} ambientsNode
   */
  parseGlobals(ambientsNode) {
    var children = ambientsNode.children;

    this.ambients[this.newAmbient].ambient = [];
    this.ambients[this.newAmbient].background = [];

    var nodeNames = [];

    for (var i = 0; i < children.length; i++) nodeNames.push(children[i].nodeName);

    var ambientIndex = nodeNames.indexOf('ambient');
    var backgroundIndex = nodeNames.indexOf('background');

    if (ambientIndex == -1 || backgroundIndex == -1) {
      this.onXMLError('Missing child on globals');
    }

    var color = parserUtils.parseColor(children[ambientIndex], 'ambient');
    if (!Array.isArray(color)) return color;
    else this.ambients[this.newAmbient].ambient = color;

    color = parserUtils.parseColor(children[backgroundIndex], 'background');
    if (!Array.isArray(color)) return color;
    else this.ambients[this.newAmbient].background = color;

    this.log('Parsed ambient');

    return null;
  }

  /**
   * Parses the <light> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {

    var children = lightsNode.children;

    this.ambients[this.newAmbient].lights = [];
    const lights = this.getLights();
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      // Storing light information
      var global = [];
      var attributeNames = [];
      var attributeTypes = [];

      //Check type of light
      if (children[i].nodeName != 'omni' && children[i].nodeName != 'spot') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      } else {
        attributeNames.push(...['location', 'ambient', 'diffuse', 'specular', 'attenuation']);
        attributeTypes.push(...['position', 'color', 'color', 'color', 'attenuation']);
      }

      // Get id of the current light.
      var lightId = parserUtils.reader.getString(children[i], 'id');
      if (lightId == null) return 'no ID defined for light';

      // Checks for repeated IDs.
      if (lights[lightId] != null) return 'ID must be unique for each light (conflict: ID = ' + lightId + ')';

      // Light enable/disable
      var aux = parserUtils.reader.getBoolean(children[i], 'enabled');
      if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
        this.onXMLMinorError(
          "unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'"
        );

      //Add enabled boolean and type name to light info
      global.push(aux ? aux : false);
      global.push(children[i].nodeName);

      grandChildren = children[i].children;
      // Specifications for the current light.

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      for (var j = 0; j < attributeNames.length; j++) {
        var attributeIndex = nodeNames.indexOf(attributeNames[j]);

        if (attributeIndex != -1) {
          if (attributeTypes[j] == 'position')
            var aux = parserUtils.parseCoordinates4D(grandChildren[attributeIndex], 'light position for ID' + lightId);
          else if (attributeTypes[j] == 'attenuation'){
            global.push(parserUtils.parseAttenuation(grandChildren[attributeIndex]));
          }
          else
            var aux = parserUtils.parseColor(
              grandChildren[attributeIndex],
              attributeNames[j] + ' illumination for ID' + lightId
            );

          if (!Array.isArray(aux)) return aux;

          global.push(aux);
        } else return 'light ' + attributeNames[j] + ' undefined for ID = ' + lightId;
      }

      // Gets the additional attributes of the spot light
      if (children[i].nodeName == 'spot') {
        var angle = parserUtils.reader.getFloat(children[i], 'angle');
        if (!(angle != null && !isNaN(angle))) return 'unable to parse angle of the light for ID = ' + lightId;

        var exponent = parserUtils.reader.getFloat(children[i], 'exponent');
        if (!(exponent != null && !isNaN(exponent))) return 'unable to parse exponent of the light for ID = ' + lightId;

        var targetIndex = nodeNames.indexOf('target');

        // Retrieves the light target.
        var targetLight = [];
        if (targetIndex != -1) {
          var aux = parserUtils.parseCoordinates3D(grandChildren[targetIndex], 'target light for ID ' + lightId);
          if (!Array.isArray(aux)) return aux;

          targetLight = aux;
        } else return 'light target undefined for ID = ' + lightId;

        global.push(...[angle, exponent, targetLight]);
      }

      lights[lightId] = global;
      numLights++;
    }

    if (numLights == 0) return 'at least one light must be defined';
    else if (numLights > 8) this.onXMLMinorError('too many lights defined; WebGL imposes a limit of 8 lights');
    
    this.log('Parsed lights');
    return null;
  }

  /*
   * Callback to be executed on any read error, showing an error on the console.
   * @param {string} message
   */
  onXMLError(message) {
    console.error('XML Loading Error: ' + message);
    this.loadedOk = false;
  }

  /**
   * Callback to be executed on any minor error, showing a warning on the console.
   * @param {string} message
   */
  onXMLMinorError(message) {
    console.warn('Warning: ' + message);
  }

  /**
   * Callback to be executed on any message.
   * @param {string} message
   */
  log(message) {
    console.log('   ' + message);
  }

  updateMaterial() {
    this.materialSwitch += 1;
  }


  /**
   * Displays the scene, processing each node, starting in the root node.
   */
  displayScene() {
    if(!this.loadedOk) return;

    const rootComp = this.ambients[this.selectedAmbient].components[this.ambients[this.selectedAmbient].idRoot];
    const rootMat = rootComp.materials[this.materialSwitch % rootComp.materials.length];
    this.displayComponent(rootComp, rootMat, null, 1, 1);
  }

  /**
   * @method assignChildReferences
   * Substitutes all references of a child ID by its corresponding object
   * Checks for loops in the graph
   * @param  {object} component - Reference to the component to apply method
   */
  assignChildReferences(component) {

    if(!component) {
      this.onXMLError("Null component reference");
      return;
    }

    if (component instanceof CGFobject) return;

    if (component.visited) {
      this.onXMLError("There is a loop in the graph");
      return;
    }
    
    component.visited = true;    
    component.children.forEach((child, index) => {

      if (typeof child === 'string') {
        const comps = this.getComponents();
        if(!comps[child]) this.onXMLError(`${child} not found`);
        component.children[index] = comps[child];
      }
      this.assignChildReferences(component.children[index]);
    });
    component.visited = false;
  }

  updateComponentAnimations(currentInstant){
    if(!this.loadedOk) return;

    const comps = this.ambients[this.selectedAmbient].components;
    Object.keys(comps).forEach((key) => {
      const component = comps[key];
      if(component.animation)
        component.animation.update(currentInstant);
    })
  }

  /**
   * @method displayComponent
   * Displays a component and all its children recursively
   * @param  {object} component - Reference to the component to display
   * @param  {object} pMaterial - Reference to the Material inherited from the Parent
   * @param  {object} pTexture - Referente to the Texture inherited from the Parent
   * @param  {number} pLengthS - Length_s inherited from the Parent
   * @param  {number} pLengthT - Length_t inherited from the Parent
   */
  displayComponent(component, pMaterial, pTexture, pLengthS, pLengthT) {

    if (!component) this.onXMLError("Tried to display null component");
    if (!pMaterial) this.onXMLError("Null material on component")

    // if primitive
    if (component instanceof CGFobject) {
      // materials and texture
      if (pMaterial) {
        let matCopy = Object.assign(Object.create(Object.getPrototypeOf(pMaterial)), pMaterial);
        if (pTexture) matCopy.setTexture(pTexture);
        if (component.updateTexCoords) component.updateTexCoords(pLengthS, pLengthT);
        matCopy.apply();
      }

      // display primitive
      component.display();
    } else {
      this.scene.pushMatrix();

      // multiply transformations
      this.scene.multMatrix(component.transformation);
      
      if(component.animation){
        component.animation.apply();
      }

      let cMaterial = component.materials[this.materialSwitch % component.materials.length];
      if (cMaterial == 'inherit') cMaterial = pMaterial;

      let cTextureObj = component.texture;
      let cTexture = cTextureObj.texture;
      let cLengthS = cTextureObj.lengthS;
      let cLengthT = cTextureObj.lengthT;

      if (cTexture == 'none') {
        cTexture = null;
      } else if (cTexture == 'inherit') {
        cTexture = pTexture;
        cLengthS = pLengthS;
        cLengthT = pLengthT;
      }

      component.children.forEach(child => {
        this.displayComponent(
          child,
          cMaterial,
          cTexture,
          cLengthS,
          cLengthT
        );
      });

      this.scene.popMatrix();
    }
  }
}
