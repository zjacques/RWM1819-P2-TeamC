/**
 * Game class
 * @class
 * @classdesc This game class initialises and runs the game.
 */
class Game{
  /**
  * @constructor
  * @desc simple game constructor
  */
  constructor()
  {
    // Create an Asset manager
    //this.MyAssetManager = new AssetManager("ASSETS/jsonAssets.json");
    this.b2dWorld = b2dCreateWorld();
    this.body1 = b2dCreateBox(200, 200, 40, 40, this.b2dWorld, true);
    this.body2 = b2dCreateCircle(600, 200, 40, this.b2dWorld, true);
    this.body3 = b2dCreateBox(400, 400, 40, 40, this.b2dWorld, false);
  }

  /**
  * initialise the game world
  */
  initWorld()
  {
  }

  /**
   * Set up Box2D
   */
  setupBox2d()
  {

  }

  /**
  * updates the game
  */
  update()
  {
    // Sets up assets once they are loaded
    /*if(gameNs.game.MyAssetManager.isLoaded === true && gameNs.game.MyAssetManager.isSetUp === false)
    {
      gameNs.game.setUp();
    }*/
    console.log("Update");
    // Executed once everything is loaded
    //if(gameNs.game.MyAssetManager.isSetUp === true && gameNs.game.MyAssetManager.isLoaded === true)
    //{
      //gameNs.game.MyAssetManager.update();
      gameNs.game.draw();
    //}

    window.requestAnimationFrame(gameNs.game.update);
  }

  /**
  * draws the game
  */
  draw()
  {
    console.log("Draw");
    var canv = document.getElementById("canvas");
    var ctx = canv.getContext("2d");
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);

    // Executed once everything is loaded
    //if(this.MyAssetManager.isSetUp === true && this.MyAssetManager.isLoaded === true)
    //{
      //this.MyAssetManager.draw();
    //}
    drawWorld(this.b2dWorld, ctx);
  }

  /**
   * Game setUp function for when files are finished loading
   * @function setUp
   */
  setUp ()
  {
    // Declare sprites images && sounds here using...
     this.coin = this.MyAssetManager.find(this.MyAssetManager.ImageAssets, "coin");
     this.coin.setSpriteSheet(true, 5, 5);
     this.music = this.MyAssetManager.find(this.MyAssetManager.SoundAssets, "music");
     this.music.loop = true;
    // confirm assets are setup
    gameNs.game.MyAssetManager.isSetUp = true;
  }

}
