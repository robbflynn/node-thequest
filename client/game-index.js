_ = require("./vendor/underscore");

require("./vendor/TweenLite.min");
require("./vendor/plugins/CSSPlugin.min");
require("./vendor/easing/EasePack.min");

var Player = require("./views/Player3D");

var playersById = [];
var playersByUsername = [];

var totalPlayers = 0;

var Preloader = function() {
  this.total = 0;
  this.loaded = 0;

  var _self = this;
  
  this.complete = null;
  this.listen = function(fn) {
    _self.total ++; 
    
    return function() {
      _self.loaded ++;

      if (fn)
        fn.apply(null, arguments);

      if (_self.total == _self.loaded && _self.complete)
        _self.complete();
    }
  }
}

var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

var sounds = {
  enabled: true,
  trapped: new Audio("sounds/trap.wav"),
  start: new Audio("sounds/start.wav"),
  song1: new Audio("sounds/song1.wav"),
  win: [
    new Audio("sounds/yahoo1.wav"),
    new Audio("sounds/yahoo2.wav"),
    new Audio("sounds/yeahaw1.wav"),
    new Audio("sounds/yeahaw2.wav"),
    new Audio("sounds/yeahaw3.wav"),
    new Audio("sounds/yow.wav")
  ],
  lose: [
    new Audio("sounds/oooo.wav"),
    new Audio("sounds/ouch.wav")
  ]
}

sounds.song1.loop = true;

var webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

if (webgl) {
  var ww = window.innerWidth;
  var hh = window.innerHeight;

  var camera = new THREE.PerspectiveCamera(45, ww / hh, 0.1, 100000);
  camera.position.z = 2600;

  var scene = new THREE.Scene();
  scene.add( new THREE.AmbientLight( 0x3a4d55 ) );

  var light = new THREE.SpotLight( 0xffffff, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;
  light.intensity = 1.5;

  light.shadowCameraNear = 200;
  light.shadowCameraFar = camera.far;
  light.shadowCameraFov = 50;

  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;

  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  scene.add( light );


  var renderer = new THREE.WebGLRenderer( { antialias: true} );
  renderer.setSize(ww, hh);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;


  var gameContainer3d = new THREE.Object3D();

  var stageContainer3d = new THREE.Object3D();
  stageContainer3d.position.y = 0;
  stageContainer3d.position.z = -200;
  stageContainer3d.scale.x = 2.4;
  stageContainer3d.scale.y = 2.4;
  stageContainer3d.scale.z = 2.4;
  stageContainer3d.rotation.x = 45 * (Math.PI / 180);

  stageContainer3d.add(gameContainer3d);
  scene.add(stageContainer3d);

  var starLight = new THREE.PointLight( 0xfff58a, 3, 700 ); 
  starLight.position.x = -120; 
  starLight.position.y = 300; 
  starLight.position.z = -270; 
  gameContainer3d.add( starLight );

  var showmanMaterial;
  var showmanGeometry;

  var preloader = new Preloader();

  var light2 = new THREE.PointLight( 0xff6600, 1.5, 1000 ); 
  light2.position.y = 100; 
  light2.position.z = 30; 
  gameContainer3d.add( light2 );

  var world3d;

  var winText3D;
  var loseText3D;
  var paravan3D;

  var sprite1;
  var sprite2;
  var sprite3;
  var sprite4;
  var sprite5;

  var marker;
  var marker3D;

  var snowmans = [];

  var systems = [];
  var materials = [];
  var parameters;

  function initParticles() {
    var particles, geometry, i, h, color, sprite, size;
    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    geometry = new THREE.Geometry();

    for (var i = 0; i < 200; i ++ ) {

      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 3000 - 1500;
      vertex.y = Math.random() * 1500;
      vertex.z = Math.random() * 3000 - 1500;

      geometry.vertices.push( vertex );

    }

    parameters = [ [ [1.0, 0.2, 1.0], sprite2, 20 ],
             [ [0.95, 0.1, 1], sprite3, 15 ],
             [ [0.90, 0.05, 1], sprite1, 10 ],
             [ [0.85, 0, 0.8], sprite5, 8 ],
             [ [0.80, 0, 0.7], sprite4, 5 ],
             ];

    for ( i = 0; i < parameters.length; i ++ ) {

      color  = parameters[i][0];
      sprite = parameters[i][1];
      size   = parameters[i][2];

      materials[i] = new THREE.ParticleBasicMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
      materials[i].color.setHSV( color[0], color[1], color[2] );
      materials[i].opacity = 0;

      particles = new THREE.ParticleSystem( geometry, materials[i] );

      particles.rotation.x = Math.random() * 6;
      particles.rotation.y = Math.random() * 6;
      particles.rotation.z = Math.random() * 6;

      scene.add( particles );
      systems.push(particles);
    }

    var mats = [
          new THREE.MeshBasicMaterial( { map: marker, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthTest: true, transparent: true } )
        ];

    marker3D = THREE.SceneUtils.createMultiMaterialObject( new THREE.PlaneGeometry( 70, 70, 4, 4 ), mats );
    marker3D.position.set( 0, 10, 0 );
    marker3D.rotation.x = 90 * (Math.PI / 180);;
    marker3D.scale.set( 0.00001, 0.00001, 0.00001 );

    stageContainer3d.add( marker3D );
  }

  var renderParticles = function() {
    var time = Date.now() * 0.00005;

    for ( i = 0; i < systems.length; i ++ ) 
        systems[i].rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

    for ( i = 0; i < materials.length; i ++ ) {
      color = parameters[i][0];

      h = ( 360 * ( color[0] + time ) % 360 ) / 360;
      materials[i].color.setHSV( h, color[1], color[2] );

      if (materials[i].opacity < 1)
        materials[i].opacity += 0.02;
    }
  }

  // LOAD OBJETCTS

  var callbackWorld = function ( geometry, materials ) {
    world3d = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    world3d.position.y = 105;
    world3d.position.x = 0;
    world3d.castShadow = true;

    stageContainer3d.add( world3d );
  };

  var callbackWinText = function ( geometry, materials ) {
    winText3D = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    winText3D.scale.x = 10;
    winText3D.scale.y = 10;
    winText3D.scale.z = 10;
    winText3D.position.y = 1000;

    stageContainer3d.add( winText3D );
  };

  var callbackLoseText = function ( geometry, materials ) {
    loseText3D = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    loseText3D.scale.x = 10;
    loseText3D.scale.y = 10;
    loseText3D.scale.z = 10;
    loseText3D.position.y = 1000;

    stageContainer3d.add( loseText3D );
  };


  var callbackSnowman1 = function ( geometry, materials ) {
    showmanGeometry = geometry;
    showmanMaterial = materials;

    snowmans[0] = {
      geometry: geometry,
      materials: materials
    };
  };

  var callbackSnowman2 = function ( geometry, materials ) {
    snowmans[1] = {
      geometry: geometry,
      materials: materials
    };
  };

  var callbackSnowman3 = function ( geometry, materials ) {
    snowmans[2] = {
      geometry: geometry,
      materials: materials
    };
  };

  var callbackSnowman4 = function ( geometry, materials ) {
    snowmans[3] = {
      geometry: geometry,
      materials: materials
    };
  };

  var callbackSnowman5 = function ( geometry, materials ) {
    snowmans[4] = {
      geometry: geometry,
      materials: materials
    };
  };

  var callbackParavan = function ( geometry, materials ) {
    paravan3D = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    paravan3D.position.z = 1500;

    scene.add( paravan3D );
  };

  $(document).ready(function() {
    sprite1 = THREE.ImageUtils.loadTexture( "textures/snowflake1.png", null, preloader.listen());
    sprite2 = THREE.ImageUtils.loadTexture( "textures/snowflake2.png", null, preloader.listen());
    sprite3 = THREE.ImageUtils.loadTexture( "textures/snowflake3.png", null, preloader.listen());
    sprite4 = THREE.ImageUtils.loadTexture( "textures/snowflake4.png", null, preloader.listen());
    sprite5 = THREE.ImageUtils.loadTexture( "textures/snowflake5.png", null, preloader.listen());

    marker = THREE.ImageUtils.loadTexture( "textures/marker.png", null, preloader.listen());

    var loader = new THREE.JSONLoader();
    loader.load( "models/world.js", preloader.listen(callbackWorld), "textures");
    loader.load( "models/win-text.js", preloader.listen(callbackWinText), "textures");
    loader.load( "models/lose-text.js", preloader.listen(callbackLoseText), "textures");
    loader.load("models/snowman1.js", preloader.listen(callbackSnowman1), "textures");  
    loader.load("models/snowman2.js", preloader.listen(callbackSnowman2), "textures");  
    loader.load("models/snowman3.js", preloader.listen(callbackSnowman3), "textures");
    loader.load("models/snowman4.js", preloader.listen(callbackSnowman4), "textures");  
    loader.load("models/snowman5.js", preloader.listen(callbackSnowman5), "textures");  
    loader.load("models/paravan.js", preloader.listen(callbackParavan), "textures");
  });

  $(".gameWorld").append(renderer.domElement);

  var addOrUpdate = function(playerData){
    var player = playersById[playerData.playerId];
    if(!player) {
      var index = totalPlayers - parseInt(totalPlayers / snowmans.length) * snowmans.length;

      var g = snowmans[index].geometry;
      var m = snowmans[index].materials;
      
      player = new Player(playerData, gameContainer3d, g, m, light2, marker3D, sounds);

      totalPlayers ++;

      playersById[playerData.playerId] = player;
      playersByUsername[playerData.username] = player;

      gameContainer3d.add(player.model);
    } else {
      _.extend(player, playerData);
      player.render();
    }
  }

  var startGame =  function() {

    initParticles();

    var render = function() {
      requestAnimationFrame(render);

      renderParticles();
      renderer.render(scene, camera);
    }

    var onWindowResize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

    window.addEventListener( 'resize', onWindowResize, false );

    onWindowResize();
    render();

    camera.position.z = 1800;
    camera.rotation.x = 0.01;
    TweenLite.to(camera.position, 1, {z: 2600, delay: 0.2, ease: Cubic.easeInOut});
    TweenLite.to(camera.rotation, 1, {x: 0, delay: 0.2, ease: Cubic.easeInOut});

    TweenLite.to(paravan3D.scale, 1, {x: 600, y: 600, z: 600, delay: 0.2, ease: Cubic.easeInOut, onComplete: function() {

      var socket = io.connect(require("config").socketio);

      socket.on("registered", function(){
        socket.emit("addPlayer");  
      });

      socket.on("addPlayer", function(playerData){
        addOrUpdate(playerData);
      });

      socket.on("removePlayer", function(playerData){
        var p = playersById[playerData.playerId];

        totalPlayers --;

        delete(playersById[playerData.playerId]);
        delete(playersByUsername[playerData.username]);

        p.remove();
      });

      socket.on("updateGame", function (gameState) {
        $(".timeLeft").html("Time left:"+gameState.timeLeft);
        //expect playerStates to be an array
        for (var i = 0; i < gameState.players.length; i ++) {
          addOrUpdate(gameState.players[i]);
        }
      });

      socket.on("treasureTrapped", function(p1Data, p2Data){
        _.extend(playersById(p1Data.playerId), p1Data).render();
        if(p2Data)
          _.extend(playersById(p2Data.playerId), p2Data).render();
      })

      socket.on("endgame", function (victory) {
        console.log("-----endgame:", victory);
        if (victory) {
          if (sounds.enabled)
            sounds.win[rand(0,sounds.win.length)].play();

          TweenLite.to(winText3D.position, 1.5, {y: 10, ease: Bounce.easeOut});
        } else {
          if (sounds.enabled)
            sounds.lose[rand(0, sounds.lose.length)].play();

          TweenLite.to(loseText3D.position, 1.5, {y: 10, ease: Bounce.easeOut});
        }
          
        var player = playersByUsername[user.username]; //getPlayerByUsername(user.username);
        player.victories += victory ? 1 : 0;

        $(".victoriesCount").html(player.victories);
      })

      socket.on("restart", function(){
        TweenLite.to(winText3D.position, 1, {y: 1000, ease: Cubic.easeIn});
        TweenLite.to(loseText3D.position, 1, {y: 1000, ease: Cubic.easeIn});

        //sounds.start.play();

        for (var s in playersById)
          gameContainer3d.remove(playersById[s].model);

        totalPlayers = 0;

        playersById = [];
        playersByUsername = [];

        socket.emit("addPlayer");
      });

      var direction = function (e) {
        var dir = "";
        
        if(e.keyCode == 37)
          dir = "left"
        if(e.keyCode == 39)
          dir = "right";
        if(e.keyCode == 40)
          dir = "bottom";
        if(e.keyCode == 38)
          dir = "top";
        
        return dir;
      }

      $(window).on("keydown", function(e){
        e.preventDefault();
        socket.emit("directionChange", true, direction(e));
      });

      $(window).on("keyup", function(e){
        e.preventDefault();
        socket.emit("directionChange", false, direction(e));
      });

      $(".soundToggle").click(function(e){
        e.preventDefault();
        sounds.enabled = !sounds.enabled;
        if(sounds.enabled){
          sounds.song1.play();
          $(".soundToggle").text("Toggle sound off");
        } else {
          sounds.song1.pause();
          $(".soundToggle").text("Toggle sound on");
        }
      });
    }});

    TweenLite.to($(".title"), 1, {css:{opacity:1}, delay: 1.2});
    TweenLite.to($(".menu"), 1, {css:{opacity:1}, delay: 1.2});
  };

  var _self = this;

  preloader.complete = function() {
    TweenLite.to($(".landingImg"), 1, {css:{opacity:0}, delay: 1, onComplete: function() {
      $(".landingImg").hide();
      sounds.song1.play();
      startGame();    
    }});
  }

} else {
  $(".support").show();
  $(".loadingTxt").hide();
}