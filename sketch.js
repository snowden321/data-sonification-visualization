let song; // Variable to hold the music file
let amplitude; // Amplitude object for analyzing audio
let fft; // FFT object for analyzing frequency spectrum
let splashPage = true; // Flag to indicate if splash page is shown
let splash; // Splash page object
let shapes = []; // Array to hold 3D shapes
let backgroundColor; // Background color
let fadeInTime = 5; // Time to fade in/out the shapes in seconds
let fadeTimer = 0; // Timer for fading in/out
let fadeIn = false; // Flag to indicate if shapes are fading in
let helixTimer = 0; // Timer for displaying helix
let helixDuration = 5; // Duration of helix display in seconds
let helixVisible = false; // Flag to indicate if helix is visible
let helixColor; // Color of the helix

function preload() {
  song = loadSound('Mjhanks - Parachute Remix.mp3'); // Load your music file
}

function setup() {
  createCanvas(500, 500, WEBGL); // Create a WebGL canvas
  backgroundColor = color(random(255), random(255), random(255)); // Initial background color

  // Initialize amplitude object
  amplitude = new p5.Amplitude();

  // Initialize FFT object
  fft = new p5.FFT();

  // Create 3D shapes
  for (let i = 0; i < 20; i++) {
    let shapeType = int(random(2)); // 0: sphere, 1: cone
    let x = random(width);
    let y = random(height);
    let z = random(-400, 400);
    shapes.push(createShape(shapeType, x, y, z));
  }

  song.play(); // Start playing the music
}

function draw() {
  // Change background color every 10 seconds
  if (frameCount % (60 * 10) == 0) {
    backgroundColor = color(random(255), random(255), random(255));
  }
  background(backgroundColor);

  // Analyze the amplitude and frequency spectrum of the music
  let vol = amplitude.getLevel();
  let spectrum = fft.analyze();

  // Adjust the size and position of the shapes based on the frequency spectrum
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].update(vol, spectrum);
    shapes[i].display();
  }

  // Fade in/out the shapes
  if (fadeIn) {
    fadeTimer += deltaTime / 1000; // Convert milliseconds to seconds
    if (fadeTimer >= fadeInTime) {
      fadeIn = false;
    }
  } else {
    fadeTimer -= deltaTime / 1000; // Convert milliseconds to seconds
    if (fadeTimer <= 0) {
      fadeIn = true;
    }
  }

  // Display helix when bass frequencies are detected
  let bass = fft.getEnergy("bass");
  if (bass > 150) { // Adjust threshold as needed
    helixVisible = true;
    helixTimer = millis();
    helixColor = color(random(255), random(255), random(255)); // Random color for the helix
  }

  if (helixVisible && millis() - helixTimer < helixDuration * 1000) {
    displayHelix();
  } else {
    helixVisible = false;
  }
}

// Shape factory function
function createShape(type, x, y, z) {
  switch (type) {
    case 0:
      return new Sphere(x, y, z);
    case 1:
      return new Cone(x, y, z);
  }
}

// Shape classes
class Shape {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = 100;
    this.fadeSpeed = 255 / fadeInTime; // Speed of fading in/out
    this.fadeColor = color(random(255), random(255), random(255)); // Random color for fading
    this.alpha = 0; // Initial alpha value
    this.angleX = random(TWO_PI);
    this.angleY = random(TWO_PI);
    this.angleZ = random(TWO_PI);
    this.angleSpeed = random(-0.05, 0.05);
  }

  update(vol, spectrum) {
    // Abstract update method to be overridden by subclasses
  }

  display() {
    // Abstract display method to be overridden by subclasses
  }
}

class Sphere extends Shape {
  constructor(x, y, z) {
    super(x, y, z);
  }

  update(vol, spectrum) {
    let freqIndex = int(map(this.x, 0, width, 0, spectrum.length - 1));
    let freqValue = spectrum[freqIndex];
    this.size = map(freqValue, 0, 255, 50, 200);
    this.alpha = fadeIn ? min(this.alpha + this.fadeSpeed * deltaTime / 1000, 255) : max(this.alpha - this.fadeSpeed * deltaTime / 1000, 0);

    // Move around
    this.angleX += this.angleSpeed;
    this.angleY += this.angleSpeed;
    this.angleZ += this.angleSpeed;
  }

  display() {
    push();
    translate(this.x - width / 2, this.y - height / 2, this.z);
    rotateX(this.angleX);
    rotateY(this.angleY);
    rotateZ(this.angleZ);
    ambientMaterial(this.fadeColor.levels[0], this.fadeColor.levels[1], this.fadeColor.levels[2], this.alpha); // Use fade color with alpha for fading
    sphere(this.size / 2);
    pop();
  }
}

class Cone extends Shape {
  constructor(x, y, z) {
    super(x, y, z);
  }

  update(vol, spectrum) {
    let bass = fft.getEnergy("bass");
    this.size = map(bass, 0, 255, 50, 200);
    this.alpha = fadeIn ? min(this.alpha + this.fadeSpeed * deltaTime / 1000, 255) : max(this.alpha - this.fadeSpeed * deltaTime / 1000, 0);

    // Move around
    this.angleX += this.angleSpeed;
    this.angleY += this.angleSpeed;
    this.angleZ += this.angleSpeed;
  }

  display() {
    push();
    translate(this.x - width / 2, this.y - height / 2, this.z);
    rotateX(this.angleX);
    rotateY(this.angleY);
    rotateZ(this.angleZ);
    ambientMaterial(this.fadeColor.levels[0], this.fadeColor.levels[1], this.fadeColor.levels[2], this.alpha); // Use fade color with alpha for fading
    cone(this.size / 2, this.size);
    pop();
  }
}

function displayHelix() {
  let numLoops = 5;
  let numPoints = 100;
  let helixRadius = 100;
  let helixHeight = 400;

  stroke(helixColor);
  noFill();
  beginShape();
  for (let i = 0; i < numPoints * numLoops; i++) {
    let angle = map(i, 0, numPoints * numLoops, 0, TWO_PI * numLoops);
    let x = cos(angle) * helixRadius;
    let y = sin(angle) * helixRadius;
    let z = map(i, 0, numPoints * numLoops, -helixHeight / 2, helixHeight / 2);
    vertex(x, y, z);
  }
  endShape();
}
