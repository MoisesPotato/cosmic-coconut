var gameWidth = window.innerWidth;    //Width of game zone in pixels
var gameHeight = window.innerHeight;   //Height of game zone in pixels
var universeWidth = 800;    //Width of universe in pixels
var universeHeight = 600;   //Height of universe in pixels
var hOffset = (gameWidth - universeWidth)/2; // Where the (0,0) for drawing is relative to the canvas coordinates
var vOffset = (gameHeight - universeHeight)/2; // Where the (0,0) for drawing is relative to the canvas coordinates
var bgColor = "#000000";  //Color of the sky backdrop
var starColor = "#FFFFFF";  //Color of the background stars
var earthColor = "blue";   //Color of the planet in the middle
var defaultG = 20000;       //Default strength of gravity
var G = defaultG;             //strength of gravity
var dt = 0.5;               //Changing this is a mess. Most of the speed is measured in framses anyway
var rotationSpeed = 0.2;    //Speed at which ships rotate when you press keys
var earthRadius = 75;       //Size of planet inside
var mode = "Torus";         //Universe is a torus. Only mode for now. Other possibilites: InvertX, InvertY (klein bottles), RP2
var then;                   //Time of last animation frame
var PlayerOne;              //Player ship
var PlayerTwo;              //Player ship
var scene = "menu";        //Scene: possibilities: "start", "GameOver", "menu"
var winner = "none";        //Winner of the last game
var missiles = [];          //Array storing all the flying missiles 
var successfulMissiles = [];//Keeps track of the missiles that have hit their targets.
var projectileSpeed = 20;   //Speed at which a missile is fired
var explosionLength = 15;   //Time a ship spends exploding
var overheatTemp = 20;      //Temperature at which a ship starts overheating
var missileCooldown = 9;    //Min time between missiles
var enginesPower = 1.5;       //Power of the ship engine
var engineCoolingRate = 0.5;//Rate at which the engine cools by default
var engineHeatingRate = 1.5;  //Rate at which the engine heats when thrust is on
var missileLiveTime = 5;    //Time after which a missile can hit ship that fired it
var missileTempIncrease = 8;//Temperature increase by firing a missiles
var score = [0,0];          //Initial score
var eyesChasing = 1;        //Who the eyes of the Earth are chasing
var weaponTimer = 0;        //Time until a weapon spawns
var minWeaponWaitTime = 30; //Minimum wait for a weapon 200 seems reasonable
var maxWeaponWaitTime = 50;//Max wait for a weapon 500 seems reasonable
var weaponTypes = ["Mine", "Banana", "Gravity", "Top", "Guided", "Guided3", "Magnet", "Bomb"];       //All the possible weapons
/*
Adding a new weapon:
Add to weapon types.
Add to weapon.prototype.draw
Add to DealWithWeapons
Add to ship.prototype.fireWeapon
Add to ship.prototype.drawCurrentWeapon
Status effects:
    Add to ship.prototype.checkStatus
*/
var floatingBox = new presentBox(null);//The one possible weapon box
var paused = false;
var weaponsCurrent = [];        //Array that keeps track of weapons currently flying around
var effectDuration = 15;        //Duration of weapon effects, in frames
var GravityWarpTimer = 0;       //Time left of extra gravity
var changingKey = false;        //For changing controls   
var whichKeyIsChanging = null; //For changing controls
var topologyCounter = 0;        //Time left in the topolgizer effect
var guidedAgility = 0.1;        //How fast can the guided missile turn
var magnetStrength = 2;       //How strong the magnet pull is
var bombTimer = 60;            //How long before bomb detonation
var blastRadius = 130;          //Of the bomb




var area = document.getElementById("gameZone");
area.width = gameWidth;
area.style.width = gameWidth+"px";
area.height = gameHeight;
area.style.height = gameHeight+"px";
var ctx = area.getContext("2d");

/////// All the images //////////////////////////////////////////
var imageShipNoFire = new Image();  //Image of ship
imageShipNoFire.src = 'ShipNoFire.png';
var imageShipFire = new Image();  //Image of ship
imageShipFire.src = 'ShipFire.png';
var imageShipFireAlt = new Image();  //Image of ship
imageShipFireAlt.src = 'ShipFire2.png';
var imageShipOverheating1 = new Image();  //Image of ship
imageShipOverheating1.src = 'ShipOverheating1.png';
var imageShipOverheating2 = new Image();  //Image of ship
imageShipOverheating2.src = 'ShipOverheating2.png';
var imageExplosion = new Image();  //Image of ship
imageExplosion.src = 'Explosion1.png';
var imageBigExplosion = new Image();  //Image of explosion
imageBigExplosion.src = 'Explosion2.png';
var imageShipNoFireBlue = new Image();  //Image of ship
imageShipNoFireBlue.src = 'ShipNoFire_blue.png';
var imageShipFireBlue = new Image();  //Image of ship
imageShipFireBlue.src = 'ShipFire_blue.png';
var imageShipFireAltBlue = new Image();  //Image of ship
imageShipFireAltBlue.src = 'ShipFire2_blue.png';
var imageShipOverheating1Blue = new Image();  //Image of ship
imageShipOverheating1Blue.src = 'ShipOverheating1_blue.png';
var imageShipOverheating2Blue = new Image();  //Image of ship
imageShipOverheating2Blue.src = 'ShipOverheating2_blue.png';
var imageEarth = new Image();
imageEarth.src = 'Planet.png';
var imageBox = new Image();
imageBox.src = 'Box.png';
var imageMine = new Image();
imageMine.src = 'Mine.png';
var imageBanana = new Image();
imageBanana.src = 'Banana.png';
var imageGravity = new Image();
imageGravity.src = 'Gravity.png';
var imageMissile = new Image();
imageMissile.src = 'Missile.png';
var imageMissileNoFire = new Image();
imageMissileNoFire.src = 'MissileNoFire.png';
var imageLightning = new Image();
imageLightning.src = 'Lightning.png';
var imageTop = new Image();
imageTop.src = 'Topologizer.png';
var imageMagnet = new Image();
imageMagnet.src = 'Magnet.png';
var imageBomb = new Image();
imageBomb.src = 'Bomb.png';
var imageSpark = new Image();
imageSpark.src = 'Spark.png';
var imageHCrack = new Image();
imageHCrack.src = 'HCrack.png';
var imageVCrack = new Image();
imageVCrack.src = 'VCrack.png';

/////// VECTORS //////////////////////////////////////////

function vec(x,y){   ///Vector operations   ////////////////////////
    this.x = x;
    this.y = y;
    this.times = function(l){
        return(new vec(this.x*l, this.y*l));
    }
    this.plus = function(v){
        return new vec(this.x + v.x, this.y + v.y);
    }
    this.op =  function(){
        return new vec(-this.x, -this.y) ;
    }
    this.VlengthSq = function(){
        return this.x * this.x + this.y * this.y;
    }
    this.Vlength = function(){
        return Math.sqrt(this.VlengthSq());
    }
    this.rot = function(angle){
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var rotX = this.x * cos + this.y * sin;
        var rotY = this.x * (-sin) + this.y * cos;
        return new vec(rotX, rotY);
    }
    this.cross = function (v){
        return this.x * v.y - this.y * v.x;
    }
    this.dot = function (v){
        return this.x * v.x + this.y * v.y;
    }
    this.flipHor = function(){
        return new vec(universeWidth - this.x, this.y);
    }
    this.flipVer = function(){
        return new vec(this.x, universeHeight - this.y);
    }
    this.flipVyH = function(){
        return new vec(universeWidth - this.x, universeHeight - this.y);
    }
    this.toAngle = function(){//Returns the angle that the vector is facing towards, in radians. It is measured from "up"=0, and "left"=PI/2
        var answer = Math.atan(this.x/this.y);
        if (this.y > 0){
            answer = answer + Math.PI;
        }
        return answer;
    }
    this.projectOn = function(v){
        return v.times(this.dot(v)/v.VlengthSq());
    }
}

shortestPath = function(v, w){//Finds shortest path from v to w (depends on "mode"), returns the vector that gives said path
    var PossiblePaths = [w.plus(v.op())];
    switch (mode){
            case "Torus":
                PossiblePaths.push(w.plus(new vec(universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(universeWidth,    universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(universeWidth,    -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-universeWidth,   universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-universeWidth,   -universeHeight))   .plus(v.op()));
                break;
            case "InvertX":
                PossiblePaths.push(w.plus(new vec(universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(0,            universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(0,            -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(universeWidth,    universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(universeWidth,    -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(-universeWidth,   universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(-universeWidth,   -universeHeight))   .plus(v.op()));
                break;
            case "InvertY":
                PossiblePaths.push(w.flipVer().plus(new vec(universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(-universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(universeWidth,    universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(universeWidth,    -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(-universeWidth,   universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(-universeWidth,   -universeHeight))   .plus(v.op()));
                break;
            case "RP2":
                PossiblePaths.push(w.flipVer().plus(new vec(universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.flipVer().plus(new vec(-universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(0,            universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor().plus(new vec(0,            -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVyH().plus(new vec(universeWidth,    universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVyH().plus(new vec(universeWidth,    -universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVyH().plus(new vec(-universeWidth,   universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVyH().plus(new vec(-universeWidth,   -universeHeight))   .plus(v.op()));
                break;
        }
    var minLength = 1000000;
    var minPathIndex = -1;
    for (var i = 0; i < 9; i++){
        var lengthAttempt = PossiblePaths[i].VlengthSq();
        if (lengthAttempt < minLength){
            minLength = lengthAttempt;
            minPathIndex = i;
        }
    }
    //console.log("Length is "+Math.sqrt(minLength));
    return PossiblePaths[minPathIndex];
}

////////////Placing a rotated image ////////////////////////////////////////////////////////////////////////
//VDisplacement from the top, where the center of mass should be

placeInCanvas = function(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace){ ////Draws something in given coordinates (once)  
    ctx.translate(position.x + hOffset, position.y + vOffset);
    ctx.rotate(-angle);
    ctx.drawImage(imgObject, -Hdisplace, -Vdisplace, imgW, imgH);
    ctx.rotate(angle);
    ctx.translate(-position.x - hOffset, -position.y - vOffset);
}

drawNineTimes = function(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace){ ///// Draws something 9 times depending on the surface
    var xFlip = isXflipped();
    var yFlip = isYflipped();
    placeInCanvas(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace);
    if (!xFlip){
        placeInCanvas(imgObject, position.plus(new vec(0, universeHeight))  , angle         , imgW, imgH, Hdisplace, Vdisplace); //Down
        placeInCanvas(imgObject, position.plus(new vec(0, - universeHeight)), angle         , imgW, imgH, Hdisplace, Vdisplace); //Up
        if (!yFlip){
            placeInCanvas(imgObject, position.plus(new vec(universeWidth, universeHeight))  , angle         , imgW, imgH, Hdisplace, Vdisplace); //downRight
            placeInCanvas(imgObject, position.plus(new vec(universeWidth, -universeHeight))  , angle         , imgW, imgH, Hdisplace, Vdisplace); //UpRight
            placeInCanvas(imgObject, position.plus(new vec(-universeWidth, universeHeight))  , angle         , imgW, imgH, Hdisplace, Vdisplace); //DownLeft
            placeInCanvas(imgObject, position.plus(new vec(-universeWidth, -universeHeight))  , angle         , imgW, imgH, Hdisplace, Vdisplace); //UpLeft
        } else {
            placeInCanvas(imgObject, position.flipVer().plus(new vec(universeWidth, universeHeight))  , Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().plus(new vec(- universeWidth, universeHeight)), Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().plus(new vec(universeWidth,- universeHeight))  , Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().plus(new vec(- universeWidth,- universeHeight)), Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
        }
    } else {
        placeInCanvas(imgObject, position.flipHor().plus(new vec(0, universeHeight))  , - angle, imgW, imgH, Hdisplace, Vdisplace);
        placeInCanvas(imgObject, position.flipHor().plus(new vec(0, - universeHeight)), - angle, imgW, imgH, Hdisplace, Vdisplace);
        if (!yFlip){
            placeInCanvas(imgObject, position.flipHor().plus(new vec(universeWidth, universeHeight))  , - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipHor().plus(new vec(universeWidth, - universeHeight)), - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipHor().plus(new vec(-universeWidth, universeHeight))  , - angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipHor().plus(new vec(-universeWidth, - universeHeight)), - angle, imgW, imgH, Hdisplace, Vdisplace);
        } else {
            placeInCanvas(imgObject, position.flipVer().flipHor().plus(new vec(universeWidth, universeHeight))  , Math.PI + angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().flipHor().plus(new vec(- universeWidth, universeHeight)), Math.PI + angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().flipHor().plus(new vec(universeWidth,- universeHeight))  , Math.PI + angle, imgW, imgH, Hdisplace, Vdisplace);
            placeInCanvas(imgObject, position.flipVer().flipHor().plus(new vec(- universeWidth,- universeHeight)), Math.PI + angle, imgW, imgH, Hdisplace, Vdisplace);
        }
    }
    if (!yFlip){
        placeInCanvas(imgObject, position.plus(new vec(universeWidth, 0))  , angle         , imgW, imgH, Hdisplace, Vdisplace);
        placeInCanvas(imgObject, position.plus(new vec(- universeWidth, 0)), angle         , imgW, imgH, Hdisplace, Vdisplace);
    } else {
        placeInCanvas(imgObject, position.flipVer().plus(new vec(universeWidth, 0))  , Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
        placeInCanvas(imgObject, position.flipVer().plus(new vec(- universeWidth, 0)), Math.PI - angle, imgW, imgH, Hdisplace, Vdisplace);
    }  
}

var O = new vec(universeWidth/2, universeHeight/2); //The origin, the planet.

canToEarth = function(v){ //Changes a vector from coordinates with respect to canvas to coordinates w.r.t. Earth
    return v.plus(O.op());
};

earthToCan = function(v){ //Changes a vector from coordinates with respect to Earth to coordinates w.r.t. canvas
    return v.plus(O);
}





////////////// KEYS AND THEIR CODES ////////////////////////



var leftKey = 37;
var tab = 9;
var alt = 18;
var enter = 13;
var rightKey = 39;
var upKey = 38;
var downKey = 40;
var rKey = 82;
var spaceBar = 32;
var rShift = 16;
var aKey = 65;
var dKey = 68;
var sKey = 83;
var wKey = 87;
var mKey = 77;
var pKey = 80;
var oKey = 79;
var cKey = 67;

function stringFromCharCode(code){ //// The string that is displayed in the "controls" window
    if (code == leftKey){
        return "Left";
    } else if (code == rightKey){
        return "Right";
    } else if (code == upKey){
        return "Up";
    } else if (code == downKey){
        return "Down";
    } else if (code == spaceBar){
        return "Space Bar";
    } else if (code == rShift){
        return "Shift";
    } else if (code == tab){
        return "tab";
    } else if (code == enter){
        return "enter";
    } else {
        return String.fromCharCode(code);
    }
}

////////// Default controls  /////////////////////////////////
var p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
var p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);


var keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
window.onkeyup = function(e) {keysList[e.keyCode]=false;
                             }
window.onkeydown = function(e) {keysList[e.keyCode]=true;
                               // console.log(e.keyCode);
                               if (e.keyCode == leftKey || e.keyCode == rightKey || e.keyCode == upKey || e.keyCode == downKey || e.keyCode == spaceBar){ ////////// Don't scroll with special keys ///////////
                                   e.preventDefault();
                               }
                               if (changingKey){ ////////// Are we in the screen where controls are changed? ///////////
                                    //console.log("Changing the key "+whichKeyIsChanging);
                                    whichKeyIsChanging[0].changeKey(whichKeyIsChanging[1], e.keyCode);
                                    //console.log("Keypressed: "+e.keyCode);
                                    //console.log("The letter is "+stringFromCharCode(e.keyCode));
                                    document.getElementById(whichKeyIsChanging[2]).innerHTML = stringFromCharCode(e.keyCode);
                                    changingKey = false;
                                    whichKeyIsChanging = null;
                                    //console.log("Changed to "+p1Keys.moveLeft);
                                }              
}

window.onkeypress = function(){
    if(scene =="GameOver"){
        if (keysList[rKey]){
            startTheGame();
        } else if (keysList[mKey]){
            showMenu();
        }
    }
    if (scene =="menu"){
        if (keysList[sKey]){
            startTheGame();
        } else if (keysList[oKey]){
            showOptions();
        } else if (keysList[cKey]){
            showCredits();
        }
    }
    if (scene =="options" || scene =="credits"){
        if (keysList[mKey]){
    		document.getElementById("controls").style.display = "none";
            	showMenu();
        }
    }
    if (scene =="start"){
        if (keysList[pKey] && !paused){
            pause();
        } else if (keysList[pKey] && paused){
            unPause();
        }
    }
    if (paused && keysList[mKey]){
        paused = false;
        showMenu();
    }
    
}


////////////////////// Object that stores controls for a given player /////////////////////////////////

function keySet(moveLeft, moveRight, thrust, fire, special){
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.thrust = thrust;
    this.fire = fire;
    this.special = special;
}

keySet.prototype.changeKey = function(whichKey, newCode){
    switch (whichKey){
        case "left":
            this.moveLeft = newCode;
            break;
        case "right":
            this.moveRight = newCode;
            break;
        case "thrust":
            this.thrust = newCode;
            break;
        case "fire":
            this.fire = newCode;
            break;
        case "special":
            this.special = newCode;
            break;      
    }
}


//////// THE BACKGROUND   ////////////////////////

var starDisplay = []

function getBackground(starNumber){    //Makes a list of star positions
    for (var i = 0; i < starNumber; i++){
        var x = Math.floor(Math.random()*universeWidth);
        var y = Math.floor(Math.random()*universeHeight);
        starDisplay.push(new vec(x,y));
    }   
}

function flipStarDisplay(HV, LRUD){ ////////////////////// When universe is changed by topologizer, stars flip too //////////////////////
    for (var s = 0; s < starDisplay.length; s++){
        if(HV == "H" && LRUD == "U"){
            if (starDisplay[s].y < universeHeight/2){
                starDisplay[s].x = universeWidth - starDisplay[s].x;
            }
        }
        if(HV == "H" && LRUD == "D"){
            if (starDisplay[s].y > universeHeight/2){
                starDisplay[s].x = universeWidth - starDisplay[s].x;
            }
        }
        if(HV == "V" && LRUD == "L"){
            if (starDisplay[s].x < universeWidth/2){
                starDisplay[s].y = universeHeight - starDisplay[s].y;
            }
        }
        if(HV == "V" && LRUD == "R"){
            if (starDisplay[s].x > universeWidth/2){
                starDisplay[s].y = universeHeight - starDisplay[s].y;
            }
        }
    }
}

function drawBackground(){
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0 , gameWidth, gameHeight);
    var l = starDisplay.length;
    for (var i = 0; i < l; i++){
        ctx.beginPath();
        if (i < l/2){
            ctx.arc(starDisplay[i].x + hOffset, starDisplay[i].y + vOffset, 2, 0, 2 * Math.PI);
        } else {
            ctx.arc(starDisplay[i].x + hOffset, starDisplay[i].y + vOffset, 3, 0, 2 * Math.PI);
        }
        //ctx.arc(starDisplay[i].x, starDisplay[i].y, Math.floor(i * 2/l+2), 0, 2 * Math.PI);
        ctx.fillStyle = starColor;
        ctx.fill();
        ctx.stroke();
    }
    /*ctx.beginPath();
    ctx.arc(O.x, O.y, earthRadius, 0, 2 * Math.PI); //draw Earth
    ctx.fillStyle = earthColor;
    ctx.fill();
    ctx.stroke();*/
    ctx.drawImage(imageEarth, O.x - earthRadius + hOffset, O.y - earthRadius + vOffset, 2*earthRadius, 2*earthRadius);
}

function drawEyes(){ ////////////////////// THe eyes of Earth /////////////////////////////////
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(O.x - 32 + hOffset, O.y - 30 + vOffset, 18, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(O.x + 32 + hOffset, O.y - 30 + vOffset, 18, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    var direction = eyesChasing.pos.plus(O.op());
    direction = direction.times(1/direction.Vlength()*6);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(O.x - 32 + direction.x + hOffset, O.y - 30 + direction.y + vOffset, 8, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(O.x + 32 + direction.x + hOffset, O.y - 30 + direction.y + vOffset, 8, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
}


////// Space-time: what is being flipped?
function isXflipped(){
    if (mode == "Torus" || mode == "InvertY"){
        return false;
    } else {
        return true;
    }
}

function isYflipped(){
    if (mode == "Torus" || mode == "InvertX"){
        return false;
    } else {
        return true;
    }
}


////////////////// THE CLASS FOR HITBOXES ///////////////

function hitboxClass(front, back, sides){ ////////////////////// Hitboxes are rectangular and symmetric... //////////////////////
    this.front = front;
    this.back = back;
    this.sides = sides;
}

hitboxClass.prototype.collide = function(thing){
    if (thing.y > -this.front && thing.y < this.back && Math.abs(thing.x) < this.sides) {
        return true;
    } else {
        return false;
    }
}

hitboxClass.prototype.increase = function(r){////////////////////// For making collisions easier (or harder?)
    return new hitboxClass(this.front + r, this.back + r, this.sides + r)
}

////////////////// THE CLASS FOR FLYING STUFFS ///////////////

////////////////////// Ships, missiles, weapons...

function flyingThing(pos, vel){
    this.pos = pos;
    this.vel = vel;
}


 flyingThing.prototype.gPull = function(gMult){ //Computes the gravitational pull from the middle
     gMult = gMult || 1;
    if (this.pos.x === 0 && this.pos.y === 0){
        var Pull = new vec(0, 0);
        return Pull;
    } else {
        var Pull = this.pos.op().plus(O);
        Pull = Pull.times(G * gMult * Math.pow(Pull.Vlength(), -3));
        return Pull;
    }
};

flyingThing.prototype.freeFall = function(gMult){ ////////////////////// One step in free falling //////////////////////
    gMult = gMult || 1;
    var acc = this.gPull(gMult);
    this.vel = this.vel.plus(acc.times(dt));
    this.pos = this.pos.plus(this.vel.times(dt));
    this.pos = this.pos.plus(acc.times(dt*dt/2));
}



flyingThing.prototype.leaveScreen = function(){ ////// THis function could be made prettier using isXflipped(), but eh //////////////
    if(mode == "Torus"){
        if (this.pos.x > universeWidth){
            this.pos.x -= universeWidth;
        } else if (this.pos.x < 0){
            this.pos.x += universeWidth;
        }
        if (this.pos.y > universeHeight){
            this.pos.y -= universeHeight;
        } else if (this.pos.y < 0){
            this.pos.y += universeHeight;
        }    
    } 
    if(mode == "InvertX"){
        if (this.pos.x > universeWidth){
            this.pos.x -= universeWidth;
        } else if (this.pos.x < 0){
            this.pos.x += universeWidth;
        }
        if (this.pos.y > universeHeight){
            this.pos.y -= universeHeight;
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0){
            this.pos.y += universeHeight;
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        }    
    }
    if(mode == "InvertY"){
        if (this.pos.x > universeWidth){
            this.pos.x -= universeWidth;
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI -this.facing;
            }
        } else if (this.pos.x < 0){
            this.pos.x += universeWidth;
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI -this.facing;
            }
        }
        if (this.pos.y > universeHeight){
            this.pos.y -= universeHeight;
        } else if (this.pos.y < 0){
            this.pos.y += universeHeight;
        }    
    }
    if(mode == "RP2"){
        if (this.pos.x > universeWidth){
            this.pos.x -= universeWidth;
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI -this.facing;
            }
        } else if (this.pos.x < 0){
            this.pos.x += universeWidth;
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI -this.facing;
            }
        }
        if (this.pos.y > universeHeight){
            this.pos.y -= universeHeight;
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0){
            this.pos.y += universeHeight;
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        }    
    }
};


flyingThing.prototype.checkCollision = function(){ ////////// Are you crashed into Earth yet? ////////////
    var distToEarth = canToEarth(this.pos).Vlength();
    if (distToEarth < earthRadius){
        return true;
    } else {
        return false;
    }
}

////////////////// THE CLASS FOR WEAPONS ///////////////
function weapon(pos, vel, type, firedBy){
    flyingThing.call(this, pos, vel);
    this.type = type;
    this.living = 0;
    this.facing = 0;
    this.firedBy = firedBy;
    this.turnSpeed = 0;
    this.history = [];
}

weapon.prototype = Object.create(flyingThing.prototype);
weapon.prototype.constructor = weapon;

weapon.prototype.draw = function(){
    switch (this.type){
        case "Mine":
            this.facing += 0.03;
            drawNineTimes(imageMine, this.pos, this.facing, 26, 26, 13, 13);
            break;
        case "Banana":
            drawNineTimes(imageBanana, this.pos, 0, 26, 26, 13, 13);
            break;
        case "Bomb":
            if (this.living <= bombTimer - 10){
                drawNineTimes(imageBomb, this.pos, 0, 26, 26, 13, 13);
                drawNineTimes(imageSpark, this.pos.plus(new vec(14 - this.living / 30, -15 + this.living / 30)), this.living, 10, 10, 5, 5);
            } else if (this.living <= bombTimer){
                var bombSize = (this.living - bombTimer) * 1.5 + 41
                drawNineTimes(imageBomb, this.pos, 0, bombSize, bombSize, bombSize / 2, bombSize / 2);
                drawNineTimes(imageSpark, this.pos.plus(new vec(11, -11)), this.living, 10, 10, 5, 5);
            } else {
                drawNineTimes(imageBigExplosion, this.pos, Math.random() * 2 * Math.PI, blastRadius +  20, blastRadius + 20, blastRadius / 2 + 10, blastRadius / 2 + 10);
            }
            break;
        case "Guided":
            if (this.living < 50){
                this.facing = this.vel.toAngle();
                drawNineTimes(imageMissile, this.pos, this.facing, 17*0.75, 37*0.75, 13, 13);
            } else if (this.living == 50) {
                this.turnSpeed = this.vel.toAngle() - this.facing;
                drawNineTimes(imageMissileNoFire, this.pos, this.vel.toAngle(), 17*0.75, 37*0.75, 13, 13);
            } else {
                this.facing += this.turnSpeed;
                drawNineTimes(imageMissileNoFire, this.pos, this.facing, 17*0.75, 37*0.75, 13, 13);
            }
            break;
        case "Guided3":
            this.facing = this.vel.toAngle();
            if (this.living < 50){
                drawNineTimes(imageMissile, this.pos, this.facing, 17*0.5, 37*0.5, 13, 13);
            } else if (this.living == 50) {
                this.turnSpeed = this.vel.toAngle() - this.facing;                
                drawNineTimes(imageMissileNoFire, this.pos, this.vel.toAngle(), 17*0.5, 37*0.5, 13, 13);
            } else {
                this.facing += this.turnSpeed;                
                drawNineTimes(imageMissileNoFire, this.pos, this.facing, 17*0.5, 37*0.5, 13, 13);
            }
            break;
        case "Gravity":
            this.facing += 0.06;
            drawNineTimes(imageGravity, this.pos, this.facing, 26, 26, 13, 13);
            break;
        default:
            break;
        }
}

flyingThing.prototype.flip = function(HV, LRUD){
    if(HV == "H" && LRUD == "U"){
        if (this.pos.y < universeHeight/2){
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship){
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "H" && LRUD == "D"){
        if (this.pos.y > universeHeight/2){
            this.pos.x = universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship){
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "L"){
        if (this.pos.x < universeWidth/2){
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if(this.constructor == ship){
                this.facing = Math.PI-this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "R"){
        if (this.pos.x > universeWidth/2){
            this.pos.y = universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if(this.constructor == ship){
                this.facing = Math.PI-this.facing;
                this.orbiting = false;
            }
        }
    }
}

function flipScene(HV, LRUD){
        PlayerOne.flip(HV, LRUD);
        PlayerTwo.flip(HV, LRUD);
        for (var m = 0; m < missiles.length; m++){
            missiles[m].flip(HV, LRUD);
        }
        for (var m = 0; m < weaponsCurrent.length; m++){
            weaponsCurrent[m].flip(HV, LRUD);
        }
        if (floatingBox.existing){
            floatingBox.flip(HV, LRUD);
        }
        flipStarDisplay(HV, LRUD);
        var newMode;
    if(HV == "H"){
        switch (mode){
            case "Torus":
                newMode = "InvertX";
                break;
            case "InvertX":
                newMode = "Torus";
                break;
            case "InvertY":
                newMode = "RP2";
                break;
            case "RP2":
                newMode = "InvertY";
                break;
        }
        ctx.drawImage(imageHCrack, 0, 0, universeWidth, universeHeight);
    }
    if(HV == "V"){
        switch (mode){
            case "Torus":
                newMode = "InvertY";
                break;
            case "InvertX":
                newMode = "RP2";
                break;
            case "InvertY":
                newMode = "Torus";
                break;
            case "RP2":
                newMode = "InvertX";
                break;
        }
        ctx.drawImage(imageVCrack, 0, 0, universeWidth, universeHeight);
    }
    mode = newMode;
}



function flipAround(){
    var whichFLip = Math.floor(Math.random()*5);
    switch (whichFLip){
        case 1:
            flipScene("H","U");
            break;
        case 2:
            flipScene("H","D");
            break;
        case 3:
            flipScene("V","L");
            break;
        case 4:
            flipScene("V","R");
            break;
    }
}


function dealWithWeapons(){   //Animation of weapons which are floating around
    for (var w = 0; w < weaponsCurrent.length; w++){
        var W = weaponsCurrent[w];
            switch (W.type){
                case "Mine":
                    if (W.living < 10){
                        W.living ++;
                    }
                    if (PlayerOne.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 2)){
                        PlayerOne.orbiting = false;
                        //PlayerOne.engineTemp += overheatTemp/2;
                        PlayerOne.vel = PlayerOne.vel.times(0.2);
                        PlayerOne.status.slowed = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        //PlayerTwo.engineTemp += overheatTemp/2;
                        PlayerTwo.vel = PlayerTwo.vel.times(0.2);
                        PlayerTwo.status.slowed = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    
                    break;
                case "Banana":
                    if (W.living < 10){
                        W.living ++;
                    }
                    if (PlayerOne.easyCollide(W.pos, 10) && PlayerOne.status.slowed == 0 && (W.living == 10 || W.firedBy == 2)){
                        PlayerOne.orbiting = false;
                        PlayerOne.vel = PlayerOne.vel.times(2);
                        PlayerOne.status.slowed = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && PlayerTwo.status.slowed == 0 && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        PlayerTwo.vel = PlayerTwo.vel.times(2);
                        PlayerTwo.status.slowed = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    
                    break;
                case "Bomb":
                    W.living ++;
                    if (W.living > bombTimer && W.living < bombTimer + 20){
                        if (shortestPath(W.pos, PlayerOne.pos).VlengthSq() < Math.pow(blastRadius - 50, 2)){
                            PlayerOne.exploding = true;
                        }
                        if (shortestPath(W.pos, PlayerTwo.pos).VlengthSq() < Math.pow(blastRadius - 50, 2)){
                            PlayerTwo.exploding = true;
                        }
                    }
                    if (W.living == bombTimer + 20){
                        weaponsCurrent.splice(w, 1);
                        w--; 
                    }
                    break;
                case "Gravity":
                    W.freeFall();
                    W.leaveScreen();
                    if (W.checkCollision()){
                        GravityWarpTimer = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        PlayerOne.orbiting = false;
                        PlayerTwo.orbiting = false;
                        w--;
                    }
                    if (W.living < 10){
                        W.living ++;
                    }
                    //console.log("Collision: "+ PlayerTwo.easyCollide(W.pos, 10));
                    //console.log("Alive: "+ (W.living == 10));
                    //console.log("Fired by 1: "+ (W.firedBy == 1));
                    //console.log("Total: "+ (PlayerTwo.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)));
                    if (PlayerOne.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 2)){
                        PlayerOne.orbiting = false;
                        PlayerOne.status.gravitied = effectDuration;
                        PlayerOne.status.gravityStrength++;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        PlayerTwo.status.gravitied = effectDuration;
                        PlayerTwo.status.gravityStrength++;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    break;
                case "Guided":
                    W.history.push({pos:W.pos, vel:W.vel});
                    W.freeFall();
                    W.leaveScreen();
                    if (W.checkCollision()){
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    if (W.living < 150){
                        W.living ++;
                        if (W.firedBy == 1){
                        var newDir = shortestPath(W.pos, PlayerTwo.pos.plus(PlayerTwo.vel.times(5)));
                        } else {
                            var newDir = shortestPath(W.pos, PlayerOne.pos.plus(PlayerOne.vel.times(5)));    
                        }
                        newDir = newDir.times(1/(newDir.Vlength())).times(guidedAgility);
                        newDir = newDir.projectOn(W.vel.rot(Math.PI/2));
                        //console.log("Direction change is "+newDir.x.toFixed(2)+", "+newDir.y.toFixed(2));
                        //console.log("Current speed is "+W.vel.x.toFixed(2)+", "+W.vel.y.toFixed(2));
                        W.vel = W.vel.plus(newDir.times(W.vel.Vlength()));
                    }
                    if (PlayerOne.easyCollide(W.pos, 7) && (W.living >= 10 || W.firedBy == 2)){
                        PlayerOne.exploding = true;
                        successfulMissiles.push(W);
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 7) && (W.living >= 10 || W.firedBy == 1)){
                        PlayerTwo.exploding = true;
                        successfulMissiles.push(W);
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    break;
                case "Guided3":
                    W.history.push({pos:W.pos, vel:W.vel});
                    W.freeFall();
                    W.leaveScreen();
                    if (W.checkCollision()){
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    if (W.living < 150){
                        W.living ++;
                        if (W.firedBy == 1){
                        var newDir = shortestPath(W.pos, PlayerTwo.pos.plus(PlayerTwo.vel.times(5)));
                        } else {
                            var newDir = shortestPath(W.pos, PlayerOne.pos.plus(PlayerOne.vel.times(5)));    
                        }
                        newDir = newDir.times(1/(newDir.Vlength())).times(guidedAgility / 1.5);
                        newDir = newDir.projectOn(W.vel.rot(Math.PI/2));
                        //console.log("Direction change is "+newDir.x.toFixed(2)+", "+newDir.y.toFixed(2));
                        //console.log("Current speed is "+W.vel.x.toFixed(2)+", "+W.vel.y.toFixed(2));
                        W.vel = W.vel.plus(newDir.times(W.vel.Vlength()));
                    }
                    if (PlayerOne.easyCollide(W.pos, 4) && (W.living >= 10 || W.firedBy == 2)){
                        PlayerOne.exploding = true;
                        successfulMissiles.push(W);
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 4) && (W.living >= 10 || W.firedBy == 1)){
                        PlayerTwo.exploding = true;
                        successfulMissiles.push(W);
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    break;
                default:
                    break;
            }
        W.draw();
    }
    if (topologyCounter == 3 || topologyCounter == 1 || topologyCounter == 5){
        ctx.drawImage(imageLightning, 0, 0, universeWidth, universeHeight);
        topologyCounter --;
    } else if (topologyCounter == 4 || topologyCounter == 6){
        flipAround();
        topologyCounter--;
    }
}



function resetWeaponTimer(){
    weaponTimer = Math.floor((minWeaponWaitTime-maxWeaponWaitTime)*Math.random()+minWeaponWaitTime);
}

function dealWithBoxes(){
    if (!floatingBox.existing){
        if(weaponTimer == 0){
            floatingBox.spawn();
        } else {
            weaponTimer--;
        } 
    } else {
//        console.log("Collision: "+PlayerTwo.hitboxEasy.collide(floatingBox.pos));
//        console.log("Player Two: "+PlayerTwo.pos);
        if (PlayerOne.easyCollide(floatingBox.pos, 12)){
            floatingBox.open(PlayerOne);
        } else if (PlayerTwo.easyCollide(floatingBox.pos, 12)){
            floatingBox.open(PlayerTwo);
        }
    }
}

function randomWeapon(){
    //console.log("Choosing weapon");
    var num = weaponTypes.length;
    return weaponTypes[Math.floor(Math.random()*num)];
}


////////////////////// CLASS FOR PRESENT BOXES ////////////
function presentBox(pos){
    flyingThing.call(this, pos, new vec(0, 0));
    this.existing = false;
    this.timer = 0;
    this.growing = true;
}


presentBox.prototype = Object.create(flyingThing.prototype);
presentBox.prototype.constructor = presentBox;

presentBox.prototype.spawn = function(){
    this.pos = new vec(universeWidth * Math.random(), universeHeight * Math.random());
    this.existing = true;
    if (this.checkCollision()){
        this.spawn();
    }
}



presentBox.prototype.open = function(player){
    resetWeaponTimer();
    this.existing = false;
    player.weapon = randomWeapon();
    //console.log("Weapon of choice is"+ player.weapon);
    player.ammo = 3;
}


presentBox.prototype.draw = function(){
    if (this.existing){
        drawNineTimes(imageBox, this.pos, 0, 24+this.timer, 24+this.timer, 12+this.timer/2, 12+this.timer/2);
    }
    if (this.growing){  
        if(this.timer < 3){
        this.timer++;
        } else {
        this.growing = false;
        }
    } else {
            if(this.timer > 0){
            this.timer--;
        } else {
            this.growing = true;
        }
    }
}


////////////////// THE CLASS FOR SHIPS ///////////////


function ship(pos, whichPlayer, facing, keyScheme){
    flyingThing.call(this, pos, null);
    this.enginePower = new vec(0, -enginesPower);
    this.facing = facing;
    this.orbiting = true;
    this.crashed = false;
    this.exploding = false;
    this.angularspeed = 0;
    this.firestate = 0;
    this.engineTemp = 0;
    this.overheat = false;
    this.coolDownTimer = 0;
    this.keyScheme = keyScheme;
    this.hitbox = new hitboxClass(15, 21, 9);
    this.hitboxEasy = new hitboxClass(18, 23, 14);
    this.whichPlayer = whichPlayer;
    this.weapon = "none";
    this.ammo = 0;
    this.status = { /// Numbers are time left in status effect.
        slowed: 0,
        gravitied: 0,
        gravityStrength: 0, // Add 1 every time ship is hit by gravity ball
        magnetized: 0,
    };
}


ship.prototype = Object.create(flyingThing.prototype);
ship.prototype.constructor = ship;

ship.prototype.setAngularSpeed = function(){
    this.angularspeed = Math.sqrt((this.gPull().Vlength())/(canToEarth(this.pos).Vlength()));
    this.vel = canToEarth(this.pos).rot(Math.PI/2).times(this.angularspeed);
}

ship.prototype.clearStatus = function(){// This function is not in use anymore
    this.status = { /// Numbers are time left in status effect.
        slowed: 0,
        gravitied: 0,
        gravityStrength: 0, // Add 1 every time ship is hit by gravity ball
        magnetized: 0,
    };
    this.enginePower = new vec(0, -enginesPower);
    /*   OLD FUNCTION FROM BEFORE I COULD HAVE MANY CONDITIONS AT ONCE
    this.statusTimer = 0;
    this.enginePower = new vec(0, -enginesPower);
    this.status = "ok";    */
}

ship.prototype.checkStatus = function(){
    //switch(this.status){
     //   case "slowed":
    if (this.status.slowed == effectDuration){
        this.enginePower = new vec(0, -enginesPower * 0.2);
    }
    this.status.slowed = Math.max(0, this.status.slowed-1); 
    if (this.status.slowed == 0){
        this.enginePower = new vec(0, -enginesPower);
    }
   // this.status.magnetized = Math.max(0, this.status.magnetized-1);
    
    /*   OLD FUNCTION FROM BEFORE I COULD HAVE MANY STATUSES AT ONCE
    switch(this.status){
        case "slowed":
            if (this.statusTimer == effectDuration){
                this.enginePower = this.enginePower.times(0.2); 
            }
            this.statusTimer = Math.max(0, this.statusTimer-1); 
            if (this.statusTimer == 0){
                this.clearStatus();
            }
            break;
        case "gravitied":
            this.statusTimer = Math.max(0, this.statusTimer-1); 
            if (this.statusTimer == 0){
                this.clearStatus();
            }
        default:
            break;
       
    }*/
}

ship.prototype.takeStep = function(){
    if (!this.exploding){
        this.checkStatus();
        this.hitByMissile();
        if (!this.orbiting || keysList[this.keyScheme.thrust]){
            this.orbiting = false;
            if (keysList[this.keyScheme.thrust] && !this.overheat){
                this.engineTemp += engineCoolingRate + engineHeatingRate;
                this.vel = this.vel.plus(this.enginePower.rot(this.facing).times(dt));
            }
            if (this.status.magnetized > 0){
                //console.log("This  player's position is "+this.pos.x.toFixed(2)+", "+this.pos.y.toFixed(2));
                //console.log("Other player's position is "+this.otherPlayer().pos.x.toFixed(2)+", "+this.otherPlayer().pos.y.toFixed(2));
                var magnetPull = shortestPath(this.pos, this.otherPlayer().pos);
                //console.log("The distance is "+magnetPull.VlengthSq().toFixed(2));
                magnetPull = magnetPull.times(magnetStrength / Math.pow(magnetPull.VlengthSq(),2/3));
                if (this.status.magnetized == effectDuration){
                    magnetPull = magnetPull.times(40);
                }
                //console.log("The pull of the magnet is " + magnetPull.x.toFixed(2) + ", "+magnetPull.y.toFixed(2));
                this.vel = this.vel.plus(magnetPull);
                //console.log("Success!");
                this.status.magnetized--;
            }
            if (this.status.gravitied > 0){
                var extraG = 1 + 6 * this.status.gravityStrength;
                this.status.gravitied--;
                if (this.status.gravitied == 0){
                    this.status.gravityStrength = 0;
                }
            } else {
                var extraG = 1;
            }
            this.freeFall(extraG);
        } else {         
            this.pos = earthToCan(canToEarth(this.pos).rot(this.angularspeed*dt));
            this.vel = this.vel.rot(this.angularspeed*dt);
        }
        if (this.checkCollision()){
            this.exploding = true;
            this.firestate = 0;
        }
        this.rotate();
        this.leaveScreen();
        this.engineTemp = Math.max(0, this.engineTemp-engineCoolingRate);
        if (this.overheat && this.engineTemp == 0){
            this.overheat = false;
        } else if (!this.overheat && this.engineTemp > overheatTemp){
            this.overheat = true;
        }
        if (keysList[this.keyScheme.special] && this.coolDownTimer == 0){
            this.fireWeapon();
            this.coolDownTimer = missileCooldown;
        }
    } else if (this.firestate < explosionLength){
        this.firestate += 1;
        //console.log(this.firestate);
    } else {
        this.crashed = true;
    }
}


ship.prototype.draw = function(){
    if (!this.exploding){
        if (this.overheat){
            this.firestate = (this.firestate+1) % 6;
            if (this.firestate < 4){
                if (this.whichPlayer == 1){
                    drawNineTimes(imageShipOverheating1, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    drawNineTimes(imageShipOverheating1Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            } else {
                if (this.whichPlayer == 1){
                    drawNineTimes(imageShipOverheating2, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    drawNineTimes(imageShipOverheating2Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            }
        } else if (!keysList[this.keyScheme.thrust]){
            if (this.whichPlayer == 1){
                    drawNineTimes(imageShipNoFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    drawNineTimes(imageShipNoFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
        } else {
            this.firestate = (this.firestate+1) % 6;
            if (this.firestate < 3){
                if (this.whichPlayer == 1){
                    drawNineTimes(imageShipFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    drawNineTimes(imageShipFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            } else {
                if (this.whichPlayer == 1){
                    drawNineTimes(imageShipFireAlt, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    drawNineTimes(imageShipFireAltBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            }
        }
    } else {
        if (Math.floor(this.firestate / 3) % 2 == 0){
            drawNineTimes(imageExplosion, this.pos, this.facing, 50, 50, 25, 25);
        } else {
            drawNineTimes(imageExplosion, this.pos, this.facing + Math.PI, 50, 50, 25, 25);
        }
    }
    if (this.otherPlayer().status.magnetized > 0){
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var r = this.otherPlayer().status.magnetized
        var r = Math.abs(r * 7 - 25 * triangularWave(r, 3.3));
        var angle = Math.random(0, 2*Math.PI);
        ctx.arc(this.pos.x, this.pos.y, r, angle, angle + 4);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r/2, angle - 2, angle + 2);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r/4, angle - 1, angle + 1);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r + 5, angle + 1, angle + 5);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
        ctx.stroke();
    }
    this.drawTempBar();
    this.drawCurrentWeapon();
}

function triangularWave(t, a){
    return Math.abs(t/a - Math.floor(t/a + 1/2));
}

ship.prototype.rotate = function(){
    var sign = 0;
    if (keysList[this.keyScheme.moveLeft]){
        sign = 1;
    } else if (keysList[this.keyScheme.moveRight]){
        sign = -1;
    }    
    this.facing += sign * rotationSpeed;
}


ship.prototype.fireMissile = function(){
    if(keysList[this.keyScheme.fire] && this.coolDownTimer == 0 && !this.overheat){
        var outSpeed = new vec(0, -projectileSpeed);
        outSpeed = outSpeed.rot(this.facing);
        outSpeed = outSpeed.plus(this.vel);
        missiles.push(new missile(this.pos, outSpeed, this.whichPlayer));
        this.coolDownTimer = missileCooldown;
        this.engineTemp = Math.min(overheatTemp, this.engineTemp + missileTempIncrease);
        if (this.engineTemp == overheatTemp){
                this.overheat = true;
            }
    } else {
        this.coolDownTimer = Math.max(0, this.coolDownTimer - 1);
    }  
}

ship.prototype.hitByMissile = function(){
    for (j = 0; j < missiles.length; j++){
        if(missiles[j].living == missileLiveTime || missiles[j].firedBy != this.whichPlayer){
            var relPos = missiles[j].pos.plus(this.pos.op());
            var dist = relPos.Vlength();
            if (dist < 27){
                relPos = relPos.rot(this.facing);
                /*console.log("Position of missile is x = "+missiles[j].pos.x+", y = "+missiles[j].pos.y);
                console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
                console.log("Player is facing "+this.facing);
                console.log("relative position is = "+relPos.x+", y = "+relPos.y);*/
                var hit = this.hitbox.collide(relPos);
                if (hit){
                    //console.log("Hit!");
                    successfulMissiles.push(missiles[j]);
                    this.exploding = true;
                    missiles.splice(j, 1);
                    j--;
                }
            }
        }
    }
}

ship.prototype.easyCollide = function(whatHit, size){ //Checks collision against thing. Uses easy hitbox. WhatHit is the position vector of the second object
    var relPos = whatHit.plus(this.pos.op());
    var dist = relPos.Vlength();
    if (dist < 27 + size){
        relPos = relPos.rot(this.facing);
        /*console.log("Position of missile is x = "+missiles[j].pos.x+", y = "+missiles[j].pos.y);
        console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
        console.log("Player is facing "+this.facing);
        console.log("relative position is = "+relPos.x+", y = "+relPos.y);*/
        return this.hitbox.increase(size).collide(relPos);
    } else{
        return false;
    }
}

ship.prototype.drawTempBar = function(){
    if (this.whichPlayer == 1){
        var xPosition = 10;
    } else {
        var xPosition = universeWidth-110;
    }
    var rate = this.engineTemp/overheatTemp;
    if (rate > 0.8 || this.overheat){
        ctx.fillStyle = "#FF0000";
    } else if (rate > 0.4){
        ctx.fillStyle = "#FFFF00";
    } else {
        ctx.fillStyle = "#00DD00";
    }
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(xPosition + hOffset,10 + vOffset,100,10);
    ctx.fillRect(xPosition + hOffset,10 + vOffset,100* rate,10);
    ctx.strokeStyle = "#000000";
}

ship.prototype.drawHitbox = function(){
    
}

ship.prototype.otherPlayer = function(){/////Returns PlayerOne if player two and viceversa
    if (this.whichPlayer == 1){
        return PlayerTwo;
    } else {
        return PlayerOne;
    }
}

ship.prototype.fireWeapon = function(){
    switch (this.weapon){
        case "Mine":
            weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Mine", this.whichPlayer));
            this.ammo -=1;
            if (this.ammo == 0){
                this.weapon = "none";
            }
            break;
        case "Banana":
            weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Banana", this.whichPlayer));
            this.ammo -=1;
            if (this.ammo == 0){
                this.weapon = "none";
            }
            break;
        case "Bomb":
            weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Bomb", this.whichPlayer));
            this.ammo -=1;
            if (this.ammo == 0){
                this.weapon = "none";
            }
            break;
        case "Gravity":
            var outSpeed = new vec(0, -projectileSpeed);
            outSpeed = outSpeed.rot(this.facing);
            outSpeed = outSpeed.plus(this.vel);
            weaponsCurrent.push(new weapon(this.pos, outSpeed, "Gravity", this.whichPlayer));
            this.ammo -=1;
            if (this.ammo == 0){
                this.weapon = "none";
            }
            break;
        case "Top":
            topologyCounter = 6;
            this.weapon = "none";
            break;
        case "Guided":
            var outSpeed = new vec(0, -projectileSpeed);
            outSpeed = outSpeed.rot(this.facing);
            outSpeed = outSpeed.plus(this.vel);
            weaponsCurrent.push(new weapon(this.pos, outSpeed, "Guided", this.whichPlayer));
            //this.ammo = 0;
            //this.weapon = "none";
            break;
        case "Guided3":
            var outSpeed = new vec(0, -projectileSpeed / 1.5);
            outSpeed = outSpeed.rot(this.facing);
            var outSpeed2 = outSpeed.plus(this.vel);
            weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            outSpeed = outSpeed.rot(Math.PI/4);
            var outSpeed2 = outSpeed.plus(this.vel);
            weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            outSpeed = outSpeed.rot(- Math.PI/2);
            var outSpeed2 = outSpeed.plus(this.vel);
            weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            this.ammo = 0;
            this.weapon = "none";
            break;
        case "Magnet":
            this.otherPlayer().status.magnetized = effectDuration;
            this.otherPlayer().orbiting = false;
            this.ammo -=1;
            if (this.ammo == 0){
                this.weapon = "none";
            }
            break;
        default:
            this.weapon = "none";
            break;
    }
}

ship.prototype.drawCurrentWeapon = function(){
    if (this.whichPlayer == 1){
        var xPosition = 130;
    } else {
        var xPosition = universeWidth-160;
    }
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(xPosition + hOffset,10 + vOffset,30,30);
    ctx.strokeStyle = "#000000";
    switch (this.weapon){
        case "Mine":
            ctx.drawImage(imageMine, xPosition + hOffset, 10 + vOffset, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2 + hOffset, 23 + vOffset);
            break;
        case "Banana":
            ctx.drawImage(imageBanana, xPosition + hOffset, 10 + vOffset, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2 + hOffset, 23 + vOffset);
            break;
        case "Gravity":
            ctx.drawImage(imageGravity, xPosition + hOffset, 10 + vOffset, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2 + hOffset, 23 + vOffset);
            break;
        case "Bomb":
            ctx.drawImage(imageBomb, xPosition + hOffset, 10 + vOffset, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2 + hOffset, 23 + vOffset);
            break;
        case "Top":
            ctx.drawImage(imageTop, xPosition + hOffset, 10 + vOffset, 30, 30);
            break;
        case "Guided":
            ctx.drawImage(imageMissile, xPosition + 8 + hOffset, 10 + vOffset, 14, 30);/*
            ctx.fillStyle = "yellow";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText("1", xPosition + 1, 23);*/
            break;
         case "Guided3":
            ctx.drawImage(imageMissile, xPosition  + hOffset    , 12 + vOffset, 12, 27);
            ctx.drawImage(imageMissile, xPosition + 8  + hOffset, 12 + vOffset, 12, 27);
            ctx.drawImage(imageMissile, xPosition + 16 + hOffset, 12 + vOffset, 12, 27);/*
            ctx.fillStyle = "yellow";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText("1", xPosition + 1, 23);*/
            break;
        case "Magnet":
            ctx.drawImage(imageMagnet, xPosition + hOffset, 10 + vOffset, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2 + hOffset, 23 + vOffset);
            break;
        default:
            break;
    }
}

////////////////// THE CLASS FOR MISSILES ///////////////


function missile(pos, vel, who){
    flyingThing.call(this, pos, vel);
    this.crashed = false;
    this.living = 0;
    this.firedBy = who;
    this.history = [];
}


missile.prototype = Object.create(flyingThing.prototype);
missile.prototype.constructor = missile;

function drawMissile(x,y){
    ctx.beginPath();
    ctx.arc(x + hOffset, y + vOffset, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

missile.prototype.draw = function(){
    if (this.firedBy == 1){
        ctx.fillStyle = "red";
    } else {
        ctx.fillStyle = "#00FF00";
    }
    drawMissile(this.pos.x, this.pos.y);
    /*ctx.beginPath();
    ctx.arc(this.pos.x + hOffset, this.pos.y + vOffset, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();*/
     ///// Draws something 9 times depending on the surface
    var xFlip = isXflipped();
    var yFlip = isYflipped();
    if (!xFlip){
        drawMissile(this.pos.x, this.pos.y + universeHeight); //Down
        drawMissile(this.pos.x, this.pos.y - universeHeight); //Up
        if (!yFlip){
            drawMissile(this.pos.x + universeWidth, this.pos.y + universeHeight);
            drawMissile(this.pos.x - universeWidth, this.pos.y + universeHeight);
            drawMissile(this.pos.x + universeWidth, this.pos.y - universeHeight);
            drawMissile(this.pos.x - universeWidth, this.pos.y - universeHeight);
        } else {
            drawMissile(this.pos.x + universeWidth, - this.pos.y + 2 * universeHeight);
            drawMissile(this.pos.x - universeWidth, - this.pos.y + 2 * universeHeight);
            drawMissile(this.pos.x + universeWidth, - this.pos.y);
            drawMissile(this.pos.x - universeWidth, - this.pos.y);
        }
    } else {
        drawMissile(- this.pos.x + universeWidth, this.pos.y + universeHeight); //Down
        drawMissile(- this.pos.x + universeWidth, this.pos.y - universeHeight); //Up
        if (!yFlip){
            drawMissile(- this.pos.x + 2 * universeWidth, this.pos.y + universeHeight);
            drawMissile(- this.pos.x                    , this.pos.y + universeHeight);
            drawMissile(- this.pos.x + 2 * universeWidth, this.pos.y - universeHeight);
            drawMissile(- this.pos.x                    , this.pos.y - universeHeight);
        } else {
            drawMissile(- this.pos.x + 2 * universeWidth, - this.pos.y + 2 * universeHeight);
            drawMissile(- this.pos.x                    , - this.pos.y + 2 * universeHeight);
            drawMissile(- this.pos.x + 2 * universeWidth, - this.pos.y);
            drawMissile(- this.pos.x                    , - this.pos.y);
        }
    }
    if (!yFlip){
        drawMissile(this.pos.x + universeWidth, this.pos.y);
        drawMissile(this.pos.x - universeWidth, this.pos.y);
    } else {
        drawMissile(this.pos.x + universeWidth, - this.pos.y + universeHeight);
        drawMissile(this.pos.x - universeWidth, - this.pos.y + universeHeight);
    }
}

missile.prototype.takeStep = function(){
    this.freeFall();
    if (this.checkCollision()){
        this.crashed = true;
    }
    this.leaveScreen();
    if (this.living < missileLiveTime){
        this.living += 1;
    }
}

function specialEffects(){
    if (GravityWarpTimer == effectDuration){
        //console.log("Graviting!");
        G = G*5;
    }
    if (GravityWarpTimer > 0) {
        GravityWarpTimer --;
        if (GravityWarpTimer == 0){
            G = defaultG;
        }
    }
}

function clearSpecialEffects(){
    GravityWarpTimer = 0;
    G = defaultG;
}



var playing = true;

function ScreenOfRestarting(){
    scene = "GameOver";
    
    /*if (keysList[rKey]){
        startTheGame();
    } else {
       // window.requestAnimationFrame(restartScreen);
    }*/
};

missile.prototype.backInTime = function(i){
    this.pos = this.history[i];
}

weapon.prototype.backInTime = function(i){
    this.pos = this.history[i].pos;
    this.vel = this.history[i].vel;
    this.living--;
}

async function drawSuccessfulMissiles(){
    for (j = 0; j < successfulMissiles.length; j++){
        for (i = successfulMissiles[j].history.length; i > 0; i--){
            successfulMissiles[j].backInTime(i - 1);
            successfulMissiles[j].draw();
            await sleep(20);
            if (successfulMissiles == []){
                i = 0;
            }
        }
    }
}

function gameOver(){
    scene = "GameOver";
    drawBackground();
    drawEyes();
    PlayerOne.draw();
    PlayerTwo.draw();
    drawSuccessfulMissiles().then(
        function(){
            ctx.font = "30px Monoton";
            ctx.textAlign = "center";
            if (winner == "none"){
                ctx.fillStyle = "red";
                ctx.fillText("You both lose", gameWidth/2, gameHeight/2);
            } else if (winner == "P1") {
                ctx.fillStyle = "yellow";
                ctx.fillText("Player one wins", gameWidth/2, gameHeight/2);
                score[0]++;
            } else {
                ctx.fillStyle = "turquoise";
                ctx.fillText("Player two wins", gameWidth/2, gameHeight/2);
                score[1]++;
            }
            ctx.fillText("Press R to restart", gameWidth/2, gameHeight*3/4); 
            ctx.fillText("Press M to go to the Menu", gameWidth/2, gameHeight*3/4+60);
            showScore();
        }
    );
};

function playAnim(){
    var currTime = Date.now();
    if (currTime - then > 40 && playing && !paused){        
        then = Date.now();
        drawBackground();
        showScore();
        PlayerOne.takeStep();
        PlayerTwo.takeStep();
        PlayerOne.draw();
        PlayerTwo.draw();
        if (PlayerOne.crashed || PlayerTwo.crashed){
            playing = false;
            winner = "none";
            if (!PlayerOne.exploding){
                winner = "P1";
            } else if (!PlayerTwo.exploding){
                winner = "P2";
            }
        }
        PlayerOne.fireMissile();
        PlayerTwo.fireMissile();
        for (var m = 0; m < missiles.length; m++){
            missiles[m].history.push(missiles[m].pos);
            missiles[m].takeStep();
            missiles[m].draw();
            if (missiles[m].crashed){
                missiles.splice(m, 1);
                m--;
            }
        }
        dealWithBoxes();
        floatingBox.draw();
        drawEyes();
        dealWithWeapons();
        specialEffects();
        if (playing && !paused){
            window.requestAnimationFrame(playAnim);
        }
    } else {
        if (playing && !paused){
            window.requestAnimationFrame(playAnim);
        }
    }
    if (!playing){
        gameOver();
    }
};

function startTheGame(){
    mode = "Torus";
    starDisplay = [];
    getBackground(100);
    drawBackground();
    missiles = [];
    successfulMissiles = [];
    weaponsCurrent = [];
    clearSpecialEffects();
    PlayerOne = new ship(new vec(universeWidth/4,300), 1, Math.PI, p1Keys);
    PlayerTwo = new ship(new vec(3*universeWidth/4,300), 2, 0, p2Keys);
    PlayerOne.setAngularSpeed();
    PlayerTwo.setAngularSpeed();
    if (Math.floor(Math.random()*2) > 0){
        eyesChasing = PlayerOne;
    } else {
        eyesChasing = PlayerTwo;
    }
    playing = true;
    then = Date.now();
    scene = "start";
    resetWeaponTimer();
    floatingBox = new presentBox(null);
    floatingBox.existing = false;
    playAnim();
};

function showScore(){
    ctx.font = "20px Bungee Shade";
    ctx.textAlign = "center";
    ctx.fillStyle = "yellow";
    ctx.fillText(score[0], universeWidth/2-30 + hOffset, 25 + vOffset);
    ctx.fillStyle = "turquoise";
    ctx.fillText(score[1], universeWidth/2+30 + hOffset, 25 + vOffset);
    ctx.fillStyle = "white";
    ctx.fillText("-", universeWidth/2 + hOffset, 25 + vOffset);
}

function showMenu(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,1000,1000);
    scene = "menu";
    starDisplay = [];
    getBackground(50);
    drawBackground();
    if (Math.floor(Math.random()*2) > 0){
        ctx.fillStyle = "turquoise";
    } else {
        ctx.fillStyle = "yellow";
    }
    ctx.font = "100px Faster One";
    ctx.textAlign = "center";
    ctx.fillText("Cosmic", gameWidth/2, gameHeight/2-150);
    ctx.fillText("Coconut!", gameWidth/2, gameHeight/2-20);
    ctx.font = "30px Bungee Shade";
    ctx.fillText("Press S to start", gameWidth/2, 3* gameHeight/4);
    ctx.fillText("Press O for options", gameWidth/2, 3* gameHeight/4 + 70);
    //ctx.fillText("Press C for credits", gameWidth/2, 3* gameHeight/4 + 100);
   // ctx.font = "20px Bungee Shade";
    //ctx.fillText("In nomin: Eva", gameWidth/2, 3* gameHeight/4+40);
}

function showOptions(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,1000,1000);
    scene = "options";
    starDisplay = [];
    getBackground(50);
    drawBackground();
    ctx.fillStyle = "white"
    ctx.font = "100px Faster One";
    ctx.fillText("Options", gameWidth/2, 100);
    ctx.font = "40px Bungee Shade";
    ctx.textAlign = "left";
    ctx.fillText("Controls", 30, 200);
    ctx.font = "18px Bungee Shade";
    ctx.textAlign = "center";
    ctx.fillText("Press M to go back to menu", gameWidth/2, gameHeight - 50);
    document.getElementById("controls").style.display = "table";
    showControlButtons();
}

document.getElementById("p1left").addEventListener("click", function(){
    changeControls(p1Keys, "left", "p1left");
});
document.getElementById("p1right").addEventListener("click", function(){
    changeControls(p1Keys, "right", "p1right");
});
document.getElementById("p1thrust").addEventListener("click", function(){
    changeControls(p1Keys, "thrust", "p1thrust");
});
document.getElementById("p1fire").addEventListener("click", function(){
    changeControls(p1Keys, "fire", "p1fire");
});
document.getElementById("p1special").addEventListener("click", function(){
    changeControls(p1Keys, "special", "p1special");
});
document.getElementById("p2left").addEventListener("click", function(){
    changeControls(p2Keys, "left", "p2left");
});
document.getElementById("p2right").addEventListener("click", function(){
    changeControls(p2Keys, "right", "p2right");
});
document.getElementById("p2thrust").addEventListener("click", function(){
    changeControls(p2Keys, "thrust", "p2thrust");
});
document.getElementById("p2fire").addEventListener("click", function(){
    changeControls(p2Keys, "fire", "p2fire");
});
document.getElementById("p2special").addEventListener("click", function(){
    changeControls(p2Keys, "special", "p2special");
});
document.getElementById("symmetricControls").addEventListener("click", function(){
    symmetricControls();
    showControlButtons();
});

function symmetricControls(){ //Makes player one have the same controls as P2
    p1Keys.changeKey("left",p2Keys.moveLeft);
    p1Keys.changeKey("right",p2Keys.moveRight);
    p1Keys.changeKey("thrust",p2Keys.thrust);
    p1Keys.changeKey("fire",p2Keys.fire);
    p1Keys.changeKey("special",p2Keys.special);
}

function changeControls(whichPlayer, whichKey, buttonId){
    if (whichKeyIsChanging != null){
        showControlButtons();
    }
    document.getElementById(buttonId).innerHTML = "Choose key now";
    changingKey = true;
    //console.log(whichKeyIsChanging);
    whichKeyIsChanging = [whichPlayer, whichKey, buttonId];
}

function showControlButtons(){
    document.getElementById("p1left").innerHTML = stringFromCharCode(p1Keys.moveLeft);
    document.getElementById("p1right").innerHTML = stringFromCharCode(p1Keys.moveRight);
    document.getElementById("p1thrust").innerHTML = stringFromCharCode(p1Keys.thrust);
    document.getElementById("p1fire").innerHTML = stringFromCharCode(p1Keys.fire);
    document.getElementById("p1special").innerHTML = stringFromCharCode(p1Keys.special);
    document.getElementById("p2left").innerHTML = stringFromCharCode(p2Keys.moveLeft);
    document.getElementById("p2right").innerHTML = stringFromCharCode(p2Keys.moveRight);
    document.getElementById("p2thrust").innerHTML = stringFromCharCode(p2Keys.thrust);
    document.getElementById("p2fire").innerHTML = stringFromCharCode(p2Keys.fire);
    document.getElementById("p2special").innerHTML = stringFromCharCode(p2Keys.special);
    
}


function showCredits(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,1000,1000);
    scene = "credits";
    starDisplay = [];
    getBackground(50);
    drawBackground();
    var randomNo = Math.floor(5*Math.random());
    var moisesTask;
    switch (randomNo){
        case 0:
            moisesTask = "Potato peeling"
            break;
        case 1:
            moisesTask = "Extreme napping"
            break;
        case 2:
            moisesTask = "Cheeto tasting"
            break;
        case 3:
            moisesTask = "Water smelling"
            break;
        case 4:
            moisesTask = "Synergy deconstructing"
            break;
    }
    randomNo = Math.floor(12*Math.random());
    var sponsor;
    switch (randomNo){
        case 0:
            sponsor = "Puleva"
            break;
        case 1:
            sponsor = "Panrico"
            break;
        case 2:
            sponsor = "Bimbo"
            break;
        case 3:
            sponsor = "AhorraMás"
            break;
        case 4:
            sponsor = "Hipercor"
            break;
        case 5:
            sponsor = "Amena"
            break;
        case 6:
            sponsor = "Ikea"
            break;
        case 7:
            sponsor = "Sony"
            break;
        case 8:
            sponsor = "Purificación García"
            break;
        case 9:
            sponsor = "Juteco"
            break;
        case 10:
            sponsor = "Renfe"
            break;
        case 11:
            sponsor = "Canal de Isabel II"
            break;
    }
    ctx.fillStyle = "orange"
    ctx.font = "100px Faster One";
    ctx.fillText("Credits", gameWidth/2, 100);
    ctx.font = "25px Bungee Shade";
    ctx.textAlign = "left";
    ctx.fillText("Original idea", 30, 230);
    ctx.fillText("Googly eyes", 30, 290);
    ctx.fillText(moisesTask, 30, 350);
    ctx.fillText("Corporate partnership", 30, 410);
    ctx.textAlign = "right";
    ctx.fillText("Spacewar!", gameWidth - 30, 230);
    ctx.fillText("Eva",  gameWidth - 30, 290);
    ctx.fillText("Moisés",  gameWidth - 30, 350);
    ctx.fillText(sponsor,  gameWidth - 30, 410);
    ctx.textAlign = "center";
    ctx.font = "15px Bungee Shade";
    ctx.fillText("Press M to go back to menu", gameWidth/2, gameHeight - 100);
}

function pause(){
    paused = true;
    ctx.fillStyle = "red";
    ctx.font = "90px Monoton";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", gameWidth/2, gameHeight/2);
}

function unPause(){
    paused = false;
    playAnim();
}

function finishLoading(){
    //console.log("Loaded");
    document.getElementById("LoadingMessage").style.color = "#000033";
    area.style.display = "inline";
    showMenu();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  await sleep(2000);
  finishLoading();
}

window.onload = demo();


/*
Do division instead of substraction in the function LeaveScreen

Add googly eyes to planet - DONE

Start menu - DONE

Am I sure about hitbox?

WEAPONS IDEAS:
Missile xx
Guided missile xx
Mine xx
Banana xx
Sudden repelling thing
Sudden attracting thing xx
Control jammer
Nitrous oxide
Increase gravity xx
Random ?!
Asteroid rain
Wormhole
Universe breaks and topology changes xx


Random gravity

Make box have attractive animation xx
Make box open

KillCam


*/



