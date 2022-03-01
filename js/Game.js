class Game {
  constructor() {
    this.resetTittle = createElement ("h2");
    this.tableTittle = createElement ("h2");
    this.player1Table = createElement ("h2");
    this.player2Table = createElement ("h2");
    this.resetButton = createButton ("");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels = new Group ();
    powerCoins = new Group ();
    obstacles = new Group ();
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];
    this.addSprites (obstacles,obstaclesPositions.length,obstacle1Image,0.05,obstaclesPositions );
    this.addSprites (fuels,20,fuelimage,0.02);
    this.addSprites (powerCoins,20,coinsimage,0.09);
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTittle.html ("Reiniciar");
    this.resetTittle.class ("resetText");
    this.resetTittle.position (50,225);

    this.resetButton.class ("resetButton");
    this.resetButton.position (70,300);

    this.tableTittle.html ("Tabla de jugadores");
    this.tableTittle.class ("resetText");
    this.tableTittle.position (1220,225);

    this.player1Table.html ("Jugador #1");
    this.player1Table.class ("leadersText");
    this.player1Table.position (1255,275);

    this.player2Table.html ("Jugador #2");
    this.player2Table.class ("leadersText");
    this.player2Table.position (1255,295);
  }

  play() {
   this.handleElements ();
   Player.getPlayersInfo ();
   this.mouseButton ();
   player.getCarsAtEnd ();

   if (allPlayers !== undefined){
     image (track,0,-height * 5,width,height*6);
     this.showLife ();
     this.showLeaders ();

     var index = 0;
     for (var plr in allPlayers){
       index++;
       var x = allPlayers [plr].positionX;
       var y =height - allPlayers[plr].positionY;
       cars[index-1].position.x= x;
       cars [index-1].position.y= y;
       if (index === player.index ){
         this.catchFuel (index);
         this.catchCoin (index);
         stroke (10);
         fill ("red");
         ellipse (x,y,60,60);
        camera.position.x = width/2;
        camera.position.y = cars [index-1].position.y;
       }
      }
    this.running();
    const finishLine = height*6-100;
    if (player.positionY>finishLine){
      gameState = 2;
      player.rank ++;
      Player.updateCarsAtEnd (player.rank);
      player.update ();
      this.showRanking ();
    }
    drawSprites ();
   }

  }
  running (){
    if (keyIsDown(UP_ARROW)){
      player.positionY += 4;
      player.update ();
    }
    if (keyIsDown(LEFT_ARROW)){
      player.positionX -= 4;
      player.update ();
    }
    if (keyIsDown(RIGHT_ARROW)){
      player.positionX += 4;
      player.update ();
    }
    
  }
  showLeaders (){
    var leader1;
    var leader2;
    var players = Object.values (allPlayers);
    if (players [0].rank === 0 && players [1].rank === 0 || players [0].rank === 1){
      leader1 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader2 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }

    if (players [1].rank ===1){
      leader2 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader1 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }
    this.player1Table.html (leader1);
    this.player2Table.html (leader2);
  }

  mouseButton (){
    this.resetButton.mousePressed (()=>{
     database.ref ("/").set ({
       playerCount : 0,
       gameState : 0,
       carsAtEnd : 0,
       players : {},
     })
     window.location.reload ();
    })
  }
  
   addSprites (SpriteGroup,numberSprites,imageSprite,scale2,position = []){
     for (var i=0; i<numberSprites;i++){
       var x;
       var y;
       if (position.length>0){
         x = position [i].x;
         y = position [i].y;
         imageSprite = position [i].image;
       }
       else {
         x = random (width/2+150,width/2-150);
         y = random (-height*4.5, height-400);
       }

       var object = createSprite (x,y);
       object.addImage ("imagesObj",imageSprite);
       object.scale = scale2;
       SpriteGroup.add (object);

     }
   }

   catchFuel (index){
     cars [index-1].overlap(fuels,function (collector,collected){
       player.fuel = 185;
       collected.remove ();
     })
   }
   catchCoin (index){
     cars [index-1].overlap (powerCoins,function (collector,collected){
       player.score += 20;
       player.update ();
       collected.remove ();
     })
   }
   showRanking (){
     swal ({
       title: `Felicidades!!! ${"\n"} 
       Lugar ${"\n"}${
         player.rank 
       } `,
       text : "Fin de la carrera, Gracias!",
       confirmButtonText: "Yupii!",
     })
   }
   showLife (){
     push ();
     image (lifeImage,width/2-130,height-player.positionY-400,20,20);
     fill ("white");
     rect (width /2-100,height-player.positionY-400,185,20);
     fill ("#f50057");
     rect (width /2-100,height-player.positionY-400,player.life,20);
     noStroke ();
     pop ();
   }
}

