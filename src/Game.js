/*jshint esversion: 6 */
/**
 * Game class
 * @class
 * @classdesc This game class initialises and runs the game.
 */
class Game {
  /**
   * @constructor
   * @desc simple game constructor
   */
  constructor() {
    // Create an Asset manager
    this.MyAssetManager = new AssetManager("ASSETS/jsonAssets.json");
    this.ScoreBoardTop = new ScoreboardManager();
    this.ScoreBoardTop.startTimer();
    this.ScoreBoardTop.initBoard("session");

    // Initialise Box2D World
    this.b2dWorld = b2dCreateWorld();

    // Mosue Stuff
    this.mouseX = 0;
    this.mouseY = 0;
    this.clicked = false;
    document.addEventListener("mousedown", this.onClick);
    document.addEventListener("mousemove", this.printMousePos);
    document.addEventListener("mouseup", this.onRelease);

    document.body.style.userSelect = 'none';

    this.canvasHeight = document.getElementById('canvas');
    this.inSand=false;
    this.menuHandler = new MenuHandler();

    var ws = new WebSocket("ws://149.153.106.148:8080/wstest");

    //called when the websocket is opened
    ws.onopen = function() {
      var message = {};
      message.type = "connect";
      message.data = "game";
      var mString = JSON.stringify(message);
      ws.send(mString);
    };

    //called when the client receives a message
    ws.onmessage = function (evt) {
      var obj = JSON.parse(evt.data);
      if(obj.type === "pause") {
        console.log("pause");
        if(gameNs.game.menuHandler.currentScene === "Game Scene") {
          gameNs.game.g.pauseDiv.style.display = "block";
          gameNs.game.menuHandler.currentScene = "Pause";
        }
        else {
          gameNs.game.g.pauseDiv.style.display = 'none';
          gameNs.game.menuHandler.currentScene = "Game Scene";
        }
      }
      else if((gameNs.game.player.getBody().GetLinearVelocity().x >= -3
      && gameNs.game.player.getBody().GetLinearVelocity().x <= 3)
      && (gameNs.game.player.getBody().GetLinearVelocity().y >= -3
      && gameNs.game.player.getBody().GetLinearVelocity().y <= 3)) {
        gameNs.game.playerShot(new b2Vec2(obj.x, obj.y));
      }
    };
  }

  /**
   * initialise the game world
   */
  initWorld() {
    let canvas = document.getElementById('canvas');
    document.body.style.padding = '0px, 0px, 0px, 0px';

    let div = document.createElement('div');
    div.id = 'main div';
    div.style.position = "relative";
    div.style.width = document.body.clientWidth + "px";
    div.style.height = document.body.scrollHeight + "px";
    div.appendChild(canvas);
    document.body.appendChild(div);


    gameNs.game.camera = new Camera(0,0, div.style.width, div.style.height);
    gameNs.game.camera.bounds = {
      x:0,
      y:0,
      w:1000000,
      h:1000000,
    };


    gameNs.game.g = new gameScene("Game Scene", div,
      {'x': 0, 'y': 0, 'width': 100, 'height': 100});


    this.menuHandler.addScene("Game Scene", gameNs.game.g);
    document.body.onresize = function(){
      console.log("resize");
      div.style.width = document.body.clientWidth + "px";
      div.style.height = document.body.scrollHeight + "px";
      gameNs.game.g.resizeCanvas();
    };
  }


  /**
  * updates the game
  */
  update() {
    // Sets up assets once they are loaded
    if (gameNs.game.MyAssetManager.isLoaded === true &&
        gameNs.game.MyAssetManager.isSetUp === false) {
      gameNs.game.setUp();
    }
    // Executed once everything is loaded
    if(gameNs.game.MyAssetManager.isSetUp === true &&
        gameNs.game.MyAssetManager.isLoaded === true) {

      let plyr = gameNs.game.player;

      // Terrain logic
      plyr.body.m_linearDamping = plyr.standardFriction;
      plyr.emitter.color = 'rgb(0,250,0)';
      gameNs.game.inSand = false;
      for (let i = 0; i < gameNs.game.terrainList.length; i++) {
        if (gameNs.game.terrainList[i].checkCollision(
            plyr.body.GetCenterPosition().x,
            plyr.body.GetCenterPosition().y,
            20
        )) {
          if (gameNs.game.terrainList[i].type === "Water") {
            plyr.body.SetCenterPosition(
                {
                  x: plyr.startPos.x,
                  y: plyr.startPos.y,
                },
                0
            );
            plyr.getBody().SetLinearVelocity(new b2Vec2(0, 0));
            plyr.shotNumber += 1;
            console.log("WATER!");
          } else {
            plyr.body.m_linearDamping = plyr.sandFriction;
            plyr.emitter.color = 'rgb(218,165,32)';
            gameNs.game.inSand = true;
          }
        }
      }

      if(gameNs.game.menuHandler.currentScene === "Game Scene") {
        gameNs.game.ScoreBoardTop.getDisplayTimer();
        gameNs.game.b2dWorld.Step(1.0 / 60.0, 1);
        gameNs.game.MyAssetManager.update();
        gameNs.game.levelHandler.update();

        plyr.update(window.innerWidth, window.innerHeight);
        gameNs.game.goal.update(window.innerWidth, window.innerHeight);

        if (gameNs.game.goal.collision(plyr.getBody().GetCenterPosition().x,
            plyr.getBody().GetCenterPosition().y, 20)) {

          gameNs.game.goal.emit = true;

          plyr.score += plyr.shotNumber - 4;
          gameNs.game.g.updateScoreText(plyr.score);
          plyr.shotNumber = 0;
          gameNs.game.g.updateShotText(plyr.shotNumber);
          console.log("Score: ", plyr.score);
          //hide ball off screen while particles emit
          gameNs.game.player.getBody().SetCenterPosition(new b2Vec2(-100, -100),
          gameNs.game.player.getBody().GetRotation());
          gameNs.game.player.getBody().SetLinearVelocity(new b2Vec2(0, 0));
          //gameNs.game.levelHandler.currentLevel.hideLevel();


        }
        if (gameNs.game.goal.emit === true) {
          gameNs.game.goal.particleTimer += 1;

          let xOff = Math.round(Math.random()) * 2 - 1;
          let yOff = Math.round(Math.random()) * 2 - 1;

          //gameNs.game.camera.pan(xOff*50,yOff*50);
          gameNs.game.camera.panSpeed.x = 15;
          gameNs.game.camera.panTo(1600,0);
          //gameNs.game.camera.zoomBy(0.1);
          if (gameNs.game.goal.particleTimer >= 60) {
            //gameNs.game.camera.zoomTo(1);
            gameNs.game.camera.panTo(0, 0);
            gameNs.game.goal.emit = false;
            gameNs.game.levelHandler.currentLevel.hideLevel();
            if(gameNs.game.levelHandler._currentLevelIndex + 1 > gameNs.game.levelHandler.levels.length - 1) {
              gameNs.game.ScoreBoardTop.addToBoard(gameNs.game.player.score);
              gameNs.game.ScoreBoardTop.filterScore(-1);

              console.log(gameNs.game.ScoreBoardTop.getBoard());
              var canv2 =  document.getElementById("boardcanvas");
              var ctx2 = canv2.getContext("2d");

              gameNs.game.leaderboard.drawLeaderboard(ctx2);
              gameNs.game.menuHandler.goToScene("Leaderboard");
              gameNs.game.levelHandler._currentLevelIndex = -1;
              gameNs.game.player.score = 0;
              gameNs.game.player.shotNumber = 0;
  
            }
            gameNs.game.levelHandler.goToLevel(
              gameNs.game.levelHandler._currentLevelIndex + 1);
            gameNs.game.player.getBody().SetCenterPosition(new b2Vec2(600, 200),
            gameNs.game.player.getBody().GetRotation());
            gameNs.game.levelHandler.currentLevel.loadLevel();

            gameNs.game.goal.particleTimer = 0;
          }
        }

        gameNs.game.camera.update();
      }
      gameNs.game.draw();
    }

    window.requestAnimationFrame(gameNs.game.update);
  }

  /**
   * draws the game
   */
  draw() {
    var canv = document.getElementById("canvas");
    var ctx = canv.getContext("2d");
    ctx.clearRect(0, 0, canv.width, canv.height);


    if(this.inSand === false){
      this.player.draw(ctx);
    }

    // Executed once everything is loaded
    if (this.MyAssetManager.isSetUp === true &&
          this.MyAssetManager.isLoaded === true) {
      this.MyAssetManager.draw();
    }

    if(this.inSand === true){
      this.player.draw(ctx);
    }


    if (this.clicked) {
      ctx.beginPath();
      ctx.moveTo(this.player.getBody().GetCenterPosition().x,
          this.player.getBody().GetCenterPosition().y);
      ctx.lineTo(this.mouseX, this.mouseY);
      ctx.stroke();
    }

    this.goal.draw(ctx);

    gameNs.game.camera.draw(canv,ctx);
    //drawWorld(this.b2dWorld, ctx);

  }

  /**
   * Game setUp function for when files are finished loading
   * @function setUp
   */
  setUp() {
    // Create Player
    this.player =
      new PlayerBall(this.b2dWorld, 216, 433, 20, this.MyAssetManager);
    this.goal = new Goal(1496,864,20);

    this.terrainList = [];

    // overall asset setup, can do this in each class for other object images
     this.music =
      this.MyAssetManager.find(this.MyAssetManager.SoundAssets, "music");
     this.music.loop = true;
     this.music.play();
    // confirm assets are setup
    this.levelHandler = new LevelHandler();
    this.levelHandler.addLevel(new Level("assets/level1.json"));
    this.levelHandler.addLevel(new Level("assets/level2.json"));
    this.levelHandler.addLevel(new Level("assets/level3.json"));
    this.levelHandler.currentLevel.loadLevel();
    this.initMenus();

    gameNs.game.MyAssetManager.isSetUp = true;
  }

  onClick() {
    var canvas = document.getElementById('canvas');
    if(!(gameNs.game.mouseX < 0
      || gameNs.game.mouseX > canvas.width
      || gameNs.game.mouseY <0
      || gameNs.game.mouseY>canvas.height))
    {
      if ((gameNs.game.player.getBody().GetLinearVelocity().x >= -3
      && gameNs.game.player.getBody().GetLinearVelocity().x <= 3)
      && (gameNs.game.player.getBody().GetLinearVelocity().y >= -3
      && gameNs.game.player.getBody().GetLinearVelocity().y <= 3)
      && gameNs.game.menuHandler.currentScene === "Game Scene") {
        gameNs.game.clicked = true;
        console.log("clicked");
      }
    }
  }

  onRelease() {
    if (gameNs.game.clicked &&
        gameNs.game.menuHandler.currentScene === "Game Scene") {
      console.log("release");
      gameNs.game.player.shotNumber += 1;
      gameNs.game.g.updateShotText(gameNs.game.player.shotNumber);
      console.log("Shot number: ",gameNs.game.player.shotNumber);
      var v =
        new b2Vec2(gameNs.game.player.getBody().GetCenterPosition().x -
        gameNs.game.mouseX, gameNs.game.player.getBody().GetCenterPosition().y -
        gameNs.game.mouseY);

      gameNs.game.player.startPos.x =
        gameNs.game.player.getBody().GetCenterPosition().x;
      gameNs.game.player.startPos.y =
        gameNs.game.player.getBody().GetCenterPosition().y;

      gameNs.game.playerShot(v);
      gameNs.game.clicked = false;
    }
  }

  playerShot(v) {
      if(v.x > 500){
        v.x = 500;
      } else if(v.x < -500) {
        v.x = -500;
      }
      if(v.y > 500){
        v.y = 500;
      } else if(v.y < -500) {
        v.y = -500;
      }
      gameNs.game.player.getBody().ApplyImpulse(new b2Vec2(v.x * 500, v.y * 500),
        gameNs.game.player.getBody().GetCenterPosition());
  }

  printMousePos(event) {
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();
    gameNs.game.mouseX =
      (event.clientX - rect.left)/ (rect.right - rect.left) * canvas.width;
    gameNs.game.mouseY =
      (event.clientY - rect.top)/ (rect.bottom - rect.top) * canvas.height;
  }


  initMenus() {
    let mainMenuScene = new Scene("Main Menu",
        document.getElementById("main div"),
        {'x': 0, 'y': 0, 'width': 100, 'height': 100},
        "#0f881e",
        "%");
    let mainMenu = new Menu("Main Menu",
        {'x': 0, 'y': 0, 'width': 100, 'height': 100},
        "%");
    mainMenu.colour = "#0f881e";
    mainMenuScene.alpha = "22";
    let image = document.createElement('img');
    image.style.left = "0%";
    image.style.top = "50%";
    image.style.width = "30%";
    image.style.height = "50%";
    image.src = "assets/golf-md.png";
    image.style.position = "absolute";
    mainMenu.containerDiv.appendChild(image);

    mainMenuScene.addMenu(mainMenu);
    let playBtn = new Button("Play", mainMenu.containerDiv,() => {
      gameNs.game.menuHandler.goToScene("Game Scene");
      //gameNs.game.ScoreBoardTop.startTimer();
      //gameNs.game.ScoreBoardTop.clearSessionStorage();
      //gameNs.game.ScoreBoardTop.clearLocalStorage();
      //gameNs.game.ScoreBoardTop.initBoard("session");
     },
        {'x': 40, 'y': 60, 'width': 20, 'height': 10},
        "%");
    playBtn._element.style.borderRadius = "10px";

    let leaderboardBtn = new Button("Leaderboard", mainMenu.containerDiv, () => { 
      var canv = document.createElement('canvas');
      var ctx = canv.getContext("2d");
      gameNs.game.menuHandler.goToScene("Leaderboard");
      gameNs.game.leaderboard.drawLeaderboard(ctx);
   },
        {'x': 40, 'y': 75, 'width': 20, 'height': 10},
        "%");
    leaderboardBtn._element.style.borderRadius = "10px";

    let title = document.createElement("h1");
    title.style.fontFamily = "Arial";
    title.innerText = "Team C Golfing";
    title.style.left = "10%";
    title.style.top = "30%";
    title.style.width = "80%";
    title.style.height = "20%";
    title.style.position = "absolute";
    title.style.textAlign = "center";
    title.style.fontSize = ((mainMenuScene.containerDiv.clientHeight / 100.0) * 8).toString() + "px";
    mainMenuScene.containerDiv.appendChild(title);

    this.menuHandler.addScene("Main Menu", mainMenuScene);

    let leaderboard = new leaderboardScene("Leaderboard",
        document.getElementById("main div"),
        {'x': 0, 'y': 0, 'width': 100, 'height': 100},
        "#7aacff");
    this.leaderboard = leaderboard;
    this.menuHandler.addScene("Leaderboard", this.leaderboard);

    this.menuHandler.currentScene = "Main Menu";
    this.menuHandler.showOnlyCurrentScene();
  }

}
