/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface) {
    super();

    this.interface = myinterface;
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.currentView;
    this.securityView;
    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(1000/30); // 30 fps
    this.viewsList = [];
    this.viewsIDs = {};
    this.views = {};
    this.time = Date.now();

    //this.securityCameraTexture = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
    //this.securityCamera = new MySecurityCamera(this);

    this.auxBoardWhite = new MyAuxBoard(this, 10, "wt");
    this.auxBoardBlack = new MyAuxBoard(this, 10, "bl");
    this.boardState = [
      [
        "corner",
        "bl",
        "wt",
        "bl",
        "wt",
        "bl",
        "corner"
      ],
      [
        "wt",
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
        "bl"
      ],
      [
        "wt",
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
        "wt"
      ],
      [
        "bl",
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
        "bl"
      ],
      [
        "bl",
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
        "wt"
      ],
      [
        "wt",
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
        "bl"
      ],
      [
        "corner",
        "wt",
        "bl",
        "wt",
        "wt",
        "bl",
        "corner"
      ]
    ];
    this.board = new MyGameBoard(this, this.boardState);

    this.validCell = new MyValidCell(this);

    
    this.setPickEnabled(true);
    this.getMoves();
    this.possibleMoves = [];
  }

  async getMoves() {
    const wtResponse = await fetch('http://localhost:8001/move', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        board: this.boardState,
        player: 0
      })
    });

    const wtmovesJson = await wtResponse.json();
    this.wtMoves = wtmovesJson.move;

    const blResponse = await fetch('http://localhost:8001/move', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        board: this.boardState,
        player: 1
      })
    });

    const blmovesJson = await blResponse.json();
    this.blMoves = blmovesJson.move;
  }

  addViews(defaultCamera) {
    this.currentView = defaultCamera ? defaultCamera : Object.keys(this.views)[0];
    this.securityView = this.currentView;
    this.interface.gui
      .add(this, 'currentView', Object.keys(this.views))
      .name('Scene View')
      .onChange(this.onSelectedView.bind(this));
    this.interface.gui
      .add(this, 'securityView', Object.keys(this.views))
      .name('Security Camera')
      .onChange(this.onSelectedView.bind(this));
  }

  onSelectedView() {
    this.sceneCamera = this.views[this.currentView];
    //this.secondaryCamera = this.views[this.securityView];
    this.interface.setActiveCamera(this.sceneCamera);
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.sceneCamera = this.camera;
    //this.secondaryCamera = this.camera;
  }
  /**
   * Initializes the scene lights with the values read from the XML file.
   */
  initLights() {
    // Reads the lights from the scene graph.
    this.lightsState={};
    Object.keys(this.graph.lights).forEach((key, index) => {
      if (index < 8) { // Only eight lights allowed by WebGL.
        const light = this.graph.lights[key];

        const attenuation = light[6];
        this.lights[index].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
        this.lights[index].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
        this.lights[index].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
        this.lights[index].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
        if (attenuation.constant) this.lights[index].setConstantAttenuation(attenuation.constant);
        if (attenuation.linear) this.lights[index].setLinearAttenuation(attenuation.linear);
        if (attenuation.quadratic) this.lights[index].setQuadraticAttenuation(attenuation.quadratic);

        if (light[1] == 'spot') {
          this.lights[index].setSpotCutOff(light[8]);
          this.lights[index].setSpotExponent(light[9]);
          this.lights[index].setSpotDirection(light[10][0], light[10][1], light[10][2]);
        }

        this.lights[index].setVisible(true);
        if (light[0]) this.lights[index].enable();
        else this.lights[index].disable();

        this.lights[index].update();
        this.lightsState[key] = {
          isEnabled: light[0],
          lightIndex: index
        };
      }

    });

    this.addLightsToInterface();
  }

  addLightsToInterface(){
    Object.keys(this.lightsState).forEach(key => {
      this.interface.gui.add(this.lightsState[key], 'isEnabled').name(key);
    });
  }

  updateLights(){
    Object.keys(this.lightsState).forEach(key => {
      const currentLightState = this.lightsState[key];
      const currentLight = this.lights[currentLightState.lightIndex];
      if(currentLightState.isEnabled)
        currentLight.enable();
      else
        currentLight.disable();  
      currentLight.update();  
    })
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }
  /** Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(
      this.graph.background[0],
      this.graph.background[1],
      this.graph.background[2],
      this.graph.background[3]
    );

    this.setGlobalAmbientLight(
      this.graph.ambient[0],
      this.graph.ambient[1],
      this.graph.ambient[2],
      this.graph.ambient[3]
    );

    this.initLights();

    this.sceneInited = true;
  }

  update(currTime) {
    if(this.sceneInited){
      const currentInstant = currTime - this.time;
      this.graph.updateComponentAnimations(currentInstant);
    }
    //this.securityCamera.update(currTime);
  }

  checkKeys(eventCode) {
    if (eventCode == "KeyM") {
      this.graph.updateMaterial();
    }
  }

  /**
   * Displays the scene.
   */
  render(renderCamera) {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Change current camera used for render
    this.camera = renderCamera;

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();
    
    this.pushMatrix();
    this.axis.display();
    
    if (this.sceneInited) {
      // Draw axis
      this.updateLights(); 
      this.setDefaultAppearance();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();

      this.board.display();
      this.possibleMoves.forEach((move) => this.validCell.display(move));

      
      this.pushMatrix();
      this.translate(5, 0, 0);
      this.auxBoardWhite.display();
      
      this.popMatrix();

      this.pushMatrix();
      this.translate(-5, 0, 0);
      this.rotate(Math.PI, 0, 1, 0);
      this.auxBoardBlack.display();
      this.popMatrix();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }

  logPicking(){
    if (!this.pickMode && this.pickResults
      && this.pickResults.length > 0 && this.blMoves) {
      this.possibleMoves.splice(0, this.possibleMoves.length);  
      const validResults = this.pickResults.filter(result => result[0]);
      validResults.forEach(result => {
        const cell = result[0];
        const moves = cell.cell == "wt" ? this.wtMoves : this.blMoves;
        moves.filter(move => move[0] == cell.x && move[1] == cell.y).forEach((move) => 
          this.possibleMoves.push(
            {
              x: move[2], z: move[3],
              size_x: this.boardState[0].length - 2, size_z: this.boardState.length - 2
            }));
      });

      this.pickResults.splice(0, this.pickResults.length);
    }
  }

  display() {

    /*
    this.securityCameraTexture.attachToFrameBuffer();
    this.render(this.secondaryCamera);
    this.securityCameraTexture.detachFromFrameBuffer();
    */

    this.logPicking();
		this.clearPickRegistration();


    this.render(this.sceneCamera);

    /*
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.securityCamera.display(this.securityCameraTexture);    
    this.gl.enable(this.gl.DEPTH_TEST);
    */
  }
}
