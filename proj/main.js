/* eslint-disable max-len */
//From https://github.com/EvanHahn/ScriptInclude
include = function() {
  function f() {
    var a = this.readyState;
    (!a || /ded|te/.test(a)) && (c--, !c && e && d());
  }
  var a = arguments,
    b = document,
    c = a.length,
    d = a[c - 1],
    e = d.call;
  e && c--;
  for (var g, h = 0; c > h; h++)
    (g = b.createElement('script')),
      (g.src = arguments[h]),
      (g.async = !0),
      (g.onload = g.onerror = g.onreadystatechange = f),
      (b.head || b.getElementsByTagName('head')[0]).appendChild(g);
};
serialInclude = function(a) {
  var b = console,
    c = serialInclude.l;
  if (a.length > 0) c.splice(0, 0, a);
  else b.log('Done!');
  if (c.length > 0) {
    if (c[0].length > 1) {
      var d = c[0].splice(0, 1);
      b.log('Loading ' + d + '...');
      include(d, function() {
        serialInclude([]);
      });
    } else {
      var e = c[0][0];
      c.splice(0, 1);
      e.call();
    }
  } else b.log('Finished.');
};
serialInclude.l = new Array();

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return vars;
}
//Include additional files here
serialInclude([
  '../lib/CGF.js',
  'XMLscene.js',
  'MySceneGraph.js',
  'MyInterface.js',
  'primitives/MyRectangle.js',
  'primitives/MyCylinder.js',
  'primitives/MyBasedCylinder.js',
  'primitives/MySphere.js',
  'primitives/MyTriangle.js',
  'primitives/MyTorus.js',
  'primitives/MyPlane.js',
  'primitives/MyPatch.js',
  'primitives/MyCylinder2.js',
  'primitives/MyBoardCell.js',
  'primitives/MyGameBoard.js',
  'primitives/MyAuxBoard.js',
  'primitives/MyValidCell.js',
  'primitives/MyPlayerPiece.js',
  'parser/PrimitivesParser.js',
  'parser/ViewsParser.js',
  'parser/TextureParser.js',
  'parser/MaterialsParser.js',
  'parser/TransformationParser.js',
  'parser/ComponentParser.js',
  'parser/ParserUtils.js',
  'parser/AnimationsParser.js',
  'animation/Animation.js',
  'animation/KeyframeAnimation.js',
  'MyGameOrchestrator.js',
  'MyScoreBoard.js',
  'cgfobjreader/CGFOBJModel.js',
  'cgfobjreader/CGFResourceReader.js',
  'MyAnimation.js',

  (main = function() {

    const ambients = {
      'Space': 'space.xml',
      'Zelda': 'T6_G05.xml',
      'Mario World': 'T6_G07.xml',
      'Demo': 'demo.xml'
    };

    const scene = document.querySelector('#scenes');

    Object.keys(ambients).forEach(key => {
      const option = document.createElement('option');
      option.textContent = key;

      scene.appendChild(option);
    });
    scene.value = Object.keys(ambients)[0];
    let selected = Object.keys(ambients)[0];

    scene.addEventListener('change', () => {
      selected = scene.value;
    });

    
 
    document.querySelectorAll('#menu > article').forEach((player) => addDropdown(player));
    document.querySelector('#menu > div > input').addEventListener('click', () => {
      let error = false;
      const values = ['player-1', 'player-2'].map((player) => {
        const playerArticle = document.querySelector(`#${player}`);
        const playerType = playerArticle.querySelector('input[value="human"]').checked ? "human" 
        : playerArticle.querySelector('input[value="robot"]').checked ? "robot": null;
        if(!playerType){
          error = true;
          return null;
        }else if(playerType == "robot"){
          return {
            type: playerType,
            difficulty: Number(playerArticle.querySelector('select').value)
          }
        }
        return {
          type: playerType
        }
      });

      if(!error && selected){
        document.querySelector('.wrapper').style.display = "none";
        document.querySelector('#panel').style.display = "block";
        startGame(values[0], values[1], ambients, selected);
        console.log('Meiaaaaas');
      }
    });
  })
]);


function startGame(player1, player2, ambients, selected){
  // Standard application, scene and interface setup
  
  const app = new CGFapplication(document.body);
  const myInterface = new MyInterface();
  const myScene = new XMLscene(myInterface, player1, player2);

  app.init();
  
  app.setScene(myScene);
  app.setInterface(myInterface);
  myInterface.setActiveCamera(myScene.camera);

  // create and load graph, and associate it to scene.
  // Check console for loading errors
  const myGraph = new MySceneGraph(ambients, myScene, selected);

  app.run();
}

function addDropdown(player){

  player.querySelector('input[value="robot"]').addEventListener('change', () => {
    player.querySelector('select').style.display="block";
  });

  player.querySelector('input[value="human"]').addEventListener('change', () => {
    player.querySelector('select').style.display="none";
  });
}
