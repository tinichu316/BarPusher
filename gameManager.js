var i = 0;
function move() {
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar"); //link to the object
    var width = 10; // start width
    //var id = setInterval(frame, 30); // call frame with 10ms delay between calls
    var anim = function() { //use anonymous function instead to vary the delay interval
      if (width >= 100) {
        //clearInterval(id); // stops the coroutine
        i = 0; // set it so you can click it again
      } else {
        width++;
        elem.style.width = width + "%"; // changes the width of the bar
        elem.innerHTML = width + "pp"; // updates the text
      }
      // delay
      setTimeout(anim, width + 10); // delay is based on width 
    }
    setTimeout(anim, 10);
  }
}

window.onload=awake();

document.addEventListener("keydown", keyDownHandler, false); // on keydown, calls keyDownHandler
//document.addEventListener("keyup", keyUpHandler, false);

var maxBarWidth = 500;

var dt = 50; // time in ms for each tick
var exp = 0.0; // from 1 to 100
var vel = 0.0; // how much dist moves each tick
var buffer = 0; // to give inertia to each keystroke
var cash = -1;
var totalCash = 0; // total times the bar has filled up, i.e. total distance

// base default values, without any upgrades.
var bufferDecay = 1.25; //set to decay 5 per second. Too high will cause sliding!
var bufferMax = 16; // 10 is good. Higher will encourage autoclickers and take longer to get to full speed
var friction = 0.01;
var drag = 0.35;
var eps = 0.05; // any smaller velocities than this will go to 0
var mass = 4;
var dripRate = 0.0002; // default gain per ms

var bar;
var barline;
var cashText;
var totalCashText;
var velText;
var bufferText;
var inputText;

var updateLooper;
var gameSaver;

function awake(){
  // awake gets called on window load
  bar = document.getElementById("expBar");
  barline = document.getElementById("expLine");
  cashText = document.getElementById("cashText");
  totalCashText = document.getElementById("totalCashText");
  velText = document.getElementById("velText");
  bufferText = document.getElementById("bufferText");
  inputText = document.getElementById("inputText");

  // other external scripts
  loadScript("uiManager.js");
  loadScript("shop.js", function(){
    start();
  }); 
}

function start(){
  // only called after everything is loaded
  loadProgress();
  updateText();
  updateLooper = setInterval(tick, dt);
  gameSaver = setInterval(saveProgress, 5000);

  console.log("Started!"); 
}

function loadScript(url, callback){
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onload = callback; // wait to append after script has loaded
    console.log("Loaded " + url);
    //document.body.appendChild(script);
    head.appendChild(script);
}

function updateBar(){
  //var bar = document.getElementById("expBar"); // why is this needed?

  //bar.style.width = exp/100.0*maxBarWidth + "px"; // round it
  bar.style.width = exp + "%"; // smoother if it's a float.
  //bar.innerHTML = exp.toFixed(2) + "%"; //the text that shows
  velText.innerHTML = "velocity: " + vel.toFixed(1);
  bufferText.innerHTML = "buffer: " + buffer.toFixed(2);

}

function updateText(){ //only called when cash changes
  //barline.style.width = exp + "%";
  if (cash >= 0){
    cashText.innerHTML = "cash: " + cash;
  }
  if (totalCash*0.0005 > 0.5){ //say one exp line is 0.5 m
    totalCashText.innerHTML = "Distance Travelled: " + (totalCash*0.0005).toFixed(1) + " km";
  }
  document.title = "Cash: " + cash;
}

function tick(){
  // tick gets called every dt milliseconds
  let playerDripRate = dripRate + allUpgrades[upgrades.DripRate].currentLevel * allUpgrades[upgrades.DripRate].incrementPerLevel;
  exp += dt/1000 * vel / 10 + playerDripRate * dt;
  if (exp >= 100){
    exp -= 100;
    cash++;
    totalCash++;
    updateText();
    updateShop();
  }

  let playerDrag = drag + allUpgrades[upgrades.Drag].currentLevel * allUpgrades[upgrades.Drag].incrementPerLevel;
  let acc = dt/mass*buffer - playerDrag*vel**2*Math.sign(vel) - friction*vel - 2.0*Math.sign(vel); //adjust. use 'let' to have block scope
  // console.log(acc);
  vel += dt/1000 * acc;
  // buffer/mass * dt / 1000 should be > eps.
  if (Math.abs(vel) < eps){
    vel = 0;
  }

  let playerBufferDecay =  bufferDecay + allUpgrades[upgrades.BufferDecay].currentLevel * allUpgrades[upgrades.BufferDecay].incrementPerLevel;
  buffer -= playerBufferDecay * dt/1000 * 20.0;
  if (buffer < 0){
    buffer = 0.0;
  }

  updateBar(); //update graphics
}


function addGas(amt = 1){
  // called by keystroke (different keystroke)
  // make it triggered by a button for now
  buffer += amt; //adjust
  let playerBufferMax =  bufferMax + allUpgrades[upgrades.BufferSize].currentLevel * allUpgrades[upgrades.BufferSize].incrementPerLevel;
  if (buffer > playerBufferMax){
    buffer = playerBufferMax;
  }
  updateBar();
}

function keyDownHandler(event){
  if(event.keyCode === 80) {//P
     // toggle developer console
    let devWindowID = "devWindow";
    toggleWindow(devWindowID);
  } else {
    // TODO: check different key from history?
    addGas(5); // works if people just hold down one key
  }

}

// debug cheat codes
function addCash(amt){
  cash++;
  updateText();
  updateShop();
}

// Saving and loading
function saveProgress(){
  console.log("saving"); 
  // saves exp, currency (cash/total cash), loop through upgrades and saves upgrade level
  localStorage.setItem("exp", exp);
  localStorage.setItem("cash", cash);
  localStorage.setItem("totalCash", totalCash);

  for (let u in allUpgrades) {
    u = allUpgrades[u];
    let saveName = "upgrade_" + u.name;
    localStorage.setItem(saveName, u.currentLevel);
  }
}

function loadProgress(){
  console.log("loading");
  // loads exp, currency (cash/total cash), loops through upgrades and loads the upgrade level
  exp = +localStorage.getItem("exp") ?? 0.0; //default value is 0, make it a number
  cash = +localStorage.getItem("cash") ?? 0.0;
  totalCash = +localStorage.getItem("totalCash") ?? 0.0;

  for (let u in allUpgrades) {
    u = allUpgrades[u];
    let saveName = "upgrade_" + u.name;
    u.currentLevel = +localStorage.getItem(saveName, u.currentLevel) ?? 0;
  }
  updateText();
  updateShop();
}

function resetProgress(){
  // maybe put everything to be saved in a dict to look prettier.
  localStorage.removeItem("exp");
  localStorage.removeItem("cash");
  localStorage.removeItem("totalCash");
  for (let u in allUpgrades) {
    u = allUpgrades[u];
    let saveName = "upgrade_" + u.name;
    localStorage.removeItem(saveName, u.currentLevel);
  }
  loadProgress();
}