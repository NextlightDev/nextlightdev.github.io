/*
  Bonne Fete Sofiya Sketch
  Version 1.0
  By Eduard Anton / AKA. NextLight
  Programmed with javascript based p5.js
  Creation Date: 01/09/2019
*/

//Custom variables
let colorIndex = 0;
let colorTick = 0.2;
let gravityVal = 3;
let sparkSize = 8;
let sparkCount = 25;
let multiplier = 180;
//Other important variables may not be here

//Other variables (don't modify)
let fireworks = [];
let flares = [];
let balloons = [];
let gravity;
let forwardColorLoop = true;
let sqSize;
let rdmFireworks = false;
let rdmBalloons = false;
let clickForFireworks = false;
let currentScene = 0;
let presentShake = false;
let shakeCount = 0;
let whiteTransition = 0;
let xOff = 0;
let zOff = 0;
//Sounds, images and fonts
let fw_exs = [];
let presentImage;
let balloonImage;
let popNoise;
let customFont;
let mesh;
let song;
let messageImage;

function  preload() {
  soundFormats('mp3', 'ogg');
  fw_exs.push(loadSound('assets/fw_explosion1.mp3'));
  fw_exs.push(loadSound('assets/fw_explosion2.mp3'));
  fw_exs.push(loadSound('assets/fw_explosion3.mp3'));
  customFont = loadFont('assets/qarmic.ttf');
  presentImage = loadImage('assets/present.png');
  balloonImage = loadImage('assets/balloon.png');
  messageImage = loadImage('assets/lettre.png');
  popNoise = loadSound('assets/popnoise.mp3');
  song = loadSound('assets/music.mp3');
}

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL); //Size of device's display
  fullscreen(true);
  frameRate(30);
  gravity = createVector(0, gravityVal);
  sqSize = sqrt(width * height);
  let originMesh = createVector(0, -520, 0);
  let sizeMesh = createVector(1800, 0, 600);
  let divCountMesh = createVector(15, 15);
  mesh = new landMesh(originMesh, sizeMesh, divCountMesh);
}

function draw() {
  updateBackground();
  //background(0); //Black background test
  
  if (currentScene == 1) {
     displayLetter();
  }
  
  for (let balloon of balloons) { //Update & draw balloons
    balloon.update();
    balloon.display();
    if (mousePressed) {
      let mouse = createVector(mouseX-width/2, mouseY-height/2);
      let mag = p5.Vector.sub(mouse, balloon.position).mag();
      if (mag <= 30) {
        popNoise.play();
        popNoise.setVolume(0.4);
        balloon.dead = true;
      }
    }
  }
  
  for (let firework of fireworks) { //Update & draw fireworks
    firework.update();
    firework.display();
  }
  
  for (let flare of flares) { //Update & draw flares for fireworks
    flare.updateAndDisplay();
  }
  
  
  let rdm = random(1);
  if (rdm <= 0.05 && rdmFireworks) { //5% chance of firework each tick on random point of screen
    let pos = [random(width) - width/2, random(height) - height/2];
    for (let f = 0; f < sparkCount; f++) {
    fireworks.push(new firework(pos[0], pos[1]));
    }
    flares.push(new flare(pos[0], pos[1]));
    playFireworkSoundEffect();
  }
  let rdm2 = random(1);
   if (rdm <= 0.015 && rdmBalloons) {
     balloons.push(new balloon());
   }
  
  switch(currentScene) { //Tick update for scenes
    case 0: //Click on present scene
      rdmFireworks = false;
      clickForFireworks = false;
      let size = (0.01 * width)*cos(TWO_PI/0.8*(millis()/1000)) + (0.20 * width);
      if (clickInZone(0, 0, size, size)) { //Clicked on present
        presentShake = true;
        shakeCount++;
      }
      presentShakeImg();
      presentShake = false;
      if (shakeCount >= 50 && whiteTransition <= 255) { //White transition
         colorMode(RGB);
         whiteTransition += 5;
         fill(255, whiteTransition);
         noStroke();
         rect(0 - width/2, 0 - height/2, 2 * width, 2 * height);
      }
      if (whiteTransition >= 255) {
        song.play();
        song.setVolume(0.4);
        currentScene++;
      }
    break;
    case 1: //Birthday card scene
      rdmFireworks = true;
      clickForFireworks = true;
      rdmBalloons = true;
      mesh.update();
      mesh.display();
      if (whiteTransition >= 0) {
         colorMode(RGB);
         whiteTransition -= 5;
         fill(255, whiteTransition);
         noStroke();
         rect(0 - width/2,0 - height/2, 2 * width, 2 * height);
      }
    break;
  }
}

function mousePressed() {
  if (clickForFireworks) { //Check if allowed to summon fireworks{
    for (let f = 0; f < sparkCount; f++) {
      fireworks.push(new firework(mouseX - width/2, mouseY - height/2));
    }
    flares.push(new flare(mouseX - width/2, mouseY - height/2));
    playFireworkSoundEffect();
  }
  
  switch(currentScene) { //Mouse click for scenes
    case 0: //Click on present scene
      //Nothing
    break;
    case 1: //Birthday card scene
        //Nothing
    break;
  }
}

function playFireworkSoundEffect() { //Play random firework sound if called
    let rdm = round(random(0, fw_exs.length - 1));
    fw_exs[rdm].play();
    fw_exs[rdm].setVolume(0.4);
  }

function updateBackground() { //Cycle background color
  colorMode(HSB, 100);
  background(colorIndex, colorIndex, 100); //Set background color
  if (colorIndex >= 100) { //Switch 'direction' of the cycle
    forwardColorLoop = false;
  } else if (colorIndex <= 0) {
    forwardColorLoop = true;
  }
  if (forwardColorLoop) { //Update color
    colorIndex+=colorTick;
  } else {
    colorIndex-=colorTick;
  }
}

function firework(x, y) { //Firework object class
  //Variables
  this.position = createVector(x, y);
  this.color = [random(255), random(255), random(255)];
  this.velocity = p5.Vector.fromAngle(random(TWO_PI), random(1, 3));
  this.bornTime = millis()/1000;
  this.lifeSpan = random(0.5, 1.5);
  this.lastTime = this.bornTime;
  
  this.update = function() { //Update method
    this.velocity.add(p5.Vector.mult(gravity, millis()/1000 - this.lastTime)); //Update velocity
    if (millis()/1000 - this.bornTime >= this.lifeSpan) { //Check if dead
      let index = fireworks.indexOf(this);
      fireworks.splice(index, 1);
    }
    this.position.add(this.velocity); //Update position
    this.lastTime = millis()/1000;
  };
  
  this.display = function() { //Draw method
    colorMode(RGB);
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], map(millis()/1000 - this.bornTime, 0, this.lifeSpan, 255, 0));
    ellipse(this.position.x, this.position.y, sparkSize);
  };
}

function flare(x, y) { //Explosion flare
  //Variables
  this.position = createVector(x, y);
  this.color = [random(255), random(255), random(255)];
  this.bornTime = millis()/1000;
  this.lifeSpan = 0.4;
  this.radius = random(80, 150);
  this.brightness = 15;
  
  this.updateAndDisplay = function() { //Update and display method
    colorMode(RGB);
    let elapsedTime = millis()/1000 - this.bornTime;
    if (elapsedTime <= this.lifeSpan) { //Flare alive or dead
      //Calculate flare circle
      let genAlpha = map(elapsedTime, 0, this.lifeSpan, 1.0, 0);
      for (let r = this.radius; r > 0; --r) {
          let alpha = map(r, this.radius, 0, 0, genAlpha * this.brightness);
            fill(this.color[0], this.color[1], this.color[2], alpha);
            ellipse(this.position.x, this.position.y, r);
      }
    } else {
      let index = flares.indexOf(this);
      flares.splice(index, 1);
    }
  };
}

function presentShakeImg() { //Draw present
  textFont(customFont);
  textSize(0.025 * sqSize);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Click sur ton cadeau!", 0, 0 - 0.2 * sqSize);
  imageMode(CENTER);
  if (!presentShake) {
  let size = (0.01 * sqSize)*cos(TWO_PI/0.8*(millis()/1000)) + (0.20 * sqSize); //Size evolution over time
  image(presentImage, 0, 0, size, size);
  } else { //Shake effect 
    push();
    rotate(TWO_PI/12*sin(TWO_PI/0.5*(millis()/1000)));
    image(presentImage, 0, 0, 0.25 * sqSize, 0.25 * sqSize);
    pop();
  }
}

function balloon() {
  this.position = createVector(random(0 - width/2, width/2), height/2 + 50);
  colorMode(RGB);
  this.color = [random(255), random(255), random(255)];
  this.velocity = createVector(0, random(-2, -15));
  this.dead = false;
  
  this.update = function() {
    this.position.add(this.velocity);
    if (this.position.y < 0 - height/2 - 80 || this.dead == true) {
      let index = balloons.indexOf(this);
      balloons.splice(index, 1);
    }
  }
  
  this.display = function() {
    push();
    translate(this.position.x, this.position.y);
    rotate(TWO_PI/55*sin(TWO_PI/1.5*(millis()/1000)));
    imageMode(CENTER);
    tint(this.color[0], this.color[1], this.color[2], 255);
    image(balloonImage, 0, 0, 0.1 * sqSize, 0.15 * sqSize);
    pop();
  }
}

function clickInZone(x, y, w, h) { //Verify if click is in a certain area
  let xM = mouseX - width/2;
  let yM = mouseY - height/2;
  if (xM <= x + w/2 && xM >= x - w/2 && yM >= y - h/2 && yM <= y + h/2) return true;
}

function displayLetter() {
  colorMode(RGB);
  rectMode(CENTER, CENTER);
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(0, 0, sqSize * 0.35, sqSize * 0.45, 20, 20);
  imageMode(CENTER);
  image(messageImage, 0, 0, sqSize * 0.32, sqSize * 0.42);
}

class landMesh {
  constructor(o, s, d) {
    this.origin = o;
    this.size = s;
    this.divCount = d;
    this.strokeColor = 0;
    this.fillColor = 0;
    this.move = 0;
    this.moveMax = 300;
    this.init();
  }
  
  init() {
    this.points = [];
    let xOffCenter = this.size.x / 2;
    let zOffCenter = this.size.z / 2;
    for (let x = 0; x < this.divCount.x + 1; x++) {
      this.points[x] = [];
      for (let z = 0; z < this.divCount.y + 1; z++) {
        this.points[x][z] = createVector(this.origin.x + x * (this.size.x/this.divCount.x) ,this.origin.y + this.size.y, this.origin.z + z * (this.size.z/this.divCount.y));
        this.points[x][z].x -= xOffCenter;
        this.points[x][z].z -= zOffCenter;
      }
    }
  }
  
  update() {
    for (let x = 0; x < this.divCount.x + 1; x++) {
       for (let z = 0; z < this.divCount.y + 1; z++) {
         let point = this.points[x][z];
         point.y = this.origin.y + this.size.y - noise(x+xOff, z+zOff)*multiplier + this.move;
       }
    }
    xOff += 0.01;
    zOff += 0.01;
    if (this.move < this.moveMax) {
      this.move += this.moveMax / 60;
    } 
     else {
       this.move = 300;
     }
  }
  
  display() {
    colorMode(HSB);
    fill(colorIndex, colorIndex, 100);
    colorMode(RGB);
    stroke(this.strokeColor);
    strokeWeight(2)
    push();
    //rotateY(millis()/2000);
      for (let z = 0; z < this.divCount.y; z++) {
        beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < this.divCount.x + 1; x++) {
          let p1 = this.points[x][z];
          let p2 = this.points[x][z + 1];
          vertex(p1.x, p1.y, p1.z);
          vertex(p2.x, p2.y, p2.z);
        }
        endShape();
      } 
    pop();
  }
}