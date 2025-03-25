//Aqui se declaran todas las variables
var PLAY = 1;
var END = 0;
//PLAY estaba declarado despues de gamestate, de la forma que funciuona p5
//no tiene valor play por lo tanto no funciona el juego
//ademas de que gamestate solo estaba declarado no tenia valor de = PLAY
var gamestate = PLAY;

var trex, trex_running, trex_choca;
var imagensuelo, suelo, sueloinvisible;
var nube, gruponubes, imagennube;
var obstaculo, grupoobstaculos, obs1, obs2, obs3, obs4, obs5, obs6;
var puntos;

var goimagen, restartimagen, gameover, restart;
var checksonido, diesonido, jumpsonido;

// es una funcion que nos ayuda usar archivos fuera de este
function preload() {
  trex_running = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trex_choca = loadAnimation("trex_collided.png");

  imagensuelo = loadImage("ground2.png");
  imagennube = loadImage("cloud.png");

  obs1 = loadImage("obstacle1.png");
  obs2 = loadImage("obstacle2.png");
  obs3 = loadImage("obstacle3.png");
  obs4 = loadImage("obstacle4.png");
  obs5 = loadImage("obstacle5.png");
  obs6 = loadImage("obstacle6.png");

  goimagen = loadImage("gameOver.png");
  restartimagen = loadImage("restart.png");

  checksonido = loadSound("checkPoint.mp3");
  diesonido = loadSound("die.mp3");
  jumpsonido = loadSound("jump.mp3");
}

// es la funcion donde creamos las cosas nuevas como los sprites
function setup() {
  createCanvas(600, 200);

  //crear limites del canvas
  edges = createEdgeSprites();

  //crear sprite del t-rex.
  trex = createSprite(50, 180, 20, 50);
  trex.addAnimation("corriendo", trex_running);
  trex.addAnimation("chocando", trex_choca);
  //cambiar tamaño y posicion al trex
  trex.scale = 0.5;
  trex.x = 50;

  //crear sprite para el suelo
  suelo = createSprite(200, 180, 400, 20);
  suelo.addImage("suelo", imagensuelo)
  suelo.x = suelo.width / 2;

  //haciendo suelo invisible para que el trex quede sobre la imagen de suelo
  sueloinvisible = createSprite(200, 190, 400, 20);
  sueloinvisible.visible = false;

  gameover = createSprite(300,100);
  gameover.addImage(goimagen);
  gameover.scale = 0.5

  restart = createSprite(300,140);
  restart.addImage(restartimagen);
  restart.scale = 0.5

  //Crear grupos de obstaculos y nubes
  gruponubes = new Group();
  grupoobstaculos = new Group();  
  
  //SIN EL COLLIDER el rex tiene el tama;o de la imagen y colisiona mal
  // para ver el hitbox
  trex.debug = true;
  //para cambiar la forma y el tamaño del hitbox
  trex.setCollider("circle",0,0,40)

  

  puntos = 0;
}

// la funcion draw nos dibuja las cosas creadas e imagenes en la pantalla
function draw() {
  background("white");
  text("puntacion: " + puntos, 500, 50);

  if (gamestate === PLAY) {
    gameover.visible = false;
    restart.visible = false;
    suelo.velocityX = -(4 + 3*puntos/100);
    puntos = puntos + Math.round(getFrameRate() / 60)

    if(puntos>0 && puntos%500 === 0){
      checksonido.play();
    }

    //hacer que el trex salte al presionar la barra de espacio
    if (keyDown("space") && trex.y >= 150) {
      trex.velocityY = -10;
      jumpsonido.play();
    }
    //creamos una gravedad ficcticia usando una velocidad hacia abajo
    trex.velocityY = trex.velocityY + 0.5;

    //hacemos infinito el suelo
    if (suelo.x < 0) {
      suelo.x = suelo.width / 2;
    }

    //mandamos a llamar la funcion para crear las nubes y los cactus
    crearNubes();
    crearobstaculos();

    //condicion para perder el juego
    if (grupoobstaculos.isTouching(trex)) {
      gamestate = END;
      diesonido.play();
    }

  }
  else if (gamestate === END) {
    gameover.visible = true;
    restart.visible = true;
    trex.changeAnimation("chocando", trex_choca);
    suelo.velocityX = 0;
    trex.velocityY = 0;
    gruponubes.setVelocityXEach(0);
    grupoobstaculos.setVelocityXEach(0);

    //si el juego acaba hacer los cactus y nubes inmortales
    gruponubes.setLifetimeEach(-1);
    grupoobstaculos.setLifetimeEach(-1);


  }



  //para evitar que el trex se caiga, colisionamos el trex contra el suelo invisible
  trex.collide(sueloinvisible);

  if(mousePressedOver(restart) && restart.visible===true){
    reset();
    console.log("Reiniciar el juego");

  }

  drawSprites();
}

function reset(){
  gamestate = PLAY;
  gameover.visible = false;
  restart.visible = false;

  grupoobstaculos.destroyEach();
  gruponubes.destroyEach();

  puntos = 0
  trex.changeAnimation("corriendo", trex_running)
  
}


//Al final del codigo van las funciones extras que el programador hace
function crearNubes() {
  if (frameCount % 60 === 0) {
    nube = createSprite(600, 100, 40, 10);
    nube.addImage(imagennube);
    nube.scale = 0.4;
    nube.y = Math.round(random(10, 60));
    nube.velocityX = -3;

    //asignar tiempo de vida a las nubes
    //la ecuacion de velocidad se escribe asi velocidad = distancia / el tiempo, 
    //para encontrar el tiempo usamos tiempo = distancia / velocidad
    // tiempo = 600 / 3 = 200
    nube.lifetime = 200;

    // ---------------------------------------------------
    //  -7 -6 -5 -4 -3 -2 -1  0 1 2 3 4 5 6 7 8 9 10 11 ...

    //ajustar la profundidad del trex para que las nubes esten detras de el
    nube.depth = trex.depth;
    trex.depth = trex.depth + 1;

    // agregamos todas las nubes a un grupo
    gruponubes.add(nube);
  }
}


function crearobstaculos() {
  if (frameCount % 60 === 0) {
    obstaculo = createSprite(600, 165, 10, 40);
    obstaculo.velocityX = -(6 + puntos/100);

    var rand = Math.round(random(1, 6))
    switch (rand) {
      case 1: obstaculo.addImage(obs1);
        break;
      case 2: obstaculo.addImage(obs2);
        break;
      case 3: obstaculo.addImage(obs3);
        break;
      case 4: obstaculo.addImage(obs4);
        break;
      case 5: obstaculo.addImage(obs5);
        break;
      case 6: obstaculo.addImage(obs6);
        break;
      default: break;
    }

    obstaculo.scale = 0.5;
    //lifetime de 250 a 300 para que se noten mas tiempo los obstaculos
    obstaculo.lifetime = 300;

    //agregar todos los cactus a un grupo
    grupoobstaculos.add(obstaculo);
  }
}