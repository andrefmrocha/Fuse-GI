let registerCounter = 1;


/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface, player1, player2) {
    super();

    this.interface = myinterface;
    this.player1 = player1;
    this.player2 = player2;
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.currentView;
    //this.securityView;
    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(1000 / 30); // 30 fps
    this.viewsList = [];
    this.viewsIDs = {};
    this.views = {};
    this.time = Date.now();

    //this.securityCameraTexture = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
    //this.securityCamera = new MySecurityCamera(this);
    this.gameOrchestrator = new MyGameOrchestrator(this, this.player1, this.player2);
    this.setPickEnabled(true);
  }

  resetGUI() {
    if (!this.sceneInited) return;

    this.interface.gui.remove(this.currentViewGUI);
    this.interface.gui.remove(this.ambientViewGUI);

    Object.keys(this.lightsGUI).forEach(k => {
      this.interface.gui.remove(this.lightsGUI[k]);
    });
    this.lightsGUI = {};
  }

  addViews(defaultCamera) {
    this.currentView = defaultCamera ? defaultCamera : Object.keys(this.views)[0];
    this.currentViewGUI = this.interface.gui
      .add(this, 'currentView', Object.keys(this.views))
      .name('Scene View')
      .onChange(this.onSelectedView.bind(this));
  }

  addAmbients() {
    this.ambientViewGUI = this.interface.gui
      .add(this.graph, 'newAmbient', Object.keys(this.graph.ambients))
      .name('Selected Ambient')
      .onChange(this.graph.onSelectedAmbient.bind(this.graph));
  }

  changeViewActivity(disabled) {
    const view = document.querySelector('.cr.string .c > select')
    view.disabled = disabled;
  }

  onSelectedView() {
    this.changeViewActivity(true);
    this.gameOrchestrator.cameraChange(this.currentTime, this.sceneCamera, this.views[this.currentView]);
    // this.sceneCamera = new CGFcamera(...Object.values(this.views[this.currentView]));
    // this.interface.setActiveCamera(new CG);
    //this.secondaryCamera = this.views[this.securityView];
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
    this.lightsState = {};

    Object.keys(this.lights).forEach(key => this.lights[key].visible = false);

    const lights = this.graph.ambients[this.graph.selectedAmbient].lights;
    Object.keys(lights).forEach((key, index) => {
      if (index < 8) { // Only eight lights allowed by WebGL.
        const light = lights[key];

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

  addLightsToInterface() {
    this.lightsGUI = {};
    Object.keys(this.lightsState).forEach((key, i) => {
      this.lightsGUI[i] = this.interface.gui.add(this.lightsState[key], 'isEnabled').name(key);
    });
  }

  updateLights() {
    Object.keys(this.lightsState).forEach(key => {
      const currentLightState = this.lightsState[key];
      const currentLight = this.lights[currentLightState.lightIndex];
      if (currentLightState.isEnabled)
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

    const background_color = this.graph.getBackground();
    const global_ambient = this.graph.getGlobalAmbient();
    this.gl.clearColor(
      background_color[0],
      background_color[1],
      background_color[2],
      background_color[3]
    );

    this.setGlobalAmbientLight(
      global_ambient[0],
      global_ambient[1],
      global_ambient[2],
      global_ambient[3]
    );

    this.initLights();

    this.sceneInited = true;
  }

  update(currTime) {
    this.currentTime = currTime;
    if (this.sceneInited) {
      const currentInstant = currTime - this.time;
      this.graph.updateComponentAnimations(currentInstant);
    }
    //this.securityCamera.update(currTime);

    this.gameOrchestrator.update(currTime);

  }

  addReplayButton() {
    this.interface.gui.add(this.gameOrchestrator, 'replayMoves').name('Replay Moves');
  }

  addResetButton() {
    this.interface.gui.add(this.gameOrchestrator, 'reset').name('Restart Game');
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
      this.gameOrchestrator.display();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }

  logPicking() {
    if (!this.pickMode && this.pickResults
      && this.pickResults.length > 0 && this.gameOrchestrator.playerMoves) {

      this.gameOrchestrator.possibleMoves.splice(0, this.gameOrchestrator.possibleMoves.length);
      const validResults = this.pickResults.filter(result => result[0]);
      validResults.forEach(result => {
        result[0](this);
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
    registerCounter = 1;


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
