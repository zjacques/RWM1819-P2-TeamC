'use strict';

// this.obSq = new ObstacleSquare(300, 300, this.b2dWorld, this.MyAssetManager);
// this.obRe = new ObstacleRect(700, 200, this.b2dWorld, this.MyAssetManager);
// this.obCi = new ObstacleCircle(500, 100, this.b2dWorld, this.MyAssetManager);
// this.obRo = new ObstacleRotor(100, 400, this.b2dWorld, this.MyAssetManager);


class Level {
  constructor(filepath) {
    this.filepath = filepath;
    this.obstacles = new Map();
    this.obstacles.set("squareObstacles", []);
    this.obstacles.set("rectangleObstacles", []);
    this.obstacles.set("circleObstacles", []);
    this.obstacles.set("rotatingObstacles", []);
    this.obstacles.set("boundaryObstacles", []);
    this.obstacles.set("terrains", []);
  }

  /**
   * Load the level data
   * @param _filepath {string} filepath to the json file
   */
  loadLevel() {
    let request = new XMLHttpRequest();
    request.addEventListener("load", function requestListener(level) {
      level.data = JSON.parse(this.responseText);

      gameNs.game.player.body.SetCenterPosition(
        {
          x: level.data.player.x,
          y: level.data.player.y,
        },
        0
      );

      gameNs.game.goal.posX = level.data.goal.x;
      gameNs.game.goal.posY = level.data.goal.y;

      Object.keys(level.data.obstacles).forEach((key) => {
       let list = level.obstacles.get(key);
       if (key === "terrains") {
         console.log("TERRAINS");
         level.data.obstacles[key].forEach((obs) => {
           console.log(obs);
           const newTerrain = new Terrain(
             obs.x,
             obs.y,
             obs.w,
             obs.h,
             obs.type,
             gameNs.game.MyAssetManager,
             obs.sprite);
           gameNs.game.terrainList.push(newTerrain);
           list.push(newTerrain);
         });
       } else if (key === "squareObstacles") {
         level.data.obstacles[key].forEach((obs) => {
           console.log(obs);
           list.push(new ObstacleSquare(obs.x, obs.y,
             obs.rotation,
             gameNs.game.b2dWorld,
             gameNs.game.MyAssetManager,
             obs.sprite));
         });
       } else if (key === "rectangleObstacles") {
         level.data.obstacles[key].forEach((obs) => {
           console.log(obs);
           list.push(new ObstacleRect(obs.x, obs.y,
               obs.rotation,
               gameNs.game.b2dWorld,
               gameNs.game.MyAssetManager,
               obs.sprite));
         });
       } else if (key === "circleObstacles") {
         level.data.obstacles[key].forEach((obs) => {
           console.log(obs);
           list.push(new ObstacleCircle(obs.x, obs.y,
               gameNs.game.b2dWorld,
               gameNs.game.MyAssetManager,
               obs.sprite));
         });
       } else if (key === "rotatingObstacles") {
         level.data.obstacles[key].forEach((obs) => {
           console.log(obs);
           list.push(new ObstacleRotor(obs.x, obs.y,
               gameNs.game.b2dWorld,
               gameNs.game.MyAssetManager,
               obs.sprite));
         });
       } else if (key === "boundaryObstacles") {
        level.data.obstacles[key].forEach((obs) => {
          console.log(obs);
          list.push(new BoundaryRect(obs.x, obs.y,
            obs.vertical,
            gameNs.game.b2dWorld,
            gameNs.game.MyAssetManager,
            obs.sprite));
        });
       }
     });
     level.showLevel();
    }.bind(request, this));
    request.open("GET", this.filepath);
    request.send();
  }

  hideLevel() {
    this.obstacles.forEach((obsArray) => {
      obsArray.forEach((obs) => {
        obs.image.setActive(false);
        if(obs.getBody !== undefined) {
          gameNs.game.b2dWorld.DestroyBody(obs.getBody());
        } else{
          gameNs.game.terrainList.clear();
        }
      });
    });
  }

  showLevel() {
    this.obstacles.forEach((obsArray) => {
      obsArray.forEach((obs) => {
        obs.image.setActive(true);
      });
    });
  }

  update() {
    this.obstacles.get("rotatingObstacles").forEach((obs) => {
      obs.updateSprite();
    });
  }
}
