
/*global window, document, Image, module*/

/* jshint -W030, -W119*/

/*jshint esversion:6*/

var displayingGraphics;
if (typeof window === "undefined"){
    displayingGraphics = false;
} else {
    displayingGraphics = true;
}
var then;                   //Time of last animation frame



function graphicalInfo(u) {
    this.gameWidth = window.innerWidth;    //Width of game zone in pixels
    this.gameHeight = window.innerHeight;   //Height of game zone in pixels
    this.numberofScreensH = Math.ceil(this.gameWidth / (u.universeWidth * 2) - 1 / 2);
    this.numberofScreensV = Math.ceil(this.gameHeight / (u.universeHeight * 2) - 1 / 2);
    this.hOffset = (this.gameWidth - u.universeWidth) / 2; // Where the (0,0) for drawing is relative to the canvas coordinates
    this.vOffset = (this.gameHeight - u.universeHeight) / 2; // Where the (0,0) for drawing is relative to the canvas coordinates
    this.bgColor = "#000000";  //Color of the sky backdrop
    this.starColor = "#FFFFFF";  //Color of the background stars
}

function makeContext(g) {
    this.area = document.getElementById("gameZone");
    this.area.width = g.gameWidth;
    this.area.style.width = g.gameWidth + "px";
    this.area.height = g.gameHeight;
    this.area.style.height = g.gameHeight + "px";
    this.ctx = this.area.getContext("2d");
}



function gameStatus() {
    this.scene = "menu";        //Scene: possibilities: "start", "GameOver", "menu"
    this.winner = "none";        //Winner of the last game  
    this.playing = true;
    this.score = [0, 0];          //Initial score
    this.paused = false;
    this.changingKey = false;        //For changing controls   
    this.whichKeyIsChanging = null; //For changing controls
    this.onePlayer = true;
    this.keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
    this.p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
    this.p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);
    this.weaponTypes = [{type:"Mine",       exists:true, src:"imageMine"},
                        {type:"Banana",     exists:true, src:"imageBanana"},
                        {type:"Gravity",    exists:true, src:"imageGravity"},
                        {type:"Top",        exists:true, src:"imageTop"},
                        {type:"Guided",     exists:true, src:"imageMissile"},
                        {type:"Guided3",    exists:true, src:"imageMissile3"},
                        {type:"Magnet",     exists:true, src:"imageMagnet"},
                        {type:"Bomb",       exists:true, src:"imageBomb"}];
}





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





/////// All the images //////////////////////////////////////////
function getImages() {
    this.imageShipNoFire = new Image();  //Image of ship
    this.imageShipNoFire.src = 'ShipNoFire.png';
    this.imageShipFire = new Image();  //Image of ship
    this.imageShipFire.src = 'ShipFire.png';
    this.imageShipFireAlt = new Image();  //Image of ship
    this.imageShipFireAlt.src = 'ShipFire2.png';
    this.imageShipOverheating1 = new Image();  //Image of ship
    this.imageShipOverheating1.src = 'ShipOverheating1.png';
    this.imageShipOverheating2 = new Image();  //Image of ship
    this.imageShipOverheating2.src = 'ShipOverheating2.png';
    this.imageExplosion = new Image();  //Image of ship
    this.imageExplosion.src = 'Explosion1.png';
    this.imageBigExplosion = new Image();  //Image of explosion
    this.imageBigExplosion.src = 'Explosion2.png';
    this.imageShipNoFireBlue = new Image();  //Image of ship
    this.imageShipNoFireBlue.src = 'ShipNoFire_blue.png';
    this.imageShipFireBlue = new Image();  //Image of ship
    this.imageShipFireBlue.src = 'ShipFire_blue.png';
    this.imageShipFireAltBlue = new Image();  //Image of ship
    this.imageShipFireAltBlue.src = 'ShipFire2_blue.png';
    this.imageShipOverheating1Blue = new Image();  //Image of ship
    this.imageShipOverheating1Blue.src = 'ShipOverheating1_blue.png';
    this.imageShipOverheating2Blue = new Image();  //Image of ship
    this.imageShipOverheating2Blue.src = 'ShipOverheating2_blue.png';
    this.imageEarth = new Image();
    this.imageEarth.src = 'Planet.png';
    this.imageBox = new Image();
    this.imageBox.src = 'Box.png';
    this.imageMine = new Image();
    this.imageMine.src = 'Mine.png';
    this.imageBanana = new Image();
    this.imageBanana.src = 'Banana.png';
    this.imageGravity = new Image();
    this.imageGravity.src = 'Gravity.png';
    this.imageMissile = new Image();
    this.imageMissile.src = 'Missile.png';
    this.imageMissile3 = new Image();
    this.imageMissile3.src = 'Missile3.png';
    this.imageMissileNoFire = new Image();
    this.imageMissileNoFire.src = 'MissileNoFire.png';
    this.imageLightning = new Image();
    this.imageLightning.src = 'Lightning.png';
    this.imageTop = new Image();
    this.imageTop.src = 'Topologizer.png';
    this.imageMagnet = new Image();
    this.imageMagnet.src = 'Magnet.png';
    this.imageBomb = new Image();
    this.imageBomb.src = 'Bomb.png';
    this.imageSpark = new Image();
    this.imageSpark.src = 'Spark.png';
    this.imageHCrack = new Image();
    this.imageHCrack.src = 'HCrack.png';
    this.imageVCrack = new Image();
    this.imageVCrack.src = 'VCrack.png';
}


/////// VECTORS //////////////////////////////////////////

function vec(x, y) {   ///Vector operations   ////////////////////////
    this.x = x;
    this.y = y;
    this.times = function (l) {
        return (new vec(this.x * l, this.y * l));
    };
    this.plus = function (v) {
        return new vec(this.x + v.x, this.y + v.y);
    };
    this.op =  function () {
        return new vec(-this.x, -this.y);
    };
    this.VlengthSq = function () {
        return this.x * this.x + this.y * this.y;
    };
    this.Vlength = function () {
        return Math.sqrt(this.VlengthSq());
    };
    this.rot = function (angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            rotX = this.x * cos + this.y * sin,
            rotY = this.x * (-sin) + this.y * cos;
        return new vec(rotX, rotY);
    };
    this.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    this.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    this.flipHor = function (u) {
        return new vec(u.universeWidth - this.x, this.y);
    };
    this.flipVer = function (u) {
        return new vec(this.x, u.universeHeight - this.y);
    };
    this.flipVyH = function (u) {
        return new vec(u.universeWidth - this.x, u.universeHeight - this.y);
    };
    this.toAngle = function () {//Returns the angle that the vector is facing towards, in radians. It is measured from "up"=0, and "left"=PI/2
        var answer = Math.atan(this.x/this.y);
        if (this.y > 0) {
            answer = answer + Math.PI;
        }
        return answer;
    };
    this.projectOn = function (v) {
        return v.times(this.dot(v)/v.VlengthSq());
    };
}

function shortestPath(v, w, u) {//Finds shortest path from v to w (depends on "mode"), returns the vector that gives said path. u is the universe
    var PossiblePaths = [w.plus(v.op())];
    switch (u.mode) {
            case "Torus":
                PossiblePaths.push(w.plus(new vec(u.universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-u.universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(u.universeWidth,    u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(u.universeWidth,    -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-u.universeWidth,   u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-u.universeWidth,   -u.universeHeight))   .plus(v.op()));
                break;
            case "InvertX":
                PossiblePaths.push(w.plus(new vec(u.universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(-u.universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(0,            u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(0,            -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(u.universeWidth,    u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(u.universeWidth,    -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(-u.universeWidth,   u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(-u.universeWidth,   -u.universeHeight))   .plus(v.op()));
                break;
            case "InvertY":
                PossiblePaths.push(w.flipVer(u).plus(new vec(u.universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(-u.universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.plus(new vec(0,            -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(u.universeWidth,    u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(u.universeWidth,    -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(-u.universeWidth,   u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(-u.universeWidth,   -u.universeHeight))   .plus(v.op()));
                break;
            case "RP2":
                PossiblePaths.push(w.flipVer(u).plus(new vec(u.universeWidth,    0))             .plus(v.op()));
                PossiblePaths.push(w.flipVer(u).plus(new vec(-u.universeWidth,   0))             .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(0,            u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipHor(u).plus(new vec(0,            -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVyH(u).plus(new vec(u.universeWidth,    u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVyH(u).plus(new vec(u.universeWidth,    -u.universeHeight))   .plus(v.op()));
                PossiblePaths.push(w.flipVyH(u).plus(new vec(-u.universeWidth,   u.universeHeight))    .plus(v.op()));
                PossiblePaths.push(w.flipVyH(u).plus(new vec(-u.universeWidth,   -u.universeHeight))   .plus(v.op()));
                break;
        }
    var minLength = 1000000;
    var minPathIndex = -1;
    for (var pathIndex = 0; pathIndex < 9; pathIndex++) {
        var lengthAttempt = PossiblePaths[pathIndex].VlengthSq();
        if (lengthAttempt < minLength) {
            minLength = lengthAttempt;
            minPathIndex = pathIndex;
        }
    }
    //console.log("Length is "+Math.sqrt(minLength));
    return PossiblePaths[minPathIndex];
}

////////////Placing a rotated image ////////////////////////////////////////////////////////////////////////
//VDisplacement from the top, where the center of mass should be

function moveAScreen(v, hMove, vMove, u) { ////Gives the coordinates of the vector v, after translating it to the copy of the universe in coordinates (hMove, vMove)
    var a = new vec(v.x, v.y);
    //console.log(u.mode);
    if (isXflipped(u) && Math.abs(vMove) % 2 == 1) {
        a = a.flipHor(u);
    }
    if (isYflipped(u) && Math.abs(hMove) % 2 == 1) {
        a = a.flipVer(u);
    }
    a = a.plus(new vec(hMove * u.universeWidth, vMove * u.universeHeight));
    return a;
}

/*
function moveAngleAScreen(angle, hMove, vMove, u) { ////Gives the facing angle, after translating it to the copy of the universe in coordinates (hMove, vMove)
    var a = angle;
    if (isXflipped(u) && Math.abs(vMove) % 2 == 1) {
        a = - a;
    }
    if (isYflipped(u) && Math.abs(hMove) % 2 == 1) {
        a = Math.PI - a;
    }
    return a;
}
*/

function placeInCanvas(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace, flip, c, g) { ////Draws something in given coordinates (once).  Flip = {x:true, y:true}, c contains the canvas
    if (flip.x) {
        c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
    }
    if (flip.y) {
        c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
    }
    c.ctx.translate(position.x + g.hOffset, position.y + g.vOffset);
    c.ctx.rotate(-angle);
    c.ctx.drawImage(imgObject, -Hdisplace, -Vdisplace, imgW, imgH);
    c.ctx.rotate(angle);
    c.ctx.translate(-position.x - g.hOffset, -position.y - g.vOffset);
    if (flip.x) {
        c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
    }
    if (flip.y) {
        c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
    }
}

function drawNineTimes(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace, c, g, u) { ///// Draws something 9 times depending on the surface
    for (var i = - g.numberofScreensH; i < g.numberofScreensH + 1; i++) {
        for (var j = - g.numberofScreensV; j < g.numberofScreensV + 1; j++) {
            //console.log(u.mode);
            var flip ={x:isXflipped(u) && j % 2 !== 0,
                       y:isYflipped(u) && i % 2 !== 0};
            placeInCanvas(imgObject, position.plus(new vec(i * u.universeWidth, j * u.universeHeight)), angle, imgW, imgH, Hdisplace, Vdisplace, flip, c, g);
            //console.log("Drawing: "+ moveAScreen(position,i,j, u));
        }
    } 
    /*
    var xFlip = isXflipped(u);
    var yFlip = isYflipped(u);
    placeInCanvas(imgObject, position, angle, imgW, imgH, Hdisplace, Visplace, c, g);
    if (!xFlip) {
        placeInCanvas(imgObject, position.plus(new vec(0, u.universeHeight))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g); //Down
        placeInCanvas(imgObject, position.plus(new vec(0, - u.universeHeight)), angle         , imgW, imgH, Hdisplace, Visplace, c, g); //Up
        if (!yFlip) {
            placeInCanvas(imgObject, position.plus(new vec(u.universeWidth, u.universeHeight))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g); //downRight
            placeInCanvas(imgObject, position.plus(new vec(u.universeWidth, -u.universeHeight))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g); //UpRight
            placeInCanvas(imgObject, position.plus(new vec(-u.universeWidth, u.universeHeight))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g); //DownLeft
            placeInCanvas(imgObject, position.plus(new vec(-u.universeWidth, -u.universeHeight))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g); //UpLeft
        } else {
            placeInCanvas(imgObject, position.flipVer(u).plus(new vec(u.universeWidth, u.universeHeight))  , Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).plus(new vec(- u.universeWidth, u.universeHeight)), Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).plus(new vec(u.universeWidth,- u.universeHeight))  , Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).plus(new vec(- u.universeWidth,- u.universeHeight)), Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
        }
    } else {
        placeInCanvas(imgObject, position.flipHor(u).plus(new vec(0, u.universeHeight))  , - angle, imgW, imgH, Hdisplace, Visplace, c, g);
        placeInCanvas(imgObject, position.flipHor(u).plus(new vec(0, - u.universeHeight)), - angle, imgW, imgH, Hdisplace, Visplace, c, g);
        if (!yFlip) {
            placeInCanvas(imgObject, position.flipHor(u).plus(new vec(u.universeWidth, u.universeHeight))  , - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipHor(u).plus(new vec(u.universeWidth, - u.universeHeight)), - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipHor(u).plus(new vec(-u.universeWidth, u.universeHeight))  , - angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipHor(u).plus(new vec(-u.universeWidth, - u.universeHeight)), - angle, imgW, imgH, Hdisplace, Visplace, c, g);
        } else {
            placeInCanvas(imgObject, position.flipVer(u).flipHor(u).plus(new vec(u.universeWidth, u.universeHeight))  , Math.PI + angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).flipHor(u).plus(new vec(- u.universeWidth, u.universeHeight)), Math.PI + angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).flipHor(u).plus(new vec(u.universeWidth,- u.universeHeight))  , Math.PI + angle, imgW, imgH, Hdisplace, Visplace, c, g);
            placeInCanvas(imgObject, position.flipVer(u).flipHor(u).plus(new vec(- u.universeWidth,- u.universeHeight)), Math.PI + angle, imgW, imgH, Hdisplace, Visplace, c, g);
        }
    }
    if (!yFlip) {
        placeInCanvas(imgObject, position.plus(new vec(u.universeWidth, 0))  , angle         , imgW, imgH, Hdisplace, Visplace, c, g);
        placeInCanvas(imgObject, position.plus(new vec(- u.universeWidth, 0)), angle         , imgW, imgH, Hdisplace, Visplace, c, g);
    } else {
        placeInCanvas(imgObject, position.flipVer(u).plus(new vec(u.universeWidth, 0))  , Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
        placeInCanvas(imgObject, position.flipVer(u).plus(new vec(- u.universeWidth, 0)), Math.PI - angle, imgW, imgH, Hdisplace, Visplace, c, g);
    }  */
}


function canToEarth(v, u) { //Changes a vector from coordinates with respect to canvas to coordinates w.r.t. Earth
    return v.plus(u.O.op());
}

function earthToCan(v, u) { //Changes a vector from coordinates with respect to Earth to coordinates w.r.t. canvas
    return v.plus(u.O);
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

function stringFromCharCode(code) { //// The string that is displayed in the "controls" window
    if (code == leftKey) {
        return "Left";
    } else if (code == rightKey) {
        return "Right";
    } else if (code == upKey) {
        return "Up";
    } else if (code == downKey) {
        return "Down";
    } else if (code == spaceBar) {
        return "Space Bar";
    } else if (code == rShift) {
        return "Shift";
    } else if (code == tab) {
        return "tab";
    } else if (code == enter) {
        return "enter";
    } else {
        return String.fromCharCode(code);
    }
}

////////// Default controls  /////////////////////////////////

function setKeyListeners(c, g, imgList, status, u){
    status.keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
    window.onkeyup = function (e) {
        status.keysList[e.keyCode]=false;
        };
    window.onkeydown = function (e) {status.keysList[e.keyCode]=true;
                                   //console.log(e.keyCode);
                                   if (e.keyCode == leftKey || e.keyCode == rightKey || e.keyCode == upKey || e.keyCode == downKey || e.keyCode == spaceBar) { ////////// Don't scroll with special keys ///////////
                                       e.preventDefault();
                                   }
                                   if (status.changingKey) { ////////// Are we in the screen where controls are changed? ///////////
                                        //console.log("Changing the key "+status.whichKeyIsChanging);
                                        status.whichKeyIsChanging[0].changeKey(status.whichKeyIsChanging[1], e.keyCode);
                                        //console.log("Keypressed: "+e.keyCode);
                                        //console.log("The letter is "+stringFromCharCode(e.keyCode));
                                        document.getElementById(status.whichKeyIsChanging[2]).innerHTML = stringFromCharCode(e.keyCode);
                                        status.changingKey = false;
                                        status.whichKeyIsChanging = null;
                                        //console.log("Changed to "+status.p1Keys.moveLeft);
                                    }              
    };

    window.onkeypress = function () {
        if(status.scene =="GameOver") {
            if (status.keysList[rKey]) {
                startTheGame(c, g, imgList, status, u);
            } else if (status.keysList[mKey]) {
                showMenu(c, g, imgList, status, u);
            }
        }
        if (status.scene =="menu") {
            if (status.keysList[sKey]) {
                startTheGame(c, g, imgList, status, u);
            } else if (status.keysList[oKey]) {
                showOptions(c, g, imgList, status, u);
            } else if (status.keysList[cKey]) {
                showCredits(c, g, imgList, status, u);
            }
        }
        if (status.scene =="options" || status.scene =="credits") {
            if (status.keysList[mKey]) {
                document.getElementById("options").style.display = "none";
                    showMenu(c, g, imgList, status, u);
            }
        }
        if (status.scene =="start") {
            if (status.keysList[pKey] && !status.paused) {
                pause(c, g, status);
            } else if (status.keysList[pKey] && status.paused) {
                unPause(c, g, imgList, status, u);
            }
        }
        if (status.paused && status.keysList[mKey]) {
            status.paused = false;
            showMenu(c, g, imgList, status, u);
        }

    };
}

////////////////////// Object that stores controls for a given player /////////////////////////////////

function keySet(moveLeft, moveRight, thrust, fire, special) {
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.thrust = thrust;
    this.fire = fire;
    this.special = special;
}

keySet.prototype.changeKey = function (whichKey, newCode) {
    switch (whichKey) {
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
};


//////// THE BACKGROUND   ////////////////////////


function getBackground(starNumber, u) {    //Makes a list of star positions
    u.starDisplay = [];
    for (var i = 0; i < starNumber; i++) {
        var x = Math.floor(Math.random()*u.universeWidth);
        var y = Math.floor(Math.random()*u.universeHeight);
        u.starDisplay.push(new vec(x,y));
    }   
}

function flipStarDisplay(HV, LRUD, u) { ////////////////////// When universe is changed by topologizer, stars flip too //////////////////////
    for (var s = 0; s < u.starDisplay.length; s++) {
        if(HV == "H" && LRUD == "U") {
            if (u.starDisplay[s].y < u.universeHeight/2) {
                u.starDisplay[s].x = u.universeWidth - u.starDisplay[s].x;
            }
        }
        if(HV == "H" && LRUD == "D") {
            if (u.starDisplay[s].y > u.universeHeight/2) {
                u.starDisplay[s].x = u.universeWidth - u.starDisplay[s].x;
            }
        }
        if(HV == "V" && LRUD == "L") {
            if (u.starDisplay[s].x < u.universeWidth/2) {
                u.starDisplay[s].y = u.universeHeight - u.starDisplay[s].y;
            }
        }
        if(HV == "V" && LRUD == "R") {
            if (u.starDisplay[s].x > u.universeWidth/2) {
                u.starDisplay[s].y = u.universeHeight - u.starDisplay[s].y;
            }
        }
    }
}

function drawBackground(c, g, imgList, u) {
    c.ctx.fillStyle = g.bgColor;
    c.ctx.fillRect(0, 0 , g.gameWidth, g.gameHeight);
    c.ctx.strokeStyle = "white";
    c.ctx.beginPath();           //Draw world boundary
    c.ctx.moveTo(g.hOffset, g.vOffset);
    c.ctx.lineTo(g.hOffset + u.universeWidth, g.vOffset);
    c.ctx.lineTo(g.hOffset + u.universeWidth, g.vOffset + u.universeHeight);
    c.ctx.lineTo(g.hOffset, g.vOffset + u.universeHeight);
    c.ctx.lineTo(g.hOffset, g.vOffset);
    c.ctx.stroke();
    var l = u.starDisplay.length;
    for (var i = 0; i < l; i++) {
        for (var screenH = - g.numberofScreensH; screenH < g.numberofScreensH + 1; screenH++) {
            for (var screenV = - g.numberofScreensV; screenV < g.numberofScreensV + 1; screenV++) {
                var newPos = moveAScreen(u.starDisplay[i], screenH, screenV, u);
                c.ctx.beginPath();
                if (i < l/2) {
                    c.ctx.arc(newPos.x + g.hOffset, newPos.y + g.vOffset, 2, 0, 2 * Math.PI);
                } else {
                    c.ctx.arc(newPos.x + g.hOffset, newPos.y + g.vOffset, 3, 0, 2 * Math.PI);
                }
                //c.ctx.arc(u.starDisplay[i].x, u.starDisplay[i].y, Math.floor(i * 2/l+2), 0, 2 * Math.PI);
                c.ctx.fillStyle = g.starColor;
                c.ctx.fill();
                c.ctx.stroke();
            }    
        }   
    }
    /*c.ctx.beginPath();
    c.ctx.arc(u.O.x, u.O.y, u.earthRadius, 0, 2 * Math.PI); //draw Earth
    c.ctx.fillStyle = earthColor;
    c.ctx.fill();
    c.ctx.stroke();*/
    //drawNineTimes(imgList.imageEarth, u.O, 0, 2* u.earthRadius, 2* u.earthRadius, u.earthRadius, u.earthRadius, c, g, u);
    for (i = - g.numberofScreensH; i < g.numberofScreensH + 1; i++) {
        for (var j = - g.numberofScreensV; j < g.numberofScreensV + 1; j++) {
            var position = u.O.plus(new vec (i * u.universeWidth, j * u.universeHeight));
            //console.log(u.mode);
            if (isXflipped(u) && j % 2 !== 0) {
                c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
            }
            if (isYflipped(u) && i % 2 !== 0) {
                c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
            }
            c.ctx.translate(position.x + g.hOffset, position.y + g.vOffset);
            c.ctx.drawImage(imgList.imageEarth, -u.earthRadius, -u.earthRadius, u.earthRadius * 2, u.earthRadius * 2);
            c.ctx.translate(-position.x - g.hOffset, -position.y - g.vOffset);
            if (isXflipped(u) && j % 2 !== 0) {
                c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
            }   
            if (isYflipped(u) && i % 2 !== 0) {
                c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
            }
            c.ctx.translate(position.x + g.hOffset, position.y + g.vOffset);
            c.ctx.drawImage(imgList.imageEarth, -u.earthRadius, -u.earthRadius, u.earthRadius * 2, u.earthRadius * 2);
            c.ctx.translate(-position.x - g.hOffset, -position.y - g.vOffset);
            //console.log("Drawing: "+ moveAScreen(position,i,j));
        }
    }
    //c.ctx.drawImage(imgList.imageEarth, u.O.x - u.earthRadius + g.hOffset, u.O.y - u.earthRadius + g.vOffset, 2*u.earthRadius, 2*u.earthRadius);
}

function drawEyes(c, g, u) { ////////////////////// THe eyes of Earth /////////////////////////////////
    var leftEyePosition = new vec(u.O.x - 32, u.O.y - 30);
    var rightEyePosition = new vec(u.O.x + 32, u.O.y - 30);
    var direction = u.eyesChasing.pos.plus(u.O.op());
    direction = direction.times(1/direction.Vlength()*6);
    var leftPupilPosition = leftEyePosition.plus(direction);
    var rightPupilPosition = rightEyePosition.plus(direction);
    for (var i = - g.numberofScreensH; i < g.numberofScreensH + 1; i++) {
        for (var j = - g.numberofScreensV; j < g.numberofScreensV + 1; j++) {
            c.ctx.fillStyle = "white";
            c.ctx.strokeStyle = "black";
            var pos1 = moveAScreen(leftEyePosition, i, j, u);
            var pos2 = moveAScreen(rightEyePosition, i, j, u);
            var pos1pupil = moveAScreen(leftPupilPosition, i, j, u);
            var pos2pupil = moveAScreen(rightPupilPosition, i, j, u);
            c.ctx.beginPath();
            c.ctx.arc(pos1.x + g.hOffset, pos1.y + g.vOffset, 18, 0, 2 * Math.PI); //draw left Eye
            c.ctx.fill();
            c.ctx.stroke();
            c.ctx.beginPath();
            c.ctx.arc(pos2.x + g.hOffset, pos2.y + g.vOffset, 18, 0, 2 * Math.PI); //draw right Eye
            c.ctx.fill();
            c.ctx.stroke();
            c.ctx.fillStyle = "black";
            c.ctx.beginPath();
            c.ctx.arc(pos1pupil.x + g.hOffset, pos1pupil.y + g.vOffset, 8, 0, 2 * Math.PI); //draw left Eye
            c.ctx.fill();
            c.ctx.stroke();
            c.ctx.beginPath();
            c.ctx.arc(pos2pupil.x + g.hOffset, pos2pupil.y + g.vOffset, 8, 0, 2 * Math.PI); //draw left Eye
            c.ctx.fill();
            c.ctx.stroke();
        }
    }
    
    
    /*
    c.ctx.beginPath();
    c.ctx.arc(u.O.x - 32 + g.hOffset, u.O.y - 30 + g.vOffset, 18, 0, 2 * Math.PI); //draw left Eye
    c.ctx.fill();
    c.ctx.stroke();
    c.ctx.beginPath();
    c.ctx.arc(u.O.x + 32 + g.hOffset, u.O.y - 30 + g.vOffset, 18, 0, 2 * Math.PI); //draw left Eye
    c.ctx.fill();
    c.ctx.stroke();
    var direction = u.eyesChasing.pos.plus(u.O.op());
    direction = direction.times(1/direction.Vlength()*6);
    c.ctx.fillStyle = "black";
    c.ctx.beginPath();
    c.ctx.arc(u.O.x - 32 + direction.x + g.hOffset, u.O.y - 30 + direction.y + g.vOffset, 8, 0, 2 * Math.PI); //draw left Eye
    c.ctx.fill();
    c.ctx.stroke();
    c.ctx.beginPath();
    c.ctx.arc(u.O.x + 32 + direction.x + g.hOffset, u.O.y - 30 + direction.y + g.vOffset, 8, 0, 2 * Math.PI); //draw left Eye
    c.ctx.fill();
    c.ctx.stroke();*/
}


////// Space-time: what is being flipped?
function isXflipped(u) {
    if (u.mode == "Torus" || u.mode == "InvertY") {
        return false;
    } else {
        return true;
    }
}

function isYflipped(u) {
    if (u.mode == "Torus" || u.mode == "InvertX") {
        return false;
    } else {
        return true;
    }
}


////////////////// THE CLASS FOR HITBOXES ///////////////

function hitboxClass(front, back, sides) { ////////////////////// Hitboxes are rectangular and symmetric... //////////////////////
    this.front = front;
    this.back = back;
    this.sides = sides;
}

hitboxClass.prototype.collide = function (thing) {
    if (thing.y > -this.front && thing.y < this.back && Math.abs(thing.x) < this.sides) {
        return true;
    } else {
        return false;
    }
};

hitboxClass.prototype.increase = function (r) {////////////////////// For making collisions easier (or harder?)
    return new hitboxClass(this.front + r, this.back + r, this.sides + r);
};

////////////////// THE CLASS FOR FLYING STUFFS ///////////////

////////////////////// Ships, missiles, weaponu...

function flyingThing(pos, vel) {
    this.pos = pos;
    this.vel = vel;
}


 flyingThing.prototype.gPull = function (gMult, u) { //Computes the gravitational pull from the middle
     gMult = gMult || 1;
     var Pull;
    if (this.pos.x === 0 && this.pos.y === 0) {
        Pull = new vec(0, 0);
        return Pull;
    } else {/*
        var totalPull = new vec(0,0);
        for (xEarth = -1; xEarth < 2; xEarth++) {
            for (yEarth = -1; yEarth < 2; yEarth++) {
                var thisPull =  this.pos.op().plus(O.plus(new vec(xEarth * u.universeWidth, yEarth * u.universeHeight)));
                thisPull = thisPull.times(G * gMult * Math.pow(thisPull.Vlength(), -3));
                totalPull = totalPull.plus(thisPull);
            }
        }*/
        Pull = this.pos.op().plus(u.O);
        Pull = Pull.times(u.G * gMult * Math.pow(Pull.Vlength(), -3));
        return Pull;
    }
};

flyingThing.prototype.freeFall = function (gMult, u, error) { ////////////////////// One step in free falling //////////////////////
    gMult = gMult || 1;
    error = error || 1;
    var acc = this.gPull(gMult, u);
    this.vel = this.vel.plus(acc.times(u.dt * error));
    this.pos = this.pos.plus(this.vel.times(u.dt * error));
    this.pos = this.pos.plus(acc.times(u.dt * error*u.dt * error/2));
};



flyingThing.prototype.leaveScreen = function (u) { ////// THis function could be made prettier using isXflipped(u), but eh //////////////
    if(u.mode == "Torus") {
        if (this.pos.x > u.universeWidth) {
            this.pos.x -= u.universeWidth;
        } else if (this.pos.x < 0) {
            this.pos.x += u.universeWidth;
        }
        if (this.pos.y > u.universeHeight) {
            this.pos.y -= u.universeHeight;
        } else if (this.pos.y < 0) {
            this.pos.y += u.universeHeight;
        }    
    } 
    if(u.mode == "InvertX") {
        if (this.pos.x > u.universeWidth) {
            this.pos.x -= u.universeWidth;
        } else if (this.pos.x < 0) {
            this.pos.x += u.universeWidth;
        }
        if (this.pos.y > u.universeHeight) {
            this.pos.y -= u.universeHeight;
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship) {
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0) {
            this.pos.y += u.universeHeight;
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship) {
                this.facing = -this.facing;
            }
        }    
    }
    if(u.mode == "InvertY") {
        if (this.pos.x > u.universeWidth) {
            this.pos.x -= u.universeWidth;
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship) {
                this.facing = Math.PI -this.facing;
            }
        } else if (this.pos.x < 0) {
            this.pos.x += u.universeWidth;
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship) {
                this.facing = Math.PI -this.facing;
            }
        }
        if (this.pos.y > u.universeHeight) {
            this.pos.y -= u.universeHeight;
        } else if (this.pos.y < 0) {
            this.pos.y += u.universeHeight;
        }    
    }
    if(u.mode == "RP2") {
        if (this.pos.x > u.universeWidth) {
            this.pos.x -= u.universeWidth;
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship) {
                this.facing = Math.PI -this.facing;
            }
        } else if (this.pos.x < 0) {
            this.pos.x += u.universeWidth;
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship) {
                this.facing = Math.PI -this.facing;
            }
        }
        if (this.pos.y > u.universeHeight) {
            this.pos.y -= u.universeHeight;
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship) {
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0) {
            this.pos.y += u.universeHeight;
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship) {
                this.facing = -this.facing;
            }
        }    
    }
};


flyingThing.prototype.checkCollision = function (u) { ////////// Are you crashed into Earth yet? ////////////
    var distToEarth = canToEarth(this.pos, u).Vlength();
    if (distToEarth < u.earthRadius) {
        return true;
    } else {
        return false;
    }
};

////////////////// THE CLASS FOR WEAPONS ///////////////
function weapon(pos, vel, type, firedBy) {
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

weapon.prototype.draw = function (c, g, imgList, u) {
    switch (this.type) {
        case "Mine":
            this.facing += 0.03;
            drawNineTimes(imgList.imageMine, this.pos, this.facing, 26, 26, 13, 13, c, g, u);
            break;
        case "Banana":
            drawNineTimes(imgList.imageBanana, this.pos, 0, 26, 26, 13, 13, c, g, u);
            break;
        case "Bomb":
            if (this.living <= u.bombTimer - 10) {
                drawNineTimes(imgList.imageBomb, this.pos, 0, 26, 26, 13, 13, c, g, u);
                drawNineTimes(imgList.imageSpark, this.pos.plus(new vec(14 - this.living / 30, -15 + this.living / 30)), this.living, 10, 10, 5, 5, c, g, u);
            } else if (this.living <= u.bombTimer) {
                var bombSize = (this.living - u.bombTimer) * 1.5 + 41;
                drawNineTimes(imgList.imageBomb, this.pos, 0, bombSize, bombSize, bombSize / 2, bombSize / 2, c, g, u);
                drawNineTimes(imgList.imageSpark, this.pos.plus(new vec(11, -11)), this.living, 10, 10, 5, 5, c, g, u);
            } else {
                drawNineTimes(imgList.imageBigExplosion, this.pos, Math.random() * 2 * Math.PI, u.blastRadius +  20, u.blastRadius + 20, u.blastRadius / 2 + 10, u.blastRadius / 2 + 10, c, g, u);
            }
            break;
        case "Guided":
            if (this.living < 150) {
                this.facing = this.vel.toAngle();
                drawNineTimes(imgList.imageMissile, this.pos, this.facing, 12, 27, 6, 15, c, g, u);
            } else if (this.living == 150) {
                this.turnSpeed = this.vel.toAngle() - this.facing;
                drawNineTimes(imgList.imageMissileNoFire, this.pos, this.vel.toAngle(), 12, 27, 6, 15, c, g, u);
            } else {
                this.facing += this.turnSpeed;
                drawNineTimes(imgList.imageMissileNoFire, this.pos, this.facing, 12, 27, 6, 15, c, g, u);
            }
            break;
        case "Guided3":
            this.facing = this.vel.toAngle();
            if (this.living < 150) {
                drawNineTimes(imgList.imageMissile, this.pos, this.facing, 9, 19, 4.5, 10, c, g, u);
            } else if (this.living == 150) {
                this.turnSpeed = this.vel.toAngle() - this.facing;                
                drawNineTimes(imgList.imageMissileNoFire, this.pos, this.vel.toAngle(), 9, 19, 4.5, 10, c, g, u);
            } else {
                this.facing += this.turnSpeed;                
                drawNineTimes(imgList.imageMissileNoFire, this.pos, this.facing, 9, 19, 4.5, 10, c, g, u);
            }
            break;
        case "Gravity":
            this.facing += 0.06;
            drawNineTimes(imgList.imageGravity, this.pos, this.facing, 26, 26, 13, 13, c, g, u);
            break;
        default:
            break;
        }
};

flyingThing.prototype.flip = function (HV, LRUD, u) {
    if(HV == "H" && LRUD == "U") {
        if (this.pos.y < u.universeHeight/2) {
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship) {
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "H" && LRUD == "D") {
        if (this.pos.y > u.universeHeight/2) {
            this.pos.x = u.universeWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship) {
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "L") {
        if (this.pos.x < u.universeWidth/2) {
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if(this.constructor == ship) {
                this.facing = Math.PI-this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "R") {
        if (this.pos.x > u.universeWidth/2) {
            this.pos.y = u.universeHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if(this.constructor == ship) {
                this.facing = Math.PI-this.facing;
                this.orbiting = false;
            }
        }
    }
};

function drawLightning(c, g, imgList, u){
    if (u.flippingTopology == "H"){
        drawNineTimes(imgList.imageHCrack, new vec(0, 0), 0, u.universeWidth, u.universeHeight, 0, 0, c, g, u);
    } else if (u.flippingTopology == "V"){
        drawNineTimes(imgList.imageVCrack, new vec(0, 0), 0, u.universeWidth, u.universeHeight, 0, 0, c, g, u);
    }
}

universeInfo.prototype.flipUniverse = function(HV, LRUD, u) {
        this.Player.One.flip(HV, LRUD, u);
        this.Player.Two.flip(HV, LRUD, u);
        var m;
        for (m = 0; m < this.missiles.length; m++) {
            this.missiles[m].flip(HV, LRUD, u);
        }
        for (m = 0; m < this.weaponsCurrent.length; m++) {
            this.weaponsCurrent[m].flip(HV, LRUD, u);
        }
        if (this.floatingBox.existing) {
            this.floatingBox.flip(HV, LRUD, u);
        }
        flipStarDisplay(HV, LRUD, u);
        var newMode;
    if(HV == "H") {
        switch (this.mode) {
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
    }
    if(HV == "V") {
        switch (this.mode) {
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
    }
    this.mode = newMode;
};



universeInfo.prototype.flipAround = function(){
    this.topologyFlipping = 0;
    var whichFlip = Math.floor(Math.random()*5);
    switch (whichFlip) {
        case 1:
            this.topologyFlipping = "H";
            this.flipUniverse("H","U", this);
            break;
        case 2:
            this.topologyFlipping = "H";
            this.flipUniverse("H","D", this);
            break;
        case 3:
            this.topologyFlipping = "V";
            this.flipUniverse("V","L", this);
            break;
        case 4:
            this.topologyFlipping = "V";
            this.flipUniverse("V","R", this);
            break;
    }
};


function drawWeapons(c, g, imgList, u){
    for (var w = 0; w < u.weaponsCurrent.length; w++) {
        u.weaponsCurrent[w].draw(c, g, imgList, u);
    }
    drawLightning(c, g, imgList, u);
    if (u.topologyCounter == 3 || u.topologyCounter == 1 || u.topologyCounter == 5) {
        drawNineTimes(imgList.imageLightning, new vec(0, 0), 0, u.universeWidth, u.universeHeight, 0, 0, c, g, u);
    }
}


function dealWithWeapons(u) {   //Animation of weapons which are floating around
    for (var w = 0; w < u.weaponsCurrent.length; w++) {
        var W = u.weaponsCurrent[w];
        var alreadyDeleted = false;
        var newDir;
        switch (W.type) {
            case "Mine":
                if (W.living < 10) {
                    W.living ++;
                }
                if (u.Player.One.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 2)) {
                    u.Player.One.orbiting = false;
                    //u.Player.One.engineTemp += u.overheatTemp/2;
                    u.Player.One.vel = u.Player.One.vel.times(0.2);
                    u.Player.One.status.slowed = u.effectDuration;
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                } else if (u.Player.Two.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)) {
                    u.Player.Two.orbiting = false;
                    //u.Player.Two.engineTemp += u.overheatTemp/2;
                    u.Player.Two.vel = u.Player.Two.vel.times(0.2);
                    u.Player.Two.status.slowed = u.effectDuration;
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                }

                break;
            case "Banana":
                if (W.living < 10) {
                    W.living ++;
                }
                if (u.Player.One.easyCollide(W.pos, 10) && u.Player.One.status.slowed === 0 && (W.living == 10 || W.firedBy == 2)) {
                    u.Player.One.orbiting = false;
                    u.Player.One.vel = u.Player.One.vel.times(2);
                    u.Player.One.status.slowed = u.effectDuration;
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                } else if (u.Player.Two.easyCollide(W.pos, 10) && u.Player.Two.status.slowed === 0 && (W.living == 10 || W.firedBy == 1)) {
                    u.Player.Two.orbiting = false;
                    u.Player.Two.vel = u.Player.Two.vel.times(2);
                    u.Player.Two.status.slowed = u.effectDuration;
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                }

                break;
            case "Bomb":
                W.living ++;
                if (W.living > u.bombTimer && W.living < u.bombTimer + 20) {
                    if (shortestPath(W.pos, u.Player.One.pos, u).VlengthSq() < Math.pow(u.blastRadius - 50, 2)) {
                        u.Player.One.exploding = true;
                    }
                    if (shortestPath(W.pos, u.Player.Two.pos, u).VlengthSq() < Math.pow(u.blastRadius - 50, 2)) {
                        u.Player.Two.exploding = true;
                    }
                }
                if (W.living == u.bombTimer + 20) {
                    u.weaponsCurrent.splice(w, 1);
                    w--; 
                }
                break;
            case "Gravity":
                W.freeFall(1, u);
                W.leaveScreen(u);
                if (W.checkCollision(u)) {
                    u.GravityWarpTimer = u.effectDuration;
                    u.weaponsCurrent.splice(w, 1);
                    u.Player.One.orbiting = false;
                    u.Player.Two.orbiting = false;
                    w--;
                }
                if (W.living < 10) {
                    W.living ++;
                }
                //console.log("Collision: "+ u.Player.Two.easyCollide(W.pos, 10));
                //console.log("Alive: "+ (W.living == 10));
                //console.log("Fired by 1: "+ (W.firedBy == 1));
                //console.log("Total: "+ (u.Player.Two.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)));
                if (u.Player.One.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 2)) {
                    u.Player.One.orbiting = false;
                    u.Player.One.status.gravitied = u.effectDuration;
                    u.Player.One.status.gravityStrength++;
                    if (!alreadyDeleted) {
                        u.weaponsCurrent.splice(w, 1);
                        w--;
                    }
                }
                if (u.Player.Two.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)) {
                    u.Player.Two.orbiting = false;
                    u.Player.Two.status.gravitied = u.effectDuration;
                    u.Player.Two.status.gravityStrength++;
                    if (!alreadyDeleted) {
                        u.weaponsCurrent.splice(w, 1);
                        w--;
                    }
                }
                break;
            case "Guided":
                W.history.push({pos:W.pos, vel:W.vel, facing:W.facing});
                W.freeFall(1, u);
                W.leaveScreen(u);
                alreadyDeleted = false;
                if (W.checkCollision(u)) {
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                }
                if (W.living < 150) {
                    W.living ++;
                    if (W.firedBy == 1) {
                        newDir = shortestPath(W.pos, u.Player.Two.pos.plus(u.Player.Two.vel.times(5)), u);
                    } else {
                        newDir = shortestPath(W.pos, u.Player.One.pos.plus(u.Player.One.vel.times(5)), u);    
                    }
                    newDir = newDir.times(1/(newDir.Vlength())).times(u.guidedAgility);
                    newDir = newDir.projectOn(W.vel.rot(Math.PI/2));
                    //console.log("Direction change is "+newDir.x.toFixed(2)+", "+newDir.y.toFixed(2));
                    //console.log("Current speed is "+W.vel.x.toFixed(2)+", "+W.vel.y.toFixed(2));
                    W.vel = W.vel.plus(newDir.times(W.vel.Vlength()));
                }
                if (u.Player.One.easyCollide(W.pos, 7) && (W.living >= 10 || W.firedBy == 2)) {
                    u.Player.One.exploding = true;
                    u.successfulMissiles.push(W);
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                } else if (u.Player.Two.easyCollide(W.pos, 7) && (W.living >= 10 || W.firedBy == 1)) {
                    u.Player.Two.exploding = true;
                    u.successfulMissiles.push(W);
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                }
                break;
            case "Guided3":
                W.history.push({pos:W.pos, vel:W.vel, facing:W.facing});
                W.freeFall(1, u);
                W.leaveScreen(u);
                alreadyDeleted = false;
                if (W.checkCollision(u)) {
                    u.weaponsCurrent.splice(w, 1);
                    w--;
                }
                if (W.living < 150) {
                    W.living ++;
                    if (W.firedBy == 1) {
                        newDir = shortestPath(W.pos, u.Player.Two.pos.plus(u.Player.Two.vel.times(5)), u);
                    } else {
                        newDir = shortestPath(W.pos, u.Player.One.pos.plus(u.Player.One.vel.times(5)), u);    
                    }
                    newDir = newDir.times(1/(newDir.Vlength())).times(u.guidedAgility / 1.5);
                    newDir = newDir.projectOn(W.vel.rot(Math.PI/2));
                    //console.log("Direction change is "+newDir.x.toFixed(2)+", "+newDir.y.toFixed(2));
                    //console.log("Current speed is "+W.vel.x.toFixed(2)+", "+W.vel.y.toFixed(2));
                    W.vel = W.vel.plus(newDir.times(W.vel.Vlength()));
                }
                if (u.Player.One.easyCollide(W.pos, 4) && (W.living >= 10 || W.firedBy == 2)) {
                    u.Player.One.exploding = true;
                    u.successfulMissiles.push(W);
                    if (!alreadyDeleted) {
                        u.weaponsCurrent.splice(w, 1);
                        w--;
                    }
                }
                if (u.Player.Two.easyCollide(W.pos, 4) && (W.living >= 10 || W.firedBy == 1)) {
                    u.Player.Two.exploding = true;
                    u.successfulMissiles.push(W);
                    if (!alreadyDeleted) {
                        u.weaponsCurrent.splice(w, 1);
                        w--;
                    }
                }
                break;
            default:
                break;
        }
    }
    if (u.topologyCounter == 4 || u.topologyCounter == 6) {
        u.flipAround();
    }
}



function resetWeaponTimer(u) {
    u.weaponTimer = Math.floor((u.minWeaponWaitTime-u.maxWeaponWaitTime)*Math.random()+u.minWeaponWaitTime);
}

function dealWithBoxes(u) {
    if (!u.floatingBox.existing) {
        if(u.weaponTimer === 0) {
            u.floatingBox.spawn(u);
        } else {
            u.weaponTimer--;
        } 
    } else {
//        console.log("Collision: "+u.Player.Two.hitboxEasy.collide(u.floatingBox.pos));
//        console.log("Player Two: "+u.Player.Two.pos);
        if (u.Player.One.easyCollide(u.floatingBox.pos, 12)) {
            u.floatingBox.open(u.Player.One, u);
        } else if (u.Player.Two.easyCollide(u.floatingBox.pos, 12)) {
            u.floatingBox.open(u.Player.Two, u);
        }
    }
}

function randomWeapon(u) {
    //console.log("Choosing weapon");
    let availableWeapons = u.weaponTypes.filter(w => w.exists);
    var num = availableWeapons.length;
    return availableWeapons[Math.floor(Math.random()*num)].type;
}


////////////////////// CLASS FOR PRESENT BOXES ////////////
function presentBox(pos) {
    flyingThing.call(this, pos, new vec(0, 0));
    this.existing = false;
    this.timer = 0;
    this.growing = true;
}


presentBox.prototype = Object.create(flyingThing.prototype);
presentBox.prototype.constructor = presentBox;

presentBox.prototype.spawn = function (u) {
    this.pos = new vec(u.universeWidth * Math.random(), u.universeHeight * Math.random());
    this.existing = true;
    if (this.checkCollision(u)) {
        this.spawn(u);
    }
};



presentBox.prototype.open = function (player, u) {
    resetWeaponTimer(u);
    this.existing = false;
    player.weapon = randomWeapon(u);
    //console.log("Weapon of choice is"+ player.weapon);
    player.ammo = 3;
};


presentBox.prototype.draw = function (c, g, imgList, u) {
    if (this.existing) {
        drawNineTimes(imgList.imageBox, this.pos, 0, 24+this.timer, 24+this.timer, 12+this.timer/2, 12+this.timer/2, c, g, u);
    }
    if (this.growing) {  
        if(this.timer < 3) {
        this.timer++;
        } else {
        this.growing = false;
        }
    } else {
            if(this.timer > 0) {
            this.timer--;
        } else {
            this.growing = true;
        }
    }
};


////////////////// THE CLASS FOR SHIPS ///////////////


function ship(pos, whichPlayer, facing, whoPlaying, u) {
    flyingThing.call(this, pos, null);
    this.enginePower = new vec(0, -u.enginesPower);
    this.facing = facing;
    this.orbiting = false;
    this.crashed = false;
    this.exploding = false;
    this.angularspeed = 0;
    this.firestate = 0;
    this.engineTemp = 0;
    this.overheat = false;
    this.coolDownTimer = 0;
    this.whoPlaying = whoPlaying;
    this.keyScheme = function(status){
        if(this.whichPlayer == 1){
            return status.p1Keys;
        } else {
            return status.p2Keys;
        }
    };
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

ship.prototype.setAngularSpeed = function (u) {
    this.angularspeed = Math.sqrt((this.gPull(1, u).Vlength())/(canToEarth(this.pos, u).Vlength()));
    this.vel = canToEarth(this.pos, u).rot(Math.PI/2).times(this.angularspeed);
};

ship.prototype.clearStatus = function (u) {// This function is not in use anymore
    this.status = { /// Numbers are time left in status effect.
        slowed: 0,
        gravitied: 0,
        gravityStrength: 0, // Add 1 every time ship is hit by gravity ball
        magnetized: 0,
    };
    this.enginePower = new vec(0, -u.enginesPower);
    /*   OLD FUNCTION FROM BEFORE I COULD HAVE MANY CONDITIONS AT ONCE
    this.statusTimer = 0;
    this.enginePower = new vec(0, -u.enginesPower);
    this.status = "ok";    */
};

ship.prototype.checkStatus = function (u) {
    //switch(this.status) {
     //   case "slowed":
    if (this.status.slowed == u.effectDuration) {
        this.enginePower = new vec(0, -u.enginesPower * 0.2);
    }
    this.status.slowed = Math.max(0, this.status.slowed-1); 
    if (this.status.slowed === 0) {
        this.enginePower = new vec(0, -u.enginesPower);
    }
   // this.status.magnetized = Math.max(0, this.status.magnetized-1);
    
    /*   OLD FUNCTION FROM BEFORE I COULD HAVE MANY STATUSES AT ONCE
    switch(this.status) {
        case "slowed":
            if (this.statusTimer == u.effectDuration) {
                this.enginePower = this.enginePower.times(0.2); 
            }
            this.statusTimer = Math.max(0, this.statusTimer-1); 
            if (this.statusTimer == 0) {
                this.clearStatus(u);
            }
            break;
        case "gravitied":
            this.statusTimer = Math.max(0, this.statusTimer-1); 
            if (this.statusTimer == 0) {
                this.clearStatus(u);
            }
        default:
            break;
       
    }*/
};

ship.prototype.takeStep = function (u, status) {
    if (!this.exploding) {
        this.checkStatus(u);
        this.hitByMissile(u);
        if (!this.orbiting || status.keysList[this.keyScheme(status).thrust]) {
            this.orbiting = false;
            if (status.keysList[this.keyScheme(status).thrust] && !this.overheat) {
                this.engineTemp += u.engineCoolingRate + u.engineHeatingRate;
                this.vel = this.vel.plus(this.enginePower.rot(this.facing).times(u.dt));
            }
            if (this.status.magnetized > 0) {
                //console.log("This  player's position is "+this.pos.x.toFixed(2)+", "+this.pos.y.toFixed(2));
                //console.log("Other player's position is "+this.otherPlayer(u).pos.x.toFixed(2)+", "+this.otherPlayer(u).pos.y.toFixed(2));
                var magnetPull = shortestPath(this.pos, this.otherPlayer(u).pos, u);
                //console.log("The distance is "+magnetPull.VlengthSq().toFixed(2));
                magnetPull = magnetPull.times(u.magnetStrength / Math.pow(magnetPull.VlengthSq(),2/3));
                if (this.status.magnetized == u.effectDuration) {
                    magnetPull = magnetPull.times(40);
                }
                //console.log("The pull of the magnet is " + magnetPull.x.toFixed(2) + ", "+magnetPull.y.toFixed(2));
                this.vel = this.vel.plus(magnetPull);
                //console.log("Success!");
                this.status.magnetized--;
            }
            var extraG;
            if (this.status.gravitied > 0) {
                extraG = 1 + 6 * this.status.gravityStrength;
                this.status.gravitied--;
                if (this.status.gravitied === 0) {
                    this.status.gravityStrength = 0;
                }
            } else {
                extraG = 1;
            }
            this.freeFall(extraG, u);
        } else {         
            this.pos = earthToCan(canToEarth(this.pos, u).rot(this.angularspeed*u.dt), u);
            this.vel = this.vel.rot(this.angularspeed*u.dt);
        }
        if (this.checkCollision(u)) {
            this.exploding = true;
            this.firestate = 0;
        }
        this.rotate(status, u);
        this.leaveScreen(u);
        this.engineTemp = Math.max(0, this.engineTemp-u.engineCoolingRate);
        if (this.overheat && this.engineTemp === 0) {
            this.overheat = false;
        } else if (!this.overheat && this.engineTemp > u.overheatTemp) {
            this.overheat = true;
        }
        if (status.keysList[this.keyScheme(status).special] && this.coolDownTimer === 0) {
            this.fireWeapon(u);
            this.coolDownTimer = u.missileCooldown;
        }
    } else if (this.firestate < u.explosionLength) {
        this.firestate += 1;
        //console.log(this.firestate);
    } else {
        this.crashed = true;
    }
};


ship.prototype.draw = function (c, g, imgList, status, u) {
    if (!this.exploding) {
        if (this.overheat) {
            this.firestate = (this.firestate+1) % 6;
            if (this.firestate < 4) {
                if (this.whichPlayer == 1) {
                    drawNineTimes(imgList.imageShipOverheating1, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                } else {
                    drawNineTimes(imgList.imageShipOverheating1Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                }
            } else {
                if (this.whichPlayer == 1) {
                    drawNineTimes(imgList.imageShipOverheating2, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                } else {
                    drawNineTimes(imgList.imageShipOverheating2Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                }
            }
        } else if (!status.keysList[this.keyScheme(status).thrust]) {
            if (this.whichPlayer == 1) {
                    drawNineTimes(imgList.imageShipNoFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                } else {
                    drawNineTimes(imgList.imageShipNoFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                }
        } else {
            this.firestate = (this.firestate+1) % 6;
            if (this.firestate < 3) {
                if (this.whichPlayer == 1) {
                    drawNineTimes(imgList.imageShipFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                } else {
                    drawNineTimes(imgList.imageShipFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                }
            } else {
                if (this.whichPlayer == 1) {
                    drawNineTimes(imgList.imageShipFireAlt, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                } else {
                    drawNineTimes(imgList.imageShipFireAltBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2, c, g, u);
                }
            }
        }
    } else {
        if (Math.floor(this.firestate / 3) % 2 === 0) {
            drawNineTimes(imgList.imageExplosion, this.pos, this.facing, 50, 50, 25, 25, c, g, u);
        } else {
            drawNineTimes(imgList.imageExplosion, this.pos, this.facing + Math.PI, 50, 50, 25, 25, c, g, u);
        }
    }
    if (this.otherPlayer(u).status.magnetized > 0) {
        c.ctx.strokeStyle = "cyan";
        c.ctx.lineWidth = 2.5;
        var r = this.otherPlayer(u).status.magnetized;
        r = Math.abs(r * 7 - 25 * triangularWave(r, 3.3));
        var angle = Math.random(0, 2*Math.PI);
for (var i = - g.numberofScreensH; i < g.numberofScreensH + 1; i++) {
        for (var j = - g.numberofScreensV; j < g.numberofScreensV + 1; j++) {
            //console.log(u.mode);
            var flip ={x:isXflipped(u) && j % 2 !== 0,
                       y:isYflipped(u) && i % 2 !== 0};
            if (flip.x) {
                c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
            }
            if (flip.y) {
                c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
            }
            c.ctx.translate(i * u.universeWidth + g.hOffset, j * u.universeHeight + g.vOffset);
            c.ctx.arc(this.pos.x, this.pos.y, r, angle, angle + 4);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
            c.ctx.beginPath();
            c.ctx.stroke();
            c.ctx.lineWidth = 1;
            c.ctx.beginPath();
            c.ctx.arc(this.pos.x, this.pos.y, r/2, angle - 2, angle + 2);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
            c.ctx.stroke();
            c.ctx.beginPath();
            c.ctx.arc(this.pos.x, this.pos.y, r/4, angle - 1, angle + 1);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
            c.ctx.stroke();
            c.ctx.beginPath();
            c.ctx.arc(this.pos.x, this.pos.y, r + 5, angle + 1, angle + 5);//Math.random()*Math.PI, (Math.random()+1)*Math.PI);
            c.ctx.stroke();
            c.ctx.translate(- i * u.universeWidth - g.hOffset, - j * u.universeHeight  - g.vOffset);
            if (flip.x) {
                c.ctx.transform(-1, 0, 0, 1, g.gameWidth, 0);
            }
            if (flip.y) {
                c.ctx.transform(1, 0, 0, -1, 0, g.gameHeight);
            }
            //console.log("Drawing: "+ moveAScreen(position,i,j, u));
        }
    }            
    }
    this.drawTempBar(c, g, u);
    this.drawCurrentWeapon(c, g, imgList, u);
};

function triangularWave(t, a) {
    return Math.abs(t/a - Math.floor(t/a + 1/2));
}

ship.prototype.rotate = function (status, u) {
    var sign = 0;
    if (status.keysList[this.keyScheme(status).moveLeft]) {
        sign = 1;
    } else if (status.keysList[this.keyScheme(status).moveRight]) {
        sign = -1;
    }    
    this.facing += sign * u.rotationSpeed;
};


ship.prototype.fireMissile = function (status, u) {
    if(status.keysList[this.keyScheme(status).fire] && this.coolDownTimer === 0 && !this.overheat) {
        var outSpeed = new vec(0, -u.projectileSpeed);
        outSpeed = outSpeed.rot(this.facing);
        outSpeed = outSpeed.plus(this.vel);
        u.missiles.push(new missile(this.pos, outSpeed, this.whichPlayer));
        this.coolDownTimer = u.missileCooldown;
        this.engineTemp = Math.min(u.overheatTemp, this.engineTemp + u.missileTempIncrease);
        if (this.engineTemp == u.overheatTemp) {
                this.overheat = true;
            }
    } else {
        this.coolDownTimer = Math.max(0, this.coolDownTimer - 1);
    }  
};

ship.prototype.hitByMissile = function (u) {
    for (var missileIndex = 0; missileIndex < u.missiles.length; missileIndex++) {
        if(u.missiles[missileIndex].living == u.missileLiveTime || u.missiles[missileIndex].firedBy != this.whichPlayer) {
            var relPos = u.missiles[missileIndex].pos.plus(this.pos.op());
            var dist = relPos.Vlength();
            if (dist < 27) {
                relPos = relPos.rot(this.facing);
                /*console.log("Position of missile is x = "+u.missiles[missileIndex].pos.x+", y = "+u.missiles[missileIndex].pos.y);
                console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
                console.log("Player is facing "+this.facing);
                console.log("relative position is = "+relPos.x+", y = "+relPos.y);*/
                var hit = this.hitbox.collide(relPos);
                if (hit) {
                    //console.log("Hit!");
                    u.successfulMissiles.push(u.missiles[missileIndex]);
                    this.exploding = true;
                    u.missiles.splice(missileIndex, 1);
                    missileIndex--;
                }
            }
        }
    }
};

ship.prototype.easyCollide = function (whatHit, size) { //Checks collision against thing. Uses easy hitbox. WhatHit is the position vector of the second object
    var relPos = whatHit.plus(this.pos.op());
    var dist = relPos.Vlength();
    if (dist < 27 + size) {
        relPos = relPos.rot(this.facing);
        /*console.log("Position of missile is x = "+u.missiles[j].pos.x+", y = "+u.missiles[j].pos.y);
        console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
        console.log("Player is facing "+this.facing);
        console.log("relative position is = "+relPos.x+", y = "+relPos.y);*/
        return this.hitbox.increase(size).collide(relPos);
    } else{
        return false;
    }
};

ship.prototype.drawTempBar = function (c, g, u) {
    var xPosition;
    if (this.whichPlayer == 1) {
        xPosition = 10;
    } else {
        xPosition = u.universeWidth - 110;
    }
    var rate = this.engineTemp/u.overheatTemp;
    if (rate > 0.8 || this.overheat) {
        c.ctx.fillStyle = "#FF0000";
    } else if (rate > 0.4) {
        c.ctx.fillStyle = "#FFFF00";
    } else {
        c.ctx.fillStyle = "#00DD00";
    }
    c.ctx.strokeStyle = "#FFFFFF";
    c.ctx.strokeRect(xPosition + g.hOffset,10 + g.vOffset,100,10);
    c.ctx.fillRect(xPosition + g.hOffset,10 + g.vOffset,100* rate,10);
    c.ctx.strokeStyle = "#000000";
};

ship.prototype.drawHitbox = function () {
    
};

ship.prototype.otherPlayer = function (u) {/////Returns u.Player.One if player two and viceversa
    if (this.whichPlayer == 1) {
        return u.Player.Two;
    } else {
        return u.Player.One;
    }
};

ship.prototype.fireWeapon = function (u) {
    var outSpeed;
    switch (this.weapon) {
        case "Mine":
            u.weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Mine", this.whichPlayer));
            if (!u.infiniteAmmo) {
                this.ammo -=1;
            }
            if (this.ammo === 0) {
                this.weapon = "none";
            }
            break;
        case "Banana":
            u.weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Banana", this.whichPlayer));
            if (!u.infiniteAmmo) {
                this.ammo -=1;
            }
            if (this.ammo === 0) {
                this.weapon = "none";
            }
            break;
        case "Bomb":
            u.weaponsCurrent.push(new weapon(this.pos, new vec(0, 0), "Bomb", this.whichPlayer));
            if (!u.infiniteAmmo) {
                this.ammo -=1;
            }
            if (this.ammo === 0) {
                this.weapon = "none";
            }
            break;
        case "Gravity":
            outSpeed = new vec(0, -u.projectileSpeed);
            outSpeed = outSpeed.rot(this.facing);
            outSpeed = outSpeed.plus(this.vel);
            u.weaponsCurrent.push(new weapon(this.pos, outSpeed, "Gravity", this.whichPlayer));
            if (!u.infiniteAmmo) {
                this.ammo -=1;
            }
            if (this.ammo === 0) {
                this.weapon = "none";
            }
            break;
        case "Top":
            u.topologyCounter = 6;
            if (!u.infiniteAmmo) {
                this.weapon = "none";
            }
            break;
        case "Guided":
            outSpeed = new vec(0, -u.projectileSpeed);
            outSpeed = outSpeed.rot(this.facing);
            outSpeed = outSpeed.plus(this.vel);
            u.weaponsCurrent.push(new weapon(this.pos, outSpeed, "Guided", this.whichPlayer));
            this.ammo = 0;
            if (!u.infiniteAmmo) {
                this.weapon = "none";
            }
            break;
        case "Guided3":
            outSpeed = new vec(0, -u.projectileSpeed / 1.5);
            outSpeed = outSpeed.rot(this.facing);
            var outSpeed2 = outSpeed.plus(this.vel);
            //var W = new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer);
            //console.log(W.type);
            u.weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            outSpeed = outSpeed.rot(Math.PI/4);
            outSpeed2 = outSpeed.plus(this.vel);
            u.weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            outSpeed = outSpeed.rot(- Math.PI/2);
            outSpeed2 = outSpeed.plus(this.vel);
            u.weaponsCurrent.push(new weapon(this.pos, outSpeed2, "Guided3", this.whichPlayer));
            this.ammo = 0;
            if (!u.infiniteAmmo) {
                this.weapon = "none";
            }
            break;
        case "Magnet":
            this.otherPlayer(u).status.magnetized = u.effectDuration;
            this.otherPlayer(u).orbiting = false;
            if (!u.infiniteAmmo) {
                this.ammo -=1;
            }
            if (this.ammo === 0) {
                this.weapon = "none";
            }
            break;
        default:
            this.weapon = "none";
            break;
    }
};

ship.prototype.drawCurrentWeapon = function (c, g, imgList, u) {
    var xPosition;
    if (this.whichPlayer == 1) {
        xPosition = 130;
    } else {
        xPosition = u.universeWidth-160;
    }
    c.ctx.strokeStyle = "#FFFFFF";
    c.ctx.strokeRect(xPosition + g.hOffset,10 + g.vOffset,30,30);
    c.ctx.strokeStyle = "#000000";
    switch (this.weapon) {
        case "Mine":
            c.ctx.drawImage(imgList.imageMine, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            c.ctx.fillStyle = "red";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText(this.ammo, xPosition + 2 + g.hOffset, 23 + g.vOffset);
            break;
        case "Banana":
            c.ctx.drawImage(imgList.imageBanana, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            c.ctx.fillStyle = "red";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText(this.ammo, xPosition + 2 + g.hOffset, 23 + g.vOffset);
            break;
        case "Gravity":
            c.ctx.drawImage(imgList.imageGravity, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            c.ctx.fillStyle = "red";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText(this.ammo, xPosition + 2 + g.hOffset, 23 + g.vOffset);
            break;
        case "Bomb":
            c.ctx.drawImage(imgList.imageBomb, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            c.ctx.fillStyle = "red";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText(this.ammo, xPosition + 2 + g.hOffset, 23 + g.vOffset);
            break;
        case "Top":
            c.ctx.drawImage(imgList.imageTop, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            break;
        case "Guided":
            c.ctx.drawImage(imgList.imageMissile, xPosition + 8 + g.hOffset, 10 + g.vOffset, 14, 30);/*
            c.ctx.fillStyle = "yellow";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText("1", xPosition + 1, 23);*/
            break;
         case "Guided3":
            c.ctx.drawImage(imgList.imageMissile, xPosition  + g.hOffset    , 12 + g.vOffset, 12, 27);
            c.ctx.drawImage(imgList.imageMissile, xPosition + 8  + g.hOffset, 12 + g.vOffset, 12, 27);
            c.ctx.drawImage(imgList.imageMissile, xPosition + 16 + g.hOffset, 12 + g.vOffset, 12, 27);/*
            c.ctx.fillStyle = "yellow";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText("1", xPosition + 1, 23);*/
            break;
        case "Magnet":
            c.ctx.drawImage(imgList.imageMagnet, xPosition + g.hOffset, 10 + g.vOffset, 30, 30);
            c.ctx.fillStyle = "red";
            c.ctx.font = "bolder 15px Arial Black";
            c.ctx.textAlign = "left";
            c.ctx.fillText(this.ammo, xPosition + 2 + g.hOffset, 23 + g.vOffset);
            break;
        default:
            break;
    }
};

//////////////////////// COMPUTER DECISIONS //////////////////

/*global synaptic*/


//if (displayingGraphics){
//    var Neuron = synaptic.Neuron,
//    Layer = synaptic.Layer,
//    Network = synaptic.Network,
//    Trainer = synaptic.Trainer,
//    Architect = synaptic.Architect;
//
//    var inputLayer = new Layer(6);
//    var hiddenLayer = new Layer(8);
//    var outputLayer = new Layer(4);
//
//    inputLayer.project(hiddenLayer);
//    hiddenLayer.project(outputLayer);
//
//    var myNetwork = new Network({
//    input: inputLayer,
//    hidden: [hiddenLayer],
//    output: outputLayer
//    });
//
//    var standalone = myNetwork.standalone();
//}
//
//var numberOfInputs = 6;
//
//
//function createNetwork(){
//    var inputLayer = new Layer(numberOfInputs);
//    var hiddenLayer = new Layer(9);
//    var outputLayer = new Layer(4);
//
//    inputLayer.project(hiddenLayer);
//    hiddenLayer.project(outputLayer);
//
//    var myNetwork = new Network({
//	input: inputLayer,
//	hidden: [hiddenLayer],
//	output: outputLayer
//    });
//    return myNetwork;
//}

/////////// COPY THE STUFF FROM COMPUTERPLAYER

var neuron = function(ID){
    this.inputs = [];
    this.ID = ID.toString();
    this.lit = 0;
};

neuron.prototype.connect = function(aNeuron, weights){
    var connKey = aNeuron.ID;
    if(weights == "random"){
        this.inputs[aNeuron.ID] = 2 * Math.random() - 1;
    } else {
        this.inputs[aNeuron.ID] = 0;
    }
};

var layer = function(nNeurons, ID){
    this.neuronList = [];
    for(var n = 0; n < nNeurons; n++){
        var a = new neuron(ID + n);
        this.neuronList.push(a);
    }
};

layer.prototype.connect = function(aLayer, weights){
    for (var inNeuron in this.neuronList){
        for (var outNeuron in aLayer.neuronList){
            this.neuronList[inNeuron].connect(aLayer.neuronList[outNeuron], weights);
        }
    }
};

var network = function(layerNos, weights){// layerNos is an array of 5 numbers: 
    /*
    0: Size of usual input layer
    1: Size of Recursive input layer
    2: Size of processed recursive input layer
    3: Size of hidden layer
    4: Output layer
    */
    this.sizes = layerNos;
    this.layers = [];
    var ID = 0;
    for (var l in layerNos){
        var newLayer = new layer(layerNos[l], ID);
        ID += layerNos[l];
        this.layers.push(newLayer);
        //connections
    }
    this.layers[2].connect(this.layers[1], weights);
    this.layers[2].connect(this.layers[2], weights);
    this.layers[3].connect(this.layers[0], weights);
    this.layers[3].connect(this.layers[2], weights);
    this.layers[4].connect(this.layers[3], weights);
};


network.prototype.clone = function(){
    var answer = new network(this.sizes, "zeroes");
    for(var layerCount in this.layers){
        var currentNeuronList = this.layers[layerCount].neuronList;
        for(var neuronCount in currentNeuronList){
            var currentInputList = currentNeuronList[neuronCount].inputs;
            for(var inputCount in currentInputList){
                answer.layers[layerCount].neuronList[neuronCount].inputs[inputCount] = currentInputList[inputCount];
            }
        }
    }
    return answer;
};

network.prototype.perturb = function(rate){
    var theNewNetwork = this.clone();
    for(var layerCount in this.layers){
        var currentNeuronList = theNewNetwork.layers[layerCount].neuronList;
        for(var neuronCount in currentNeuronList){
            var currentInputList = currentNeuronList[neuronCount].inputs;
            for(var inputCount in currentInputList){
                currentInputList[inputCount] = currentInputList[inputCount] + (Math.random() * 2 - 1)* rate;
            }
        }
    }
    return theNewNetwork;
};

function squash2(x){
    return 1/(1 + Math.exp(-x));
}

function squash(x){
    return Math.max(x,0);
}

network.prototype.neuronFind = function(ID){
    //Find a Neuron by ID
    var sum = 0,
        currentLayer = -1;
    while (sum <= parseInt(ID) && currentLayer < this.sizes.length - 2){
        sum += this.sizes[currentLayer + 1];
        currentLayer += 1;
    }
    if(sum > parseInt(ID)){
        return this.layers[currentLayer].neuronList[parseInt(ID) - sum + this.sizes[currentLayer]];
    } else if (sum + this.sizes[currentLayer + 1] > parseInt(ID)) {
        return this.layers[currentLayer + 1].neuronList[parseInt(ID) - sum];
    } else {
        return null;
    }
};


network.prototype.activate = function(inputArray){
//    if (inputArray.length < this.sizes[0]){
//        inputArray.push(new Array(this.sizes[0] - inputArray.length).fill(0));
//    } else if (inputArray.length > this.sizes[0]){
//        inputArray.splice(this.sizes[0], inputArray.length - this.sizes[0]);
//    }
    if (inputArray.length !== this.sizes[0] + 1){
        return "Wrong size!!";
    } else if (inputArray[this.sizes[0]][0] !== undefined && inputArray[this.sizes[0]][0].length !== this.sizes[1]){
        return "Wrong size in the size!";
    }
    for (var chooseNeuron in this.layers[0].neuronList){
        var currentNeuron = this.layers[0].neuronList[chooseNeuron];
        currentNeuron.lit = inputArray[chooseNeuron];
    }
    let bulletList = inputArray[this.sizes[0]];
    let nBullets = bulletList.length;
    //// Feed input into recursive neurons
    this.layers[2].neuronList.forEach(function(n){//Initialize everything to 0
        n.lit = 0;    
    });
    
    for(let bulletIndex in bulletList){
        let b = bulletList[bulletIndex];
        for (let n = 0; n < this.sizes[1]; n++){
            this.layers[1].neuronList[n].lit = b[n]; 
        }
        let oldValues = {};
        for (let j in this.layers[2].neuronList){//Copy lit values of network into old values
            oldValues[this.layers[2].neuronList[j].ID] = this.layers[2].neuronList[j].lit;
        }
        for (let j in this.layers[2].neuronList){//Update the values
            let n = this.layers[2].neuronList[j];
            let sum = 0;
            for (let otherNeuron in n.inputs){
                    if (parseInt(otherNeuron) < this.sizes[0]){
                        sum += n.inputs[otherNeuron] * this.neuronFind(otherNeuron).lit;
                    } else {
                        sum += n.inputs[otherNeuron] * oldValues[otherNeuron];
                    }
                }
        }
    }
        
    for (var chooseLayer = 3; chooseLayer < this.sizes.length; chooseLayer++){
        var currentLayer = this.layers[chooseLayer].neuronList;
        for (let pickNeuron in currentLayer){
            var thisNeuron = currentLayer[pickNeuron];
            var sum = 0;
            for (var otherNeuron in thisNeuron.inputs){
                sum += thisNeuron.inputs[otherNeuron] * this.neuronFind(otherNeuron).lit;
            }            
            thisNeuron.lit = squash(sum);
        }
    }
    let output = this.layers[this.sizes.length-1].neuronList.map(
        (n) => n.lit
    );
//    for (var outNeuron in this.layers[this.sizes.length-1].neuronList){
//        output.push(this.layers[this.sizes.length-1].neuronList[outNeuron].lit);
//    }
    return output;
};



/////////// END OF COPIED STUFF






//var u = new main.universeInfo();
//var status = new main.gameStatus();
//var ship = main.ship;
//u.Player = new main.playerTypes(u);
//u.Player.One.takeStep(u, status);
//console.log(u.Player.One);


function playGame(brain1, brain2){
    var status = new gameStatus();
    var u = new universeInfo(status);
    u.explosionLength = 0;
    u.Player = new playerTypes(u);
    u.Player.One.whoPlaying = brain1;
    u.Player.Two.whoPlaying = brain2;
    status.playing = true;
    status.winner = "none";
    while(status.playing){
        gameStep(u,status);
    }
    if (status.winner == "P1"){
        return 1;
    } else if (status.winner == "P2"){
        return -1;
    } else {
        return 0;
    }
}

function gameStep(u, status){
        u.Player.One.makeDecision(u.Player.One.whoPlaying, status, u);
        u.Player.Two.makeDecision(u.Player.Two.whoPlaying, status, u);
        u.Player.One.takeStep(u, status);
        u.Player.Two.takeStep(u, status);
        if (u.Player.One.crashed || u.Player.Two.crashed) {
            status.playing = false;
            status.winner = "none";
            if (!u.Player.One.exploding) {
                status.winner = "P1";
            } else if (!u.Player.Two.exploding) {
                status.winner = "P2";
            }
        }
        u.Player.One.fireMissile(status, u);
        u.Player.Two.fireMissile(status, u);
        for (var m = 0; m < u.missiles.length; m++) {
            u.missiles[m].history.push(u.missiles[m].pos);
            u.missiles[m].takeStep(u);
            //u.missiles[m].draw(c, g, u);
            if (u.missiles[m].crashed) {
                u.missiles.splice(m, 1);
                m--;
            }
        }
        //dealWithBoxes(u);
        //u.floatingBox.draw(c, g, imgList, u);
        //drawEyes(c, g, u);
        //dealWithWeapons(u);
//        if (u.topologyCounter > 0){
//            u.topologyCounter--;
//        }
        //drawWeapons(c, g, imgList, u);
//        specialEffects(u);
//        if (playing && !status.paused) {
//            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
//        }
//    } else {
//        if (playing && !status.paused) {
//            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
//        }
//    }
//    if (!playing) {
//        gameOver(c, g, imgList, status, u);
//    }
}

/*function createNetwork(){
    var inputLayer = new Layer(numberOfInputs);
    var hiddenLayer = new Layer(9);
    var outputLayer = new Layer(4);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    var myNetwork = new Network({
	input: inputLayer,
	hidden: [hiddenLayer],
	output: outputLayer
    });
    return myNetwork;
}*/

function playTournament(A, gameNumber){//A is an array of networks, number of games Played
    var playerNumber = A.length;
    var results = [];
    for (var row = 0; row < playerNumber; row++){
        results.push(Array(playerNumber).fill(0));
    }
    for (var homePlayer = 0; homePlayer < playerNumber - 1; homePlayer++){
        for (var awayPlayer = homePlayer + 1; awayPlayer < playerNumber; awayPlayer++){
            for (var nthGame = 0; nthGame < gameNumber; nthGame++){
                var gameResult = playGame(A[homePlayer], A[awayPlayer]);
                results[homePlayer][awayPlayer] = results[homePlayer][awayPlayer] + gameResult;
                results[awayPlayer][homePlayer] = results[awayPlayer][homePlayer] - gameResult;
            }
        }
    }
    return results;
}
//var x = [];
//var zeroVector = [];
//
//for (var i = 0; i < 3; i++){
////    for (var j = 0; j < 3; j++){
////        zeroVector.push(0);
////    }
//    x.push(Array(3).fill(0));
//}

//for (var homePlayer = 0; homePlayer < 2; homePlayer++){
//        for (var awayPlayer = homePlayer + 1; awayPlayer < 3; awayPlayer++){
//            for (var nthGame = 0; nthGame < 1; nthGame++){
//                var gameResult = 1;
//                x[homePlayer][awayPlayer] = x[homePlayer][awayPlayer] + gameResult;
//                x[awayPlayer][homePlayer] = x[awayPlayer][homePlayer] - gameResult;
//                //results[awayPlayer][homePlayer] += gameResult;
//            }
//        }
//    }
function makeAGoodBrain(nPlayers, nGames, nIterations, learningRate){
    var A = [];
    for (var i = 0; i < nPlayers; i++){
        A.push(new network([7,9,4],"random"));
    }
    for (i = 0; i < nIterations; i++){
        A = improveSpecies(A, nGames, 0.1);
        if (i % 10 == 9){
            //console.log(i+1+' tournaments so far!');
        }
    }
    return A[0];
}


//console.log(R[1][0]);
//console.log(R[0][1]);

function improveSpecies(A, nGames, learningRate){
    var playerNumber = A.length;
    var R = playTournament(A, nGames);
    //console.log(R);
    var score = Array(playerNumber).fill(0);
    for (var homePlayer = 0; homePlayer < playerNumber - 1; homePlayer++){
        for (var awayPlayer = homePlayer + 1; awayPlayer < playerNumber; awayPlayer++){
                score[homePlayer] += R[homePlayer][awayPlayer];
        }
    }
    var winner = 0;
    var topScore = 0;
    for (var contestant = 0; contestant < playerNumber; contestant++){
        if(score[contestant] > topScore){
            winner = contestant;
            topScore = score[contestant];
        }
    }
    var B = [];
    for (var newNetwork = 0; newNetwork < playerNumber; newNetwork++){
        B.push(A[winner].perturb(learningRate));
    }
    return B;
}


ship.prototype.makeDecision = function(brain, status, u){
    var inputArray = this.observeBattle(u);
    var answers = brain.activate(inputArray);
    //console.log(answers);
    var answersIndex = 0;
    if (answers[0] > 0.5){
        status.keysList[this.keyScheme(status).thrust] = true;
    } else {
        status.keysList[this.keyScheme(status).thrust] = false;
    }
    if (answers[1] > 0.5){
        status.keysList[this.keyScheme(status).fire] = true;
    } else {
        status.keysList[this.keyScheme(status).fire] = false;
    }
    if (answers[2] > answers[3] && answers[2] > 0.5){
        status.keysList[this.keyScheme(status).moveLeft] = true;
    } else {
        status.keysList[this.keyScheme(status).moveLeft] = false;
    }
    if (answers[3] > answers[2] && answers[3] > 0.5){
        status.keysList[this.keyScheme(status).moveRight] = true;
    } else {
        status.keysList[this.keyScheme(status).moveRight] = false;
    }
};

ship.prototype.pointToCoordinates = function(v, u){     ///////////// Expresses v in the coordinates where the speed of this ship is (x,0) and the position is (0,0)
    var answer = new vec(v.x, v.y);
    answer = answer.plus(this.pos.op());
    var rotate = this.vel.toAngle() - Math.PI / 2;
    answer = answer.rot(-rotate);
    return answer;
};

ship.prototype.vectorToCoordinates = function(v, u){     ///////////// Expresses v in the coordinates where the speed of this ship is (x,0) and the position is (0,0)
    var answer = new vec(v.x, v.y);
    var rotate = this.vel.toAngle() - Math.PI / 2;
    answer = answer.rot(-rotate);
    return answer;
};
    
var computerError = 4;
var computerForesight = 10;

ship.prototype.observeAlone = function(u){
    var observations = [];
    ///////////// In our system of coordinates, the speed of the ship is (v,0) and the position is (0,0)
    // Speed of the ship:
    var speed = this.vel.Vlength();
    //console.log("Speed: " + speed);
    observations.push(((speed - 10)/5));
    // Distance to earth:
    var earthWhere = this.pointToCoordinates(u.O, u);
    var dist = earthWhere.Vlength();
    //console.log("Distance to Earth: " + dist);
    observations.push(( (dist - 200)/100 ));
    // Angle of Earth:
    var earthAngle = earthWhere.toAngle() - Math.PI / 2;
    //console.log("Angle to Earth: " + earthAngle);                     
    observations.push(( earthAngle ));
    // Where will I be in a while?
    var ghost = new flyingThing(this.pos, this.vel);
    var minDistance = dist;
    for(var simTime = 0; simTime < computerForesight; simTime++){
        var whereIsGhost = canToEarth(ghost.pos, u);
        //if ((Math.abs(whereIsGhost.x) > 10 || Math.abs(whereIsGhost.y) > 10) && whereIsGhost.x > - u.universeWidth/2 && whereIsGhost.x/2 < u.universeWidth && whereIsGhost.y > -u.universeHeight/2 && whereIsGhost.y < u.universeHeight/2){
        ghost.freeFall(1, u, computerError);
        //console.log(ghost.pos.x+", "+ghost.pos.y);
        var newDist = shortestPath(ghost.pos, u.O, u);
        if (typeof newDist === "undefined"){
            ghost.pos = new vec (0,0);
            ghost.vel = new vec (0,0);
            simTime = computerForesight;
            minDistance = 0;
        } else {
            newDist = newDist.Vlength();
            minDistance = Math.min(minDistance, newDist);
        }
/*        if (newDist < 20){
            console.log("Too far!");
        }
        c.ctx.fillText(ghost.vel.Vlength(), 300, 400 + simTime * 10); */
    }
    /*c.ctx.font = "20px white arial";
    c.ctx.fillStyle = "white";
    c.ctx.fillText(minDistance.toString(), 300, 300); 
    console.log("Future distance to Earth: " + dist);*/
    observations.push(( (minDistance - 200)/100 ));
    // Future Earth Coordinates
    observations.push(( (canToEarth(ghost.pos, u).x - 200)/100 ));
    observations.push(( (canToEarth(ghost.pos, u).y - 200)/100 ));
    // Temperature
    observations.push(((this.engineTemp - u.overheatTemp/2)/u.overheatTemp));
    observations.push(this.facing - this.vel.toAngle());
    observations.push(1);
    return observations;///8 observations!!!
};


ship.prototype.observeBattle = function(u){
    let observations = this.observeAlone(u);
    // Where is the other player?
    // Position in the system of coordinates
    let otherPlayerPos = shortestPath(this.pos, this.otherPlayer(u).pos, u);
    observations.push(otherPlayerPos.Vlength()/100);// Distance to player
    let playerAngle = this.vectorToCoordinates(otherPlayerPos).toAngle();
    observations.push(playerAngle);// Angle to player
    observations.push(this.otherPlayer(u).facing - playerAngle);// Angle to player
    let otherVel = this.vectorToCoordinates(this.otherPlayer(u).vel).plus(this.vel.op());
    observations.push(otherVel.x / 100); //Other player's speed x
    observations.push(otherVel.y / 100); //Other player's speed y
    //Where are the bullets?
    let seenBullets = [];
    for (let w in u.missiles){
        let newBullet = [];
        let missilePos = shortestPath(this.pos, u.missiles[w].pos, u);
        newBullet.push(missilePos.Vlength()/100);// Distance to missile
        let missileAngle = this.vectorToCoordinates(missilePos).toAngle();
        newBullet.push(missileAngle);// Angle to missile
        let bulletVel = this.vectorToCoordinates(u.missiles[w].vel).plus(this.vel.op()) ;
        newBullet.push(bulletVel.x / 100); //Missile's speed x
        newBullet.push(bulletVel.y / 100); //Missile's speed y
        seenBullets.push(newBullet);
    }
    observations.push(seenBullets);
    return observations;
};










////////////////// THE CLASS FOR MISSILES ///////////////


function missile(pos, vel, who) {
    flyingThing.call(this, pos, vel);
    this.crashed = false;
    this.living = 0;
    this.firedBy = who;
    this.history = [];
}


missile.prototype = Object.create(flyingThing.prototype);
missile.prototype.constructor = missile;

function drawMissile(x, y, c, g) {
    c.ctx.beginPath();
    c.ctx.arc(x + g.hOffset, y + g.vOffset, 3, 0, 2 * Math.PI);
    c.ctx.fill();
    c.ctx.stroke();
}

missile.prototype.draw = function (c, g, u) {
    if (this.firedBy == 1) {
        c.ctx.fillStyle = "red";
    } else {
        c.ctx.fillStyle = "#00FF00";
    }
    drawMissile(this.pos.x, this.pos.y, c, g);
    /*c.ctx.beginPath();
    c.ctx.arc(this.pos.x + g.hOffset, this.pos.y + g.vOffset, 3, 0, 2 * Math.PI);
    c.ctx.fill();
    c.ctx.stroke();*/
     ///// Draws something 9 times depending on the surface
    //console.log(u.mode);
    var xFlip = isXflipped(u);
    var yFlip = isYflipped(u);
    if (!xFlip) {
        drawMissile(this.pos.x, this.pos.y + u.universeHeight, c, g); //Down
        drawMissile(this.pos.x, this.pos.y - u.universeHeight, c, g); //Up
        if (!yFlip) {
            drawMissile(this.pos.x + u.universeWidth, this.pos.y + u.universeHeight, c, g);
            drawMissile(this.pos.x - u.universeWidth, this.pos.y + u.universeHeight, c, g);
            drawMissile(this.pos.x + u.universeWidth, this.pos.y - u.universeHeight, c, g);
            drawMissile(this.pos.x - u.universeWidth, this.pos.y - u.universeHeight, c, g);
        } else {
            drawMissile(this.pos.x + u.universeWidth, - this.pos.y + 2 * u.universeHeight, c, g);
            drawMissile(this.pos.x - u.universeWidth, - this.pos.y + 2 * u.universeHeight, c, g);
            drawMissile(this.pos.x + u.universeWidth, - this.pos.y, c, g);
            drawMissile(this.pos.x - u.universeWidth, - this.pos.y, c, g);
        }
    } else {
        drawMissile(- this.pos.x + u.universeWidth, this.pos.y + u.universeHeight, c, g); //Down
        drawMissile(- this.pos.x + u.universeWidth, this.pos.y - u.universeHeight, c, g); //Up
        if (!yFlip) {
            drawMissile(- this.pos.x + 2 * u.universeWidth, this.pos.y + u.universeHeight, c, g);
            drawMissile(- this.pos.x                    , this.pos.y + u.universeHeight, c, g);
            drawMissile(- this.pos.x + 2 * u.universeWidth, this.pos.y - u.universeHeight, c, g);
            drawMissile(- this.pos.x                    , this.pos.y - u.universeHeight, c, g);
        } else {
            drawMissile(- this.pos.x + 2 * u.universeWidth, - this.pos.y + 2 * u.universeHeight, c, g);
            drawMissile(- this.pos.x                    , - this.pos.y + 2 * u.universeHeight, c, g);
            drawMissile(- this.pos.x + 2 * u.universeWidth, - this.pos.y, c, g);
            drawMissile(- this.pos.x                    , - this.pos.y, c, g);
        }
    }
    if (!yFlip) {
        drawMissile(this.pos.x + u.universeWidth, this.pos.y, c, g);
        drawMissile(this.pos.x - u.universeWidth, this.pos.y, c, g);
    } else {
        drawMissile(this.pos.x + u.universeWidth, - this.pos.y + u.universeHeight, c, g);
        drawMissile(this.pos.x - u.universeWidth, - this.pos.y + u.universeHeight, c, g);
    }
};

missile.prototype.takeStep = function (u) {
    this.freeFall(1, u);
    if (this.checkCollision(u)) {
        this.crashed = true;
    }
    this.leaveScreen(u);
    if (this.living < u.missileLiveTime) {
        this.living += 1;
    }
};

function specialEffects(u) {
    if (u.GravityWarpTimer == u.effectDuration) {
        //console.log("Graviting!");
        u.G = u.G*5;
    }
    if (u.GravityWarpTimer > 0) {
        u.GravityWarpTimer --;
        if (u.GravityWarpTimer === 0) {
            u.G = u.defaultG;
        }
    }
}

function clearSpecialEffects(u) {
    u.GravityWarpTimer = 0;
    u.G = u.defaultG;
}




function ScreenOfRestarting(status) {
    status.scene = "GameOver";
    
    /*if (status.keysList[rKey]) {
        startTheGame(c, g, imgList, status, u);
    } else {
       // window.requestAnimationFrame(restartScreen);
    }*/
}

missile.prototype.backInTime = function (i) {
    this.pos = this.history[this.history.length - 1];
    this.history.splice(this.history.length - 1);
};

weapon.prototype.backInTime = function () {
    this.pos = this.history[this.history.length - 1].pos;
    this.vel = this.history[this.history.length - 1].vel;
    this.facing = this.history[this.history.length - 1].facing;
    this.history.splice(this.history.length - 1);
    this.living--;
};

async function drawSuccessfulMissiles(c, g, imgList, u) {
    while (u.successfulMissiles.length > 0) {
        for (var missileCounter = 0; missileCounter < u.successfulMissiles.length; missileCounter++) {
            if (u.successfulMissiles[missileCounter].history.length === 0) {
                u.successfulMissiles.splice(missileCounter);
                missileCounter -= 1;
            } else {
                u.successfulMissiles[missileCounter].backInTime();
                if (u.successfulMissiles[missileCounter].type === undefined){
                    u.successfulMissiles[missileCounter].draw(c, g, u);
                } else {
                    u.successfulMissiles[missileCounter].draw(c, g, imgList, u);
                }
            }
        }
        await sleep(20);
    }
    /*
    for (missileCounter = 0; missileCounter < u.successfulMissiles.length; missileCounter++) {
        for (timeCounter = u.successfulMissiles[missileCounter].history.length; timeCounter > 0; timeCounter--) {
            u.successfulMissiles[missileCounter].backInTime(timeCounter - 1);
            u.successfulMissiles[missileCounter].draw(c, g, u);
            await sleep(20);
            if (u.successfulMissiles == []) {
                timeCounter = 0;
            }
        }
    }*/
}


///////////////// Initializing things

function playerTypes(u, status) { ////////////WARNING status.p1Keys and status.p2Keys
    this.One = new ship(new vec(    u.universeWidth/4, u.universeHeight/2), 1, Math.PI, "human", u);            //Player ship
    this.Two = new ship(new vec(3 * u.universeWidth/4, u.universeHeight/2), 2, 0, "human", u);            //Player ship
    this.One.setAngularSpeed(u);
    this.Two.setAngularSpeed(u);
}



function universeInfo(status) {
    this.universeWidth = 800;    //Width of universe in pixels
    this.universeHeight = 600;   //Height of universe in pixels
    this.defaultG = 20000;//Default strength of gravity
    this.G = this.defaultG;             //strength of gravity
    this.dt = 0.5;               //Changing this is a mesu. Most of the speed is measured in framses anyway
    this.rotationSpeed = 0.2;    //Speed at which ships rotate when you press keys
    this.earthRadius = 75;       //Size of planet inside
    this.projectileSpeed = 20;   //Speed at which a missile is fired
    this.explosionLength = 15;   //Time a ship spends exploding
    this.overheatTemp = 20;      //Temperature at which a ship starts overheating
    this.missileCooldown = 9;    //Min time between missiles
    this.enginesPower = 1.5;       //Power of the ship engine
    this.engineCoolingRate = 0.5;//Rate at which the engine cools by default
    this.engineHeatingRate = 1.5;  //Rate at which the engine heats when thrust is on
    this.missileLiveTime = 5;    //Time after which a missile can hit ship that fired it
    this.missileTempIncrease = 8;//Temperature increase by firing a missiles
    this.minWeaponWaitTime = 30; //Minimum wait for a weapon 200 seems reasonable
    this.maxWeaponWaitTime = 50;//Max wait for a weapon 500 seems reasonable
    this.weaponTypes = status.weaponTypes;       //All the possible weapons
    this.guidedAgility = 0.1;        //How fast can the guided missile turn
    this.magnetStrength = 2;       //How strong the magnet pull is
    this.bombTimer = 60;            //How long before bomb detonation
    this.blastRadius = 130;          //Of the bomb
    this.effectDuration = 15;        //Duration of weapon effects, in frames
    this.infiniteAmmo = true;
    this.missiles = [];          //Array storing all the flying missiles 
    this.successfulMissiles = [];//Keeps track of the missiles that have hit their targets.
    this.eyesChasing = 1;        //Who the eyes of the Earth are chasing
    this.weaponTimer = 0;        //Time until a weapon spawns
    this.floatingBox = new presentBox(null);//The one possible weapon box
    this.weaponsCurrent = [];        //Array that keeps track of weapons currently flying around
    this.GravityWarpTimer = 0;       //Time left of extra gravity
    this.topologyCounter = 0;        //Time left in the topolgizer effect
    this.topologyFlipping = 0;       //0 if it's not currently changing, H or V if it's changing
    this.mode = "Torus";         //Universe is a torus. Only mode for now. Other possibilites: InvertX, InvertY (klein bottles), RP2
    this.O = new vec(this.universeWidth/2, this.universeHeight/2); //The origin, the planet.
    this.starDisplay = [];
    this.Player = null;
}
















/////////////////////////////// Things running in the game ////////////////////////

function gameOver(c, g, imgList, status, u) {
    clearKeys(status, u);
    status.scene = "GameOver";
    drawBackground(c, g, imgList, u);
    drawEyes(c, g, u);
    u.Player.One.draw(c, g, imgList, status, u);
    u.Player.Two.draw(c, g, imgList, status, u);
    drawSuccessfulMissiles(c, g, imgList, u).then(
        function () {
            c.ctx.font = "30px Monoton";
            c.ctx.textAlign = "center";
            if (status.winner == "none") {
                c.ctx.fillStyle = "red";
                c.ctx.fillText("You both lose", g.gameWidth/2, g.gameHeight/2);
            } else if (status.winner == "P1") {
                c.ctx.fillStyle = "yellow";
                c.ctx.fillText("Player one wins", g.gameWidth/2, g.gameHeight/2);
                status.score[0]++;
            } else {
                c.ctx.fillStyle = "turquoise";
                c.ctx.fillText("Player two wins", g.gameWidth/2, g.gameHeight/2);
                status.score[1]++;
            }
            c.ctx.fillText("Press R to restart", g.gameWidth/2, g.gameHeight*3/4); 
            c.ctx.fillText("Press M to go to the Menu", g.gameWidth/2, g.gameHeight*3/4+60);
            showScore(c, g, status, u);
        }
    );
}

function playAnim(c, g, imgList, status, u) {
    var currTime = Date.now();
    if (currTime - then > 40 && status.playing && !status.paused) {       
        then = Date.now();
        drawBackground(c, g, imgList, u);
        showScore(c, g, status, u);
        if (u.Player.One.whoPlaying != "human"){
                    u.Player.One.makeDecision(u.Player.One.whoPlaying, status, u);
        }
        if (u.Player.Two.whoPlaying != "human"){
            u.Player.Two.makeDecision(u.Player.Two.whoPlaying, status, u);
        }
        u.Player.One.takeStep(u, status);
        u.Player.Two.takeStep(u, status);
        //console.log("x: "+u.Player.One.pos.x.toFixed(0) + ", y: "+u.Player.One.pos.y.toFixed(0) );
        u.Player.One.draw(c, g, imgList, status, u);
        u.Player.Two.draw(c, g, imgList, status, u);
        if (u.Player.One.crashed || u.Player.Two.crashed) {
            status.playing = false;
            status.winner = "none";
            if (!u.Player.One.exploding) {
                status.winner = "P1";
            } else if (!u.Player.Two.exploding) {
                status.winner = "P2";
            }
        }
        u.Player.One.fireMissile(status, u);
        u.Player.Two.fireMissile(status, u);
        for (var m = 0; m < u.missiles.length; m++) {
            u.missiles[m].history.push(u.missiles[m].pos);
            u.missiles[m].takeStep(u);
            u.missiles[m].draw(c, g, u);
            if (u.missiles[m].crashed) {
                u.missiles.splice(m, 1);
                m--;
            }
        }
        dealWithBoxes(u);
        u.floatingBox.draw(c, g, imgList, u);
        drawEyes(c, g, u);
        dealWithWeapons(u);
        if (u.topologyCounter > 0){
            u.topologyCounter--;
        }
        drawWeapons(c, g, imgList, u);
        specialEffects(u);
        if (status.playing && !status.paused) {
            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
        }
    } else {
        if (status.playing && !status.paused) {
            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
        }
    }
    if (!status.playing) {
        gameOver(c, g, imgList, status, u);
    }
}

//function getTrajectory2(){
//    var A = JSON.parse(getTrajectory());
//    for (var i = 0; i <  A.length; i++){
//        Object.setPrototypeOf(A[i], vec.prototype);
//    }
//    return A;
//}

function clearKeys(status, u){
    status.keysList[u.Player.One.keyScheme(status).thrust] = false;
    status.keysList[u.Player.One.keyScheme(status).fire] = false;
    status.keysList[u.Player.One.keyScheme(status).moveLeft] = false;
    status.keysList[u.Player.One.keyScheme(status).moveRight] = false;
    status.keysList[u.Player.Two.keyScheme(status).thrust] = false;
    status.keysList[u.Player.Two.keyScheme(status).fire] = false;
    status.keysList[u.Player.Two.keyScheme(status).moveLeft] = false;
    status.keysList[u.Player.Two.keyScheme(status).moveRight] = false;
}

function startTheGame(c, g, imgList, status, u) {
    document.getElementById("mainMenu").style.display = "none";
    u = new universeInfo(status);
    g = new graphicalInfo(u);
    c = new makeContext(g);
    u.Player = new playerTypes(u);
    if (status.onePlayer === 0){
        u.Player.Two.whoPlaying = brain2;
    }
    if (status.onePlayer <= 1){
        u.Player.One.whoPlaying = brain1;
        //u.floatingBox.open(u.Player.Two, u);
    }
    
//    u.Player.One.vel = u.Player.One.vel.rot( Math.floor(Math.random() * 20)/20 * 2 * Math.PI);
    //u.Player.Two.whoPlaying = brain2;
    //u.mode = "Torus";
    if (Math.floor(Math.random()*2) > 0) {
        u.eyesChasing = u.Player.One;
    } else {
        u.eyesChasing = u.Player.Two;
    }
    getBackground(100, u);
    drawBackground(c, g, imgList, u);
    u.missiles = [];
    u.successfulMissiles = [];
    u.weaponsCurrent = [];
    clearSpecialEffects(u);
    status.playing = true;
    then = Date.now();
    status.scene = "start";
    resetWeaponTimer(u);
    u.floatingBox = new presentBox(null);
    u.floatingBox.existing = false;
    playAnim(c, g, imgList, status, u);
}

function showScore(c, g, status, u) {
    c.ctx.font = "20px Bungee Shade";
    c.ctx.textAlign = "center";
    c.ctx.fillStyle = "yellow";
    c.ctx.fillText(status.score[0], u.universeWidth/2-30 + g.hOffset, 25 + g.vOffset);
    c.ctx.fillStyle = "turquoise";
    c.ctx.fillText(status.score[1], u.universeWidth/2+30 + g.hOffset, 25 + g.vOffset);
    c.ctx.fillStyle = "white";
    c.ctx.fillText("-", u.universeWidth/2 + g.hOffset, 25 + g.vOffset);
}

function showMenu(c, g, imgList, status, u) {
    document.getElementById("mainMenu").style.display = "";
    c.ctx.fillStyle = "black";
    c.ctx.fillRect(0,0,1000,1000);
    status.scene = "menu";
    getBackground(50, u);
    drawBackground(c, g, imgList, u);
    if (Math.floor(Math.random()*2) > 0) {
        document.getElementById("mainMenu").style.color = "turquoise";
    } else {
        document.getElementById("mainMenu").style.color = "yellow";
    }
//    c.ctx.font = "100px Faster One";
//    c.ctx.textAlign = "center";
//    c.ctx.fillText("Cosmic", g.gameWidth/2, g.gameHeight/2-150);
//    c.ctx.fillText("Coconut!", g.gameWidth/2, g.gameHeight/2-20);
//    c.ctx.font = "30px Bungee Shade";
//    c.ctx.fillText("Press S to start", g.gameWidth/2, 3* g.gameHeight/4);
//    c.ctx.fillText("Press O for options", g.gameWidth/2, 3* g.gameHeight/4 + 70);
    //c.ctx.fillText("Press C for credits", g.gameWidth/2, 3* g.gameHeight/4 + 100);
   // c.ctx.font = "20px Bungee Shade";
    //c.ctx.fillText("In nomin: Eva", g.gameWidth/2, 3* g.gameHeight/4+40);
//    var places = getTrajectory2(); I WAS TRYING TO PLOT THE WEIRD TRAJECTORY
//    c.ctx.fillStyle = "red";
//    for (var t = 0; t < places.length; t++){
//        c.ctx.fillRect(places[t].x + g.hOffset, places[t].y + g.vOffset, 1, 1);
//    }
}

function showOptions(c, g, imgList, status, u) {
    document.getElementById("mainMenu").style.display = "none";
    c.ctx.fillStyle = "black";
    c.ctx.fillRect(0,0,1000,1000);
    status.scene = "options";
    getBackground(50, u);
    drawBackground(c, g, imgList, u);
//    c.ctx.fillStyle = "white";
//    c.ctx.font = "100px Faster One";
//    c.ctx.fillText("Options", g.gameWidth/2, 100);
//    c.ctx.font = "40px Bungee Shade";
//    c.ctx.textAlign = "left";
//    c.ctx.fillText("Controls", 30, 200);
//    c.ctx.font = "18px Bungee Shade";
//    c.ctx.textAlign = "center";
//    c.ctx.fillText("Press M to go back to menu", g.gameWidth/2, g.gameHeight - 50);
    document.getElementById("options").style.display = "block";
    document.getElementById("options").style.top = g.vOffset.toString() + "px";
    document.getElementById("options").style.left = g.hOffset.toString()+ "px";
    makeWeaponsTable(imgList, status);
    showControlButtons(status);
}

function controlsClickingListeners(status){
    document.getElementById("p1left").addEventListener("click", function () {
        changeControls(status.p1Keys, "left", "p1left", status);
    });
    document.getElementById("p1right").addEventListener("click", function () {
        changeControls(status.p1Keys, "right", "p1right", status);
    });
    document.getElementById("p1thrust").addEventListener("click", function () {
        changeControls(status.p1Keys, "thrust", "p1thrust", status);
    });
    document.getElementById("p1fire").addEventListener("click", function () {
        changeControls(status.p1Keys, "fire", "p1fire", status);
    });
    document.getElementById("p1special").addEventListener("click", function () {
        changeControls(status.p1Keys, "special", "p1special", status);
    });
    document.getElementById("p2left").addEventListener("click", function () {
        changeControls(status.p2Keys, "left", "p2left", status);
    });
    document.getElementById("p2right").addEventListener("click", function () {
        changeControls(status.p2Keys, "right", "p2right", status);
    });
    document.getElementById("p2thrust").addEventListener("click", function () {
        changeControls(status.p2Keys, "thrust", "p2thrust", status);
    });
    document.getElementById("p2fire").addEventListener("click", function () {
        changeControls(status.p2Keys, "fire", "p2fire", status);
    });
    document.getElementById("p2special").addEventListener("click", function () {
        changeControls(status.p2Keys, "special", "p2special", status);
    });
    document.getElementById("symmetricControls").addEventListener("click", function () {
        symmetricControls(status);
        showControlButtons(status);
    });
}

function symmetricControls(status) { //Makes player one have the same controls as P2
    status.p1Keys.changeKey("left",status.p2Keys.moveLeft);
    status.p1Keys.changeKey("right",status.p2Keys.moveRight);
    status.p1Keys.changeKey("thrust",status.p2Keys.thrust);
    status.p1Keys.changeKey("fire",status.p2Keys.fire);
    status.p1Keys.changeKey("special",status.p2Keys.special);
}

function changeControls(whichPlayer, whichKey, buttonId, status) {
    if (status.whichKeyIsChanging !== null) {
        showControlButtons(status);
    }
    document.getElementById(buttonId).innerHTML = "Choose key now";
    status.changingKey = true;
    //console.log(status.whichKeyIsChanging);
    status.whichKeyIsChanging = [whichPlayer, whichKey, buttonId];
}

function showControlButtons(status) {
    document.getElementById("p1left").innerHTML = stringFromCharCode(status.p1Keys.moveLeft);
    document.getElementById("p1right").innerHTML = stringFromCharCode(status.p1Keys.moveRight);
    document.getElementById("p1thrust").innerHTML = stringFromCharCode(status.p1Keys.thrust);
    document.getElementById("p1fire").innerHTML = stringFromCharCode(status.p1Keys.fire);
    document.getElementById("p1special").innerHTML = stringFromCharCode(status.p1Keys.special);
    document.getElementById("p2left").innerHTML = stringFromCharCode(status.p2Keys.moveLeft);
    document.getElementById("p2right").innerHTML = stringFromCharCode(status.p2Keys.moveRight);
    document.getElementById("p2thrust").innerHTML = stringFromCharCode(status.p2Keys.thrust);
    document.getElementById("p2fire").innerHTML = stringFromCharCode(status.p2Keys.fire);
    document.getElementById("p2special").innerHTML = stringFromCharCode(status.p2Keys.special);
    
}


function showCredits(c, g, imgList, status, u) {
    c.ctx.fillStyle = "black";
    c.ctx.fillRect(0,0,1000,1000);
    status.scene = "credits";
    getBackground(50, u);
    drawBackground(c, g, imgList, u);
    var randomNo = Math.floor(5*Math.random());
    var moisesTask;
    switch (randomNo) {
        case 0:
            moisesTask = "Potato peeling";
            break;
        case 1:
            moisesTask = "Extreme napping";
            break;
        case 2:
            moisesTask = "Cheeto tasting";
            break;
        case 3:
            moisesTask = "Water smelling";
            break;
        case 4:
            moisesTask = "Synergy deconstructing";
            break;
    }
    randomNo = Math.floor(12*Math.random());
    var sponsor;
    switch (randomNo) {
        case 0:
            sponsor = "Puleva";
            break;
        case 1:
            sponsor = "Panrico";
            break;
        case 2:
            sponsor = "Bimbo";
            break;
        case 3:
            sponsor = "AhorraMás";
            break;
        case 4:
            sponsor = "Hipercor";
            break;
        case 5:
            sponsor = "Amena";
            break;
        case 6:
            sponsor = "Ikea";
            break;
        case 7:
            sponsor = "Sony";
            break;
        case 8:
            sponsor = "Purificación García";
            break;
        case 9:
            sponsor = "Juteco";
            break;
        case 10:
            sponsor = "Renfe";
            break;
        case 11:
            sponsor = "Canal de Isabel II";
            break;
    }
    c.ctx.fillStyle = "orange";
    c.ctx.font = "100px Faster One";
    c.ctx.fillText("Credits", g.gameWidth/2, 100);
    c.ctx.font = "25px Bungee Shade";
    c.ctx.textAlign = "left";
    c.ctx.fillText("Original idea", 30, 230);
    c.ctx.fillText("Googly eyes", 30, 290);
    c.ctx.fillText(moisesTask, 30, 350);
    c.ctx.fillText("Corporate partnership", 30, 410);
    c.ctx.textAlign = "right";
    c.ctx.fillText("Spacewar!", g.gameWidth - 30, 230);
    c.ctx.fillText("Eva",  g.gameWidth - 30, 290);
    c.ctx.fillText("Moisés",  g.gameWidth - 30, 350);
    c.ctx.fillText(sponsor,  g.gameWidth - 30, 410);
    c.ctx.textAlign = "center";
    c.ctx.font = "15px Bungee Shade";
    c.ctx.fillText("Press M to go back to menu", g.gameWidth/2, g.gameHeight - 100);
}

function pause(c, g, status) {
    status.paused = true;
    c.ctx.fillStyle = "red";
    c.ctx.font = "90px Monoton";
    c.ctx.textAlign = "center";
    c.ctx.fillText("PAUSED", g.gameWidth/2, g.gameHeight/2);
}

function unPause(c, g, imgList, status, u) {
    status.paused = false;
    debugger;
    playAnim(c, g, imgList, status, u);
}

function mainMenuListeners(c, g, imgList, status, u){                                 
    document.getElementById("1PlayerStart").addEventListener("click", function (e) {
        if (e.shiftKey){
            status.onePlayer = 0;
        } else {
            status.onePlayer = 1;
        }
        startTheGame(c, g, imgList, status, u);
    });                                 
    document.getElementById("2PlayerStart").addEventListener("click", function () {
        status.onePlayer = 2;
        startTheGame(c, g, imgList, status, u);
    });                                 
    document.getElementById("openOptions").addEventListener("click", function () {
        showOptions(c, g, imgList, status, u);
    });
}

function makeWeaponsTable(imgList, status){
    let wTable = document.getElementById("weaponsTable");
    if (wTable.children.length === 0){
        for (let i in status.weaponTypes){
            let w = status.weaponTypes[i];
            let newRow = document.createElement("TR");
            newRow.innerHTML = [
                    "<td>",
                    "<img class=\"weaponIcon\" src=\""+imgList[w.src].src +"\"/>",
                    "</td>",
                    "<td>",
                    "<label class=\"switch\">",
                    "<input type=\"checkbox\" id=\""+w.type+"Switch\">",
                    "<span class=\"slider round\"></span>",
                    "</label>",
                    "</td>"].join("\n");
            wTable.appendChild(newRow);
            document.getElementById(w.type+"Switch").onclick = toggleWeapon(w);
        }
    }
    for (let w in status.weaponTypes){
        document.getElementById(status.weaponTypes[w].type+"Switch").checked = status.weaponTypes[w].exists;
    }
}


function toggleWeapon(w){
    return function(){
                w.exists = document.getElementById(w.type+"Switch").checked;
            };
}

function finishLoading() {
    //console.log("Loaded");
    document.getElementById("LoadingMessage").style.color = "#000033";
    var status = new gameStatus();
    var imgList = new getImages();
    var u = new universeInfo(status);
    var g = new graphicalInfo(u);
    var c = new makeContext(g);
    //symmetricControls(status); ////Remove this
    c.area.style.display = "inline";
    setKeyListeners(c, g, imgList, status, u);
    showMenu(c, g, imgList, status, u);
    controlsClickingListeners(status); 
    mainMenuListeners(c, g, imgList, status, u);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//async function demo() {
//  await sleep(0);
//  finishLoading();
//}
if (displayingGraphics){
    document.fonts.onloadingdone = finishLoading;
}

//document.fonts.ready.then(finishLoading());
//
//if (displayingGraphics) {
//    window.onload = demo();
//}

/*
Do division instead of substraction in the function LeaveScreen

Add googly eyes to planet - DONE

Start menu - DONE

Am I sure about hitbox? I'm more sure now

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

Flip pictures when they need ot be flipped.
Topologizer rays are looking wrong

Draw neural network at work
Implement shooting yass


*/

if (!displayingGraphics) {
    module.exports = {
        universeInfo:universeInfo,
        playerTypes:playerTypes,
        gameStatus:gameStatus,
        ship:ship,
    };
}

var B1 = '[{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":3.9724834784874092},{"inputs":[],"ID":"1","lit":-1.3221576246143594},{"inputs":[],"ID":"2","lit":0.47807618548560704},{"inputs":[],"ID":"3","lit":-1.7026608049435312},{"inputs":[],"ID":"4","lit":-6.018856231472062},{"inputs":[],"ID":"5","lit":-0.995438256822041},{"inputs":[],"ID":"6","lit":-0.2},{"inputs":[],"ID":"7","lit":-0.36052099660423403},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":0.9968540073006872},{"inputs":[],"ID":"10","lit":2.8175946935957645},{"inputs":[],"ID":"11","lit":-4.417594693595764},{"inputs":[],"ID":"12","lit":-0.08008661272876956},{"inputs":[],"ID":"13","lit":0.06660328911202225}]},{"neuronList":[{"inputs":[],"ID":"14","lit":1.184439585229713},{"inputs":[],"ID":"15","lit":2.7025981316865053},{"inputs":[],"ID":"16","lit":-0.029249582170223613},{"inputs":[],"ID":"17","lit":-0.12243236620861225}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.263894919625673,0.8914295239964155,0.9795347897893338,-0.9457671036545394,-0.23345631397191347,-0.3073254301048421,0.18917372142305408,-0.19574286477088848,-0.1137253635463351,0.7414612585123393],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6975329097400942,-0.34056213149440084,-0.3896472623924714,0.07029874244614662,0.23608620685956988,0.8116719293748799,0.9842784563082354,-0.7819761605858991,-0.8882020411564764,0.39066201177709947],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.37159628083691376,0.5188938011107652,0.6133784504948576,-0.7389159173552129,-0.3891905776985238,0.302129602308989,0.32970455483895916,0.6701126878964226,-0.843867643137973,0.22678014867812565],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.40936282257018203,0.5828574805463491,-0.23482888831285031,0.5988006755613647,0.5976428860112518,-0.8746943755431497,-0.4262717800750246,-0.4057773283777378,0.5006320434696209,-0.9596136290096953],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.7763642220112434,-0.29485308526047654,0.19077987685192024,-0.9447136155099951,0.8351678124167733,-0.44061777068279334,0.9039389290780991,-0.4392902901670206,-0.569893194687684,0.5945135269033051],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8650810735093305,-0.6348596972740724,-0.05519389461787342,0.07934158608275903,0.8622301507875123,-0.8312084925065537,0.03567478120811202,0.4631294586544467,0.4749669647977637,-0.8875443773018625],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[-0.2587839749117274,0.3166206577179956,0.9821992640002143,-0.2722278106391268,0.31409043959416844,0.2905449660535999,0.47760454864397545,-0.6998540119744433,-0.2785237785323338,0.8413978272839623,-0.1541066404190843,-0.21623170880268458,-0.5954586785136985,-0.7227003737611548,null,null,null,null,-0.1417880274094902,-0.6872017022466109,-0.3406659720169362,0.9702302530159241,-0.2490417220107456,-0.6819347880950165],"ID":"24","lit":0},{"inputs":[-0.2634361652300531,0.9009822530565799,-0.0070448572299457255,-0.6266184240051671,-0.5494153654352547,0.0919251359142954,0.11039908259375816,0.07344089577365757,-0.5619970765249767,-0.6888439030667874,-0.951972420385561,-0.18057950213142537,-0.6247910178955319,-0.9301603777493715,null,null,null,null,-0.2156118198580276,-0.8764985375982492,0.0975512988749738,-0.35817298147004606,0.6246897857604194,-0.23906589014749613],"ID":"25","lit":0},{"inputs":[0.8374155120965664,0.7092179712286112,-0.572344663934176,0.5256303890532693,-0.4584290069906685,-0.40794928835500616,0.23520261408105114,-0.8290090932603532,0.862498221372027,-0.833124852469533,0.7628614587354422,-0.7612723692075232,0.777587418024631,0.9796776282140761,null,null,null,null,-0.9294693264685271,-0.5928095465802335,0.09953509500311779,-0.5843577286821895,0.38856050633899175,0.2135709323119916],"ID":"26","lit":10.184864958957888},{"inputs":[0.3333763950101321,-0.39970346777627785,0.7551274449481636,0.4564038451530385,0.6241529337012511,-0.8157068849726165,-0.6666516748830924,-0.06203261921507725,0.427836205167196,0.3295448336790728,0.6117013393480224,-0.5725739709676395,-0.3271800008166947,0.10338746342204838,null,null,null,null,-0.12431112709005979,-0.9130592775140607,-0.5476582069973511,0.8748949198211584,-0.2031951548183646,-0.14983780600222227],"ID":"27","lit":3.690063340793296},{"inputs":[0.20657580499277498,0.7875371926055602,-0.686704196306082,-0.9782996146350377,-0.9547281942326584,-0.47732536566750344,0.34725385484601456,-0.12600354424025617,0.06371001203068953,-0.2561911646113912,0.4035372456095734,-0.6711631183887103,0.25475507538681186,0.8044599224066379,null,null,null,null,0.5176488550061001,-0.7749474050260962,-0.4801523082524832,0.4622898745196585,-0.051938545351262355,-0.21146761473295952],"ID":"28","lit":11.257715039563568},{"inputs":[-0.5284828606365523,-0.3107566934826453,0.17568262926857223,0.5835518320770815,-0.83653180111587,-0.735753799357844,0.7696098435578471,-0.011728289681465463,0.46457282062879507,-0.739578276476061,0.1458376309912677,-0.06443227799223314,0.3288157054767564,-0.015487107126911464,null,null,null,null,0.2506567543804668,-0.5781361286028059,-0.11413486949261158,0.03344935340293825,-0.6200128970217751,-0.7260968801858243],"ID":"29","lit":3.4150502459346583},{"inputs":[0.7237060405641238,-0.7243528860037308,0.6645459119662168,0.04271065343637635,-0.26919090837850385,-0.4288145877660524,0.11495950814698319,0.2448650341120994,-0.853369439108354,0.23190513521201006,0.5829906476456844,0.797721163294593,0.5151859644508847,-0.19159589318053,null,null,null,null,-0.8069044084271944,-0.977798770682105,-0.182187578709242,-0.6684332150936761,0.11736676188011866,0.5192017021507199],"ID":"30","lit":3.4558180200513458},{"inputs":[0.8111460379110036,-0.09475390591420678,-0.76021799853137,0.14623219260603854,0.1838723711833971,-0.869475835927762,0.5662844766538967,0.8429601783184626,0.3387793104245365,-0.6903680582152516,-0.19771613164023055,-0.9679291726239528,-0.7378304157597934,0.13163288543481644,null,null,null,null,0.05279267414374162,-0.5220649814555639,0.6825309503890497,0.4863323937102211,0.7184302273298309,-0.2526764942999101],"ID":"31","lit":5.514039814602371},{"inputs":[-0.5976982173482052,0.04534051020060684,0.1111457332669445,0.35758330186738113,0.7098455425792315,-0.9322664694170465,0.6550221879114264,0.07718745839253621,0.7216089669453196,0.6540001357438924,0.8852942026609131,-0.8348507653888715,0.13636217438498136,-0.40252659099929405,null,null,null,null,-0.7385264698202708,-0.4184058635788782,0.3537829526722867,0.6244245593501803,-0.9097312029397755,0.0063621418238651115],"ID":"32","lit":1.024976567950889},{"inputs":[0.19888083334950962,-0.6809992432113802,0.22525850045315862,0.6244270900691247,0.7584668798081798,-0.5558187495446749,-0.6165626406921828,0.4248665928860715,-0.15536660300008054,0.3233133223531618,0.5069857133831733,0.13995013318110003,-0.6110501197945649,-0.947550344658545,null,null,null,null,-0.5065516016794613,0.7624696806216122,-0.2309713587906467,-0.752779372616371,-0.12765784745707395,-0.713954358992087],"ID":"33","lit":0},{"inputs":[-0.2200522505833326,0.04816428770180872,-0.2584417387178519,-0.173024915460719,-0.5272194905370912,-0.44912146472382003,-0.5755180893198963,0.8615109116997752,-0.05807897700658282,-0.8401920579530954,-0.25134370361131053,0.12192772424230675,-0.5901004706220198,0.054974495534268246,null,null,null,null,0.27345447422774866,-0.2861073917085127,-0.9735347137787539,-0.8397866050545861,0.1146896408963838,0.7835946951302616],"ID":"34","lit":0.5665359204864349},{"inputs":[0.9488380349202206,0.42112007252268513,0.3076274404334385,0.24690851566478278,-0.3796633194309505,-0.6592248053847983,0.7424095200660196,0.19514718050448135,-0.3278868143057035,0.3770909562119562,0.41166700910949044,0.0910948465332599,-0.2169979271588623,0.2689612580940433,null,null,null,null,0.9360282993741397,0.8675255804525601,-0.9827034521444041,-0.18481153129132916,0.9658553485716117,-0.09792633753372866],"ID":"35","lit":6.502444990727387}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.09694860244369025,0.6721938943508583,0.10833082390969162,0.08446388531725586,0.5231670475034019,0.9808014440956787,0.42183336413213485,0.9500701721697917,0.9803153801495806,0.3222072629715988,0.5371055987052538,-0.18382031035810062],"ID":"36","lit":17.464476200569333},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.5003171516201256,-0.41284469954785363,-0.29224650408141317,0.021661312309023847,-0.431376874994093,-0.30989948533167205,-0.02595222866593582,-0.8633166622653214,-0.023806118418073414,0.5757029199016069,-0.1338415234470668,-0.8239519153185145],"ID":"37","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.5372540975214343,-0.106231175259931,-0.7780338455835488,0.2522046930555596,0.2330945899039665,-0.7505465275768106,-0.5574610452172235,0.19394922628240407,-0.273845694320461,-0.5456220794555138,0.2987812290961627,-0.481953445766006],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.006752318756786923,0.6242736197916019,-0.33994997588863113,0.5386660929290195,-0.5147463684084556,0.10487828450845296,-0.9141161039888147,-0.14980325769448286,-0.4167061191804142,0.3386637460675954,-0.8640016067944178,-0.03737637100282325],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":3.6454570470330494},{"inputs":[],"ID":"1","lit":-1.3058903697217368},{"inputs":[],"ID":"2","lit":-0.29442396862535314},{"inputs":[],"ID":"3","lit":-1.8105150687989442},{"inputs":[],"ID":"4","lit":6.71713896315935},{"inputs":[],"ID":"5","lit":12.630577934996042},{"inputs":[],"ID":"6","lit":0.2},{"inputs":[],"ID":"7","lit":-1.1064469256126421},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":0.9968540073006872},{"inputs":[],"ID":"10","lit":0.5300761109975629},{"inputs":[],"ID":"11","lit":-0.5300761109975629},{"inputs":[],"ID":"12","lit":-0.3299002640420325},{"inputs":[],"ID":"13","lit":0.47373660613629154}]},{"neuronList":[{"inputs":[],"ID":"14","lit":0.1872319129307006},{"inputs":[],"ID":"15","lit":1.0342758921788557},{"inputs":[],"ID":"16","lit":-0.40719640021241704},{"inputs":[],"ID":"17","lit":0.03354288859227303}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.26124995086909586,0.8867986691628839,0.9784788730831326,-0.9480184900080015,-0.23205423895952698,-0.30798236595957645,0.185211112155156,-0.1972955207424285,-0.11408816183112216,0.7411078196227165],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6992071886905412,-0.3384249648418225,-0.3927236219985796,0.06793218233817855,0.23373428058138113,0.8064059339289394,0.978251334825867,-0.7807080987842089,-0.8872481222751706,0.3904818518170734],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.3704021053931137,0.5176492566500127,0.6137010522420437,-0.7370390708553818,-0.39405617086024025,0.3009126270528647,0.3230492677310127,0.6695709630266897,-0.8410503793696057,0.22495858805129176],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.4110426907725509,0.5840247125258621,-0.23604375621290735,0.5990364520663689,0.5956328457009419,-0.8740436681122398,-0.42677658948840436,-0.4051411576564736,0.5019425596625757,-0.9609326626376451],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.774975890446856,-0.29458154324813357,0.19104108959966937,-0.9436996687060951,0.8361959496518617,-0.4413022999972164,0.9016735248556259,-0.43750630052309786,-0.5698429819907126,0.59146269460902],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8639624753702524,-0.6365850519176751,-0.05723461642000351,0.07741865149854611,0.8650824746777017,-0.8336992949264804,0.03547741983366306,0.4615017235092376,0.4734269232691344,-0.8885676989523544],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[-0.25887718570579976,0.3197050003377377,0.9815280717382647,-0.27284126940919096,0.3148357853888627,0.2940229629612138,0.47905548324747654,-0.7002466350461127,-0.2781496252845084,0.8461684161782245,-0.15250434152693554,-0.21617062738449982,-0.5930309511296602,-0.7212026492235353,null,null,null,null,-0.14180216375359028,-0.6805598830472157,-0.3420982913037834,0.9710547246575274,-0.2523832435827085,-0.6818341294219634],"ID":"24","lit":5.995930700402489},{"inputs":[-0.26258441052473785,0.9034487346237855,-0.007699348956969353,-0.6249105137738905,-0.5485952234042002,0.09096441752339486,0.10822167610528799,0.07173504574107041,-0.5652800478558072,-0.690185942916088,-0.9491473884500948,-0.18067614690182313,-0.6216510318644223,-0.9292610196918911,null,null,null,null,-0.21695877375951206,-0.875927497215488,0.0971603598184257,-0.35913766996154856,0.6230059153092641,-0.24159690908366185],"ID":"25","lit":0},{"inputs":[0.8435510398373529,0.7108420482632231,-0.5722700651745081,0.5263175905840898,-0.4607041695100632,-0.4072089384835358,0.23403144758346914,-0.8290489969583344,0.8636344248818041,-0.831217682348039,0.7644631882289823,-0.7632323246422079,0.7785028182635465,0.9780775792199233,null,null,null,null,-0.9355116034980068,-0.5942307867113547,0.10272388982933703,-0.5841163384670786,0.38551650987629393,0.2144245206028265],"ID":"26","lit":0},{"inputs":[0.33604204576857055,-0.4002095699772201,0.7556558483473161,0.45619290341326063,0.6264791026291238,-0.8162803103464183,-0.6674327455586964,-0.06496072012675809,0.43054369407142745,0.3299014031562239,0.611782846522523,-0.5723566006390797,-0.3235998742105829,0.10467794119680367,null,null,null,null,-0.12447865531264449,-0.9127589899614328,-0.5456685368752643,0.8755388335935348,-0.2034100427722362,-0.14736094695161678],"ID":"27","lit":0},{"inputs":[0.20637875020055046,0.790855340287035,-0.6923782708748633,-0.976787596856363,-0.9552503165350683,-0.47184053875748116,0.34807621203476125,-0.12445601331195208,0.06299697337030372,-0.2559016716309905,0.40429677807699954,-0.668965262096882,0.25691048249188697,0.8025644741982293,null,null,null,null,0.5207703422968696,-0.7735857355063404,-0.4778412911926517,0.46381929381882153,-0.051730081590209955,-0.21276356580605527],"ID":"28","lit":0},{"inputs":[-0.5294003590147335,-0.31380447045637194,0.18168944785677632,0.5846924463323626,-0.8403911708591049,-0.7344010844770301,0.7712786742628932,-0.010261286228516218,0.4663815190338062,-0.7408048249623748,0.14646259610472104,-0.06510755508355529,0.32768350600179813,-0.014622703395319738,null,null,null,null,0.2510554158060939,-0.5775177201101317,-0.11503768713601395,0.037982235042463286,-0.6203386628649412,-0.7278121598062677],"ID":"29","lit":0},{"inputs":[0.7250875490159038,-0.7250797651602721,0.6649503734256825,0.04245992141606426,-0.27393068494218237,-0.430901844173891,0.11487725308633605,0.24348526205326257,-0.8538858073922206,0.23388173624204964,0.5823922234223939,0.7965862963854327,0.5128522810176827,-0.19030720098024034,null,null,null,null,-0.805115228258962,-0.9784057196314201,-0.1859269520789293,-0.6687510470500847,0.11550388159621663,0.5179961476297164],"ID":"30","lit":0},{"inputs":[0.8033745279618246,-0.09401036274776416,-0.7600436173045599,0.14899498706580422,0.18253699513808852,-0.8703727211251231,0.5656152941982299,0.8410138673008248,0.3420193722928593,-0.690891671175729,-0.19726505215610263,-0.9643675667634829,-0.7386041936985036,0.12896315376796127,null,null,null,null,0.052912652451886415,-0.5190129977411013,0.6819223932590327,0.48508985291933737,0.7172342602491605,-0.2533910345305379],"ID":"31","lit":0},{"inputs":[-0.5982860423655955,0.04258772154426613,0.11411791611090934,0.35997367643202405,0.7121425546979812,-0.9315943717407177,0.6550572056753275,0.07540184119601093,0.7229724947974051,0.658527486669327,0.8843347482481125,-0.8364182356672742,0.13507724115511022,-0.40223546954790307,null,null,null,null,-0.7379575390461363,-0.42365791037883654,0.35537008617086685,0.6278282611865346,-0.9077606481000888,0.009061632729769868],"ID":"32","lit":0},{"inputs":[0.19809837972387861,-0.6826698105383725,0.22422909503355307,0.6248720005375265,0.7577542784436366,-0.5568124770122206,-0.6176869158827576,0.42849551891310533,-0.15538215620612292,0.3235572637882585,0.5071463716977348,0.14075914126922995,-0.6094582596702925,-0.9486941075765649,null,null,null,null,-0.5033578972603356,0.7638940265957966,-0.23229998653464598,-0.7576493929820252,-0.12812883730813876,-0.7089081821212964],"ID":"33","lit":0},{"inputs":[-0.21935842096003955,0.03933087162657833,-0.2568187281038623,-0.17624920609454503,-0.5271021034717356,-0.4443252937575752,-0.5767275894691087,0.8618987733343367,-0.057105707326335076,-0.8392602892073904,-0.25331041882294963,0.12048826730095437,-0.5889870881333695,0.05363503527908686,null,null,null,null,0.2721143163514946,-0.28762805887965726,-0.974436334279346,-0.8336512392026556,0.11544889181243183,0.7837101508181699],"ID":"34","lit":0},{"inputs":[0.9484759038720504,0.41515460175237323,0.3068943076821722,0.24799696221728645,-0.37758812393836555,-0.6571781544195043,0.7423284745460347,0.20105086821470083,-0.3287867055478871,0.3791333727263045,0.4122164178963819,0.08981563132888529,-0.2184723860405981,0.2673182511378197,null,null,null,null,0.9358926989292798,0.8705786771872592,-0.9833515553504641,-0.18629569122136783,0.9640555661303223,-0.09557126668201565],"ID":"35","lit":0}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.09965146812971178,0.671421808445328,0.10841974458094886,0.08633234232460067,0.5218829063714446,0.9820157003538983,0.4209269032811057,0.945431463689352,0.9843889472515942,0.32124918904177885,0.5337235221717793,-0.183651247204359],"ID":"36","lit":0.5975032970991191},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.5001245549510304,-0.41109234794177874,-0.2927840523946471,0.023479687958327212,-0.4295203323262828,-0.3101717885363616,-0.021724848754533215,-0.8624491607461671,-0.024546891114768637,0.5769087533470043,-0.1333829249989672,-0.8229833000932899],"ID":"37","lit":2.9987121730560147},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.5363475540427227,-0.10591761653691657,-0.7795455545802645,0.2546632632614357,0.23494363168034194,-0.7501354047754596,-0.5572324958570741,0.19582879271006132,-0.27492407532254776,-0.5448676282761807,0.2999742912888052,-0.48221730087152476],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.004975630173103093,0.6224781427607539,-0.3418466862669971,0.54001800805488,-0.5155628565547802,0.10510799852223149,-0.9130382207354141,-0.15328277487961042,-0.4191608543174067,0.3392017223510973,-0.8640051789737497,-0.03694325875294452],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":3.9446925840828917},{"inputs":[],"ID":"1","lit":-1.309742870086709},{"inputs":[],"ID":"2","lit":0.4930554678626322},{"inputs":[],"ID":"3","lit":-1.7059906240342217},{"inputs":[],"ID":"4","lit":-7.105370228451655},{"inputs":[],"ID":"5","lit":-0.7829152287430055},{"inputs":[],"ID":"6","lit":-0.2},{"inputs":[],"ID":"7","lit":-0.36011171816634535},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":0.9976062658489563},{"inputs":[],"ID":"10","lit":2.823937829291334},{"inputs":[],"ID":"11","lit":-4.623937829291334},{"inputs":[],"ID":"12","lit":-0.07631464055691621},{"inputs":[],"ID":"13","lit":0.06716254290129112}]},{"neuronList":[{"inputs":[],"ID":"14","lit":0.9884917801527332},{"inputs":[],"ID":"15","lit":2.7318885589156126},{"inputs":[],"ID":"16","lit":0.004986325386233634},{"inputs":[],"ID":"17","lit":-0.10015272745284992}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.2610784883477639,0.8867695082934891,0.9799456773013404,-0.948142391069446,-0.2313052763831468,-0.3091636523324348,0.18625253202861328,-0.19727867096858923,-0.11399574522430601,0.7409351009977229],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6956867424997868,-0.3396559193911089,-0.39219113568594827,0.07068670648316344,0.23382670936841135,0.8060265872934714,0.9780915374633203,-0.7822498409055344,-0.8884676415073868,0.38368950498902377],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.3715481761320545,0.5208417031846979,0.6144061654021261,-0.7365193319391795,-0.3919964587680161,0.302105127066432,0.32325884667270743,0.6675763876628096,-0.8407320274213763,0.22216283889532873],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.4135003747256364,0.582380150762966,-0.2371268025293393,0.6023438138009783,0.5959185713835208,-0.8724335278009651,-0.4266747066888388,-0.4060286198697641,0.500353648801597,-0.9593933792359897],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.7758103800857991,-0.29445123500929143,0.19359436227076293,-0.9438836679755374,0.8359331485500163,-0.4410927826891191,0.9007331063709074,-0.44136704983828173,-0.5687620383739632,0.5948851786518203],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8668597356099955,-0.6351473767283587,-0.05671910139122542,0.07896028023355836,0.8646186296841203,-0.8343116377411858,0.034311920953003554,0.4600725329605098,0.47566777348955713,-0.8883574697136576],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[-0.2566295807597941,0.3213650659943906,0.9866535636456784,-0.2738909311112974,0.3160430779076615,0.29266874635038076,0.47684736545795664,-0.701465058241604,-0.2790329821626285,0.8464814613559504,-0.1514191704217229,-0.2146855384186567,-0.5930141990289773,-0.7232621536869545,null,null,null,null,-0.14204571284812617,-0.6806954395982077,-0.34393038616366234,0.9708783512225805,-0.2513754881678871,-0.678833601692586],"ID":"24","lit":0},{"inputs":[-0.26245019401383474,0.9026967798334055,-0.0028282373639546715,-0.6270699373611599,-0.5483119532787724,0.09027386959778472,0.10842962185785317,0.0704246761367978,-0.5658432447188402,-0.6902564949671642,-0.9514513752842778,-0.17734014316830646,-0.6211150155522157,-0.9315749403735141,null,null,null,null,-0.21577445821837019,-0.8757347631533317,0.09923489129498492,-0.36124155071239344,0.6224887964309208,-0.24115246811896002],"ID":"25","lit":0},{"inputs":[0.8421874941079195,0.7098149990287439,-0.5742038216881019,0.5257404171323747,-0.46019684020884394,-0.4066311702863634,0.23544476925562866,-0.8272880342040831,0.8646135951851669,-0.8297374332751563,0.7646835919679904,-0.761119356049888,0.7788162753625495,0.9809832376658966,null,null,null,null,-0.9347982847077306,-0.59406013851633,0.10264167604540093,-0.584783539047971,0.3857532263770545,0.21531248131109235],"ID":"26","lit":10.773626980265725},{"inputs":[0.3311162200075984,-0.4005590096433188,0.7573702345235599,0.45588710088011236,0.6256582643067177,-0.8164906997708932,-0.6656769670961108,-0.06630126467947212,0.4303541882990296,0.3273762355480891,0.6128086353220696,-0.5720636229052168,-0.3257981379074319,0.10274123964995949,null,null,null,null,-0.12230827245850825,-0.9124874088757111,-0.5463224324122583,0.8765753423654695,-0.2021625699304014,-0.14854232333692563],"ID":"27","lit":2.9416184914103805},{"inputs":[0.20303452851569367,0.7900530007454857,-0.6918842016979256,-0.9773773006687914,-0.9548229607986977,-0.4750647009355158,0.3472073999921455,-0.12496546157580356,0.0631327007988341,-0.2592518669162766,0.40267106387886403,-0.669695264391076,0.2550532124295053,0.801041403580286,null,null,null,null,0.5206254034579909,-0.7728141518183798,-0.4758515313290737,0.46358508803709386,-0.05295476272535059,-0.2124741464359713],"ID":"28","lit":12.296852226222397},{"inputs":[-0.5282890822269277,-0.3111086094400689,0.177524339167545,0.5836192527262924,-0.8372276792340562,-0.7406783357202482,0.7701137962264528,-0.010558746134401688,0.4656286090043817,-0.7406529709634864,0.1418156246860574,-0.06271052222678088,0.3261518352882308,-0.015011979736306915,null,null,null,null,0.2527085563399847,-0.5795751802716422,-0.11377022939695149,0.03512185919379833,-0.6177626865761099,-0.7284053695025798],"ID":"29","lit":4.185193400036195},{"inputs":[0.7278038100787375,-0.7260470990195494,0.6667216853410796,0.04439871949678799,-0.27387806044384316,-0.42914903638154006,0.11199596719917493,0.24255660440650473,-0.8550367451097353,0.2274139700829436,0.581475239572652,0.8002437002219531,0.5136818971304097,-0.1890949621717634,null,null,null,null,-0.8055937777703844,-0.9822664387842696,-0.18519487215635366,-0.6677303439852513,0.11562378188290658,0.5184377024599338],"ID":"30","lit":3.508834057028537},{"inputs":[0.8023364770253604,-0.09428165540541344,-0.7616178494180644,0.14867830765066778,0.18085937002564154,-0.8700761298718683,0.5661042005714733,0.8457469298354184,0.3431458942452299,-0.690612870686682,-0.19770170774795823,-0.9643365817610263,-0.7384295461748596,0.12832270528430129,null,null,null,null,0.05398205153602811,-0.5208173256005366,0.6831976729081843,0.4863594196319655,0.7178590443703594,-0.2501838918049662],"ID":"31","lit":5.257523382569599},{"inputs":[-0.5983351945238837,0.04163227649639927,0.11217695159622403,0.3609927256213303,0.712594928608571,-0.9320050270439477,0.6551094131832902,0.07666430733015774,0.7236798232869893,0.655808312546544,0.884924008227634,-0.8365569116002984,0.1390517329722018,-0.4023825638326453,null,null,null,null,-0.7377912157711203,-0.42415842196209186,0.35499529471537655,0.6279995009878306,-0.9107897479728658,0.005887002873911636],"ID":"32","lit":0.23992293098115308},{"inputs":[0.19873062324274215,-0.6822533526931616,0.22323604996703011,0.6246563591318617,0.7583128279671821,-0.5560738440381471,-0.6151381580733392,0.42887376847900877,-0.15376851991096274,0.3222151084888743,0.5059055129349197,0.1414824706445056,-0.6090636310072532,-0.9492470506556654,null,null,null,null,-0.5029431099967595,0.7613130701672864,-0.22775121132783846,-0.7579213836850749,-0.12857301544384428,-0.7088794897344458],"ID":"33","lit":0},{"inputs":[-0.22071615015945462,0.04598976658433722,-0.25909901051995377,-0.17591590514539382,-0.5258132525127466,-0.44587000603111343,-0.5753331185718555,0.8540224708958494,-0.05698196597294142,-0.8413700030024076,-0.25087002204186976,0.12170057452502735,-0.5906264800808584,0.05216020753995448,null,null,null,null,0.26971319082982226,-0.2861317954305353,-0.9719439368296481,-0.8370456925225778,0.11292259856198304,0.7816729021828613],"ID":"34","lit":1.0152294145680165},{"inputs":[0.950557688493269,0.417503554722945,0.3067545944357953,0.24654676908640252,-0.3787663756406739,-0.6576757888451583,0.7399602311302179,0.20232654511490236,-0.32907555499736196,0.37632019669764183,0.41211330755259296,0.09345555679428197,-0.22007592675888593,0.26821635196052723,null,null,null,null,0.9356964388850368,0.8676967809347965,-0.9822107475227112,-0.1852731878409889,0.9646295970383285,-0.09664714150063626],"ID":"35","lit":6.731606241218056}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.1003680924798465,0.6703103463872275,0.10696043703055057,0.08534817135596813,0.5237873227377651,0.9805142134337622,0.4199335621814761,0.9472711546738726,0.9827666570538268,0.32100829419681737,0.5335652314280401,-0.1824499131740958],"ID":"36","lit":17.951066359800016},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.4987466228481895,-0.41094434996212337,-0.2924010547857029,0.01988295029920019,-0.4284676547993782,-0.30909473945027455,-0.023170705488882934,-0.86303114654502,-0.025592995154656954,0.5774288383785237,-0.13286841243503988,-0.8268250173438297],"ID":"37","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.5349657195889036,-0.10563535624458655,-0.7782760171789675,0.2519360351529925,0.23758499602192407,-0.7467153390382786,-0.5516850596424716,0.19514965502749157,-0.2754272262731024,-0.5450574961733098,0.301189293531097,-0.4818133626355074],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.004440013884222783,0.6234802583123848,-0.3423065161315842,0.5338584617352276,-0.514303747555251,0.1057526682567241,-0.9140910324232188,-0.15265058898315564,-0.4181280491537509,0.33946671977636467,-0.8634402890008335,-0.03724154107808529],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":4.114069793128318},{"inputs":[],"ID":"1","lit":-1.375941325788758},{"inputs":[],"ID":"2","lit":-0.7018146063100733},{"inputs":[],"ID":"3","lit":-1.665298105669708},{"inputs":[],"ID":"4","lit":-0.15558408998912227},{"inputs":[],"ID":"5","lit":-2.0627097933626444},{"inputs":[],"ID":"6","lit":-0.05},{"inputs":[],"ID":"7","lit":0.3917413765432629},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":1.1867188059778966},{"inputs":[],"ID":"10","lit":0.11179569325503415},{"inputs":[],"ID":"11","lit":1.6297969603347582},{"inputs":[],"ID":"12","lit":-0.07902845932871493},{"inputs":[],"ID":"13","lit":-0.12318644250900093}]},{"neuronList":[{"inputs":[],"ID":"14","lit":1.442448971750439},{"inputs":[],"ID":"15","lit":0.1937183355950983},{"inputs":[],"ID":"16","lit":-0.17066772692624177},{"inputs":[],"ID":"17","lit":-0.2749954273694523}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.2616416365446632,0.8867689912474537,0.9794229432740477,-0.9458004458312239,-0.23275933610538035,-0.3072336858321623,0.18838211823908685,-0.19470302067462328,-0.11258728351215565,0.7419558863953317],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6973807166236229,-0.3396454907511529,-0.39293258246514673,0.06956866265670017,0.23679013309047248,0.8085712557617939,0.9798878915525985,-0.7827037820835917,-0.8900397518813637,0.39003276387827523],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.37043445794699953,0.5201123271950568,0.6141485925799123,-0.7383894493489134,-0.38813499882181063,0.2998870576953109,0.3266659236421526,0.6680029966888736,-0.8390291316947481,0.22496369035496827],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.4131170898123424,0.5842303298633936,-0.23331474884155332,0.6028458704181541,0.5943933007600704,-0.8725140262854982,-0.4265647270697755,-0.40464394620839134,0.4993281269605679,-0.9588797425340958],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.775159611238946,-0.29656658583759715,0.19149106667096608,-0.9458310917914874,0.8348903384705558,-0.4403361931421888,0.8999872557709498,-0.44050637838803475,-0.5701124285296043,0.5938142258922662],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8644668338958919,-0.6360455215481265,-0.05599196607724191,0.0781745351136357,0.8625646569677409,-0.8321741270515336,0.034914751046587825,0.4642280456885418,0.47512340905400574,-0.8886060497508882],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[-0.2589223326786102,0.3182645542037249,0.9822255278781017,-0.27205222637398657,0.31404364037305704,0.28887748774527455,0.47816237194057637,-0.700042531220372,-0.27665854866080536,0.8412409006817013,-0.15340362507990704,-0.21732366758406382,-0.5930978222214411,-0.7226913236053316,null,null,null,null,-0.14318130515412963,-0.6854123648713765,-0.3411344168439571,0.9707023691469875,-0.24931699585389683,-0.67881871249798],"ID":"24","lit":0},{"inputs":[-0.26372467265178173,0.9026000090431412,-0.006499900165662867,-0.6279650059914441,-0.5500289762360249,0.09175462584550007,0.10690353246638248,0.07428650017431983,-0.5655154447536596,-0.6893651714464224,-0.9518678935462078,-0.17976703591426701,-0.6212721151619827,-0.9308280799153704,null,null,null,null,-0.2140149582228866,-0.8767223541407164,0.09832422858912393,-0.36095754959782156,0.6247554586451404,-0.2419679027628852],"ID":"25","lit":0},{"inputs":[0.842887134084391,0.7086534731527477,-0.5710300692125313,0.5257899343372341,-0.4611163385625708,-0.40912856101119116,0.2361299215824438,-0.8286082439342266,0.8625214469662894,-0.8323689832211363,0.7630140442931963,-0.7621287353649098,0.7779924162314512,0.9796139619935277,null,null,null,null,-0.9299986438582621,-0.5921798760039916,0.09805902910183482,-0.5852372116785509,0.3841533009972475,0.213598273940947],"ID":"26","lit":1.1328017926399363},{"inputs":[0.3326813111723772,-0.4014371269091473,0.7544490141740021,0.4549146796294199,0.6264695282465101,-0.8146995467622498,-0.6698932102805711,-0.06330149947906491,0.4292124901186743,0.3286542003366739,0.6107158841236856,-0.5714449889434627,-0.32628152601952876,0.1039624683233791,null,null,null,null,-0.12453495155306399,-0.9137103893019516,-0.5470820473780236,0.8777337077930755,-0.2036990259219751,-0.14848264385230883],"ID":"27","lit":2.1948405295005844},{"inputs":[0.2054859754585881,0.7898891261909292,-0.6865686139299549,-0.9777334580075879,-0.9547549000720541,-0.4750866303387249,0.34796529576529855,-0.1269051095990051,0.06457228869265387,-0.2573484140062032,0.404283717881583,-0.6710522052146558,0.25571652118118204,0.8045869247967108,null,null,null,null,0.5204564405666522,-0.7722741404146765,-0.47997794292535123,0.4615352559335465,-0.052250813208135904,-0.2123821927710866],"ID":"28","lit":1.5213697169428129},{"inputs":[-0.5290341292341142,-0.31122449894279486,0.17634339700058985,0.5842216901701129,-0.8370178638998476,-0.7412655770016947,0.7709681786738508,-0.012947099848106746,0.46569067003870024,-0.7470132582933059,0.14233255316412424,-0.06299252966144785,0.32524110858615796,-0.012706294412320816,null,null,null,null,0.252204570919663,-0.5793865199889802,-0.11508125099694191,0.0335407857368911,-0.6193950688005059,-0.7262188040700652],"ID":"29","lit":0},{"inputs":[0.7255788466530998,-0.7279973659102301,0.6646469824007029,0.04293490138853778,-0.2701250771508701,-0.429732078693938,0.11426672413390056,0.24334297525812762,-0.8532419498480263,0.23407297651692147,0.5812482359387977,0.7991343288813606,0.5138815558735232,-0.19303834625249036,null,null,null,null,-0.8074416202323108,-0.9784555788826454,-0.18184196227735047,-0.6681260853451826,0.11605881209573399,0.5189651296373488],"ID":"30","lit":5.241972256040767},{"inputs":[0.8108057828923815,-0.09429646836814509,-0.7607875222130569,0.14605190580058328,0.18494768125444608,-0.8676379874751995,0.5677682217581029,0.8457386794597501,0.34007440978374687,-0.6896513513849318,-0.19672944465880546,-0.9668113687871053,-0.7386367435877417,0.1317322870582325,null,null,null,null,0.052648429945060145,-0.5210211894447099,0.6820215567531585,0.48537555525161896,0.7179411767410022,-0.2512675451788952],"ID":"31","lit":3.7861008399524927},{"inputs":[-0.598278534049614,0.04461213878513929,0.1101691760843868,0.3626568186927918,0.7116477849818449,-0.932275348734671,0.6554046798089447,0.07670347111309722,0.7219164460681733,0.6545741485168034,0.8854121535214903,-0.8339280553602911,0.13995860681260439,-0.4016392607155183,null,null,null,null,-0.7381133943455682,-0.41940102180817596,0.35368244688724476,0.6246491833349593,-0.9089288287799739,0.005693944673444834],"ID":"32","lit":0},{"inputs":[0.19803118040085946,-0.6794646310342398,0.22447767484922176,0.6253373825894537,0.7617090850327841,-0.5564672848254023,-0.6150451411457522,0.42855521458928686,-0.15470751117626233,0.32190336237838213,0.5071077981620117,0.14125810502127314,-0.61073788901227,-0.9465179318044281,null,null,null,null,-0.5077543179681571,0.7634994110964748,-0.22842118347280918,-0.7528560480322551,-0.13015469954712,-0.7130431235825808],"ID":"33","lit":2.45773807493029},{"inputs":[-0.22014637313292,0.04830615518934209,-0.25856263527670753,-0.1729399893497229,-0.525545055873333,-0.4476960483190906,-0.5754001867146862,0.8609289202370718,-0.05744459478268225,-0.8391453642138434,-0.25108758786082747,0.12185000371752729,-0.5887384995362397,0.053700219212046124,null,null,null,null,0.27153111720211753,-0.2875818638270192,-0.9742646605651744,-0.8387155970016772,0.11459952955208597,0.7856028563339456],"ID":"34","lit":0.025718686870867306},{"inputs":[0.946602110304676,0.4208223196927234,0.30901634806913114,0.24703930617478165,-0.37789056737229554,-0.6592224357894677,0.7422776109123814,0.1955872333095481,-0.327856921721105,0.3785735324311069,0.41325469596320796,0.09106645657722676,-0.21746042257879927,0.2683694506735684,null,null,null,null,0.9354838880030628,0.8676200612725024,-0.9837288336816172,-0.18348114810332666,0.9649832721398555,-0.09923461611279831],"ID":"35","lit":4.445327540446201}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.0964651503323619,0.6713982859901614,0.10630155606780792,0.0857036102609914,0.5215655606958763,0.9789230963207337,0.41943774757274677,0.9507682771120388,0.9822342267037004,0.32161958418795206,0.5373038312630262,-0.18407026063804693],"ID":"36","lit":6.886426856230351},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.4999248105542637,-0.413293921942207,-0.29251273072857026,0.021123994150840125,-0.4296341663843481,-0.31094712218358306,-0.024795351043731706,-0.8621349620234232,-0.022646241481531146,0.576155517709412,-0.1334602351064099,-0.8245134070194543],"ID":"37","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.5335720753175696,-0.10694358363225344,-0.7791674796953945,0.25210164116145106,0.23790288934131865,-0.7510361316314402,-0.5589734187428904,0.1942177593821326,-0.274793039935649,-0.5435611341670776,0.3011231725685078,-0.480496921805685],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.00382843666640563,0.6257411962338093,-0.3395034153193943,0.5404147444598087,-0.5140582974928282,0.10538551049449044,-0.9143493741822644,-0.15109585417985782,-0.41637561879524476,0.3407114890824381,-0.8633526163364599,-0.03639573438005221],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":3.941726828198889},{"inputs":[],"ID":"1","lit":-1.30840153939306},{"inputs":[],"ID":"2","lit":0.4946322076875598},{"inputs":[],"ID":"3","lit":-1.706195838552347},{"inputs":[],"ID":"4","lit":-7.205004850824386},{"inputs":[],"ID":"5","lit":-0.7768122305689019},{"inputs":[],"ID":"6","lit":-0.2},{"inputs":[],"ID":"7","lit":-0.36006024062273645},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":1.4192151067246257},{"inputs":[],"ID":"10","lit":2.0706847303301763},{"inputs":[],"ID":"11","lit":-0.12909207674038403},{"inputs":[],"ID":"12","lit":0.3789903267071953},{"inputs":[],"ID":"13","lit":0.29703162485876616}]},{"neuronList":[{"inputs":[],"ID":"14","lit":1.5094975807820965},{"inputs":[],"ID":"15","lit":2.401391339804197},{"inputs":[],"ID":"16","lit":0.4160219823122652},{"inputs":[],"ID":"17","lit":0.450177456645942}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.26441032190446406,0.8910679557052463,0.9773129480652619,-0.9440965316676809,-0.2331462203624049,-0.3089285875795894,0.18827182110907903,-0.19476332899031068,-0.11447960893551735,0.7404273266446182],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.697474438046921,-0.3413044683131154,-0.3908358234509762,0.07082981669433401,0.23614213778946178,0.8088825891319504,0.9843101482294304,-0.7828247024860691,-0.8883931928283233,0.3909112626715323],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.37012925154685766,0.5226825620689248,0.6144710835671565,-0.738249051057599,-0.38853554313561167,0.3025059896150823,0.3288560714670229,0.6692190522849463,-0.8410924391082504,0.22322782245217856],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.4087729200415203,0.5829009546131071,-0.2345184104206269,0.6034761611887345,0.5976814425976388,-0.8745930033024869,-0.42772196399681867,-0.4055740927128367,0.5007609172351662,-0.9597147252847172],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.7757936059712992,-0.29591819468290026,0.19263255676792626,-0.9462231839671659,0.8345469685311248,-0.43958728961364424,0.9006485978769253,-0.44088879546142407,-0.5699068774548915,0.5934133992183372],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.86717907091002,-0.6343643795099808,-0.055067813068983444,0.07922980542598605,0.8621335153161855,-0.8300438711345974,0.037830887581179966,0.4634159101827679,0.4754393117147344,-0.8877709231915942],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[-0.2581629195258678,0.3170780068439769,0.9853849428538644,-0.2732108659872968,0.315591893348996,0.2919288393040749,0.4784631662409699,-0.7015245786070741,-0.27933756718866637,0.8414941637094819,-0.15340907744401888,-0.2162954181144755,-0.5948933584787827,-0.7248146805514951,null,null,null,null,-0.14204502519700898,-0.6791795011380922,-0.34081531171629414,0.9686984873455722,-0.25021410833212615,-0.6833692133237848],"ID":"24","lit":0},{"inputs":[-0.26285496705728123,0.9026278709415801,-0.006701741511439619,-0.6273226404946819,-0.5484012776351785,0.09162994601213655,0.10936450327596763,0.0720615153683102,-0.5616876581320905,-0.6898076575732006,-0.9512792410872548,-0.18006770970713964,-0.6243998300899598,-0.9303725011869739,null,null,null,null,-0.2150993124193276,-0.8775228228460904,0.09786763639524969,-0.3581147495871893,0.6244309302397699,-0.24172498744444337],"ID":"25","lit":0},{"inputs":[0.837065383020999,0.7109735166146748,-0.5717049483398051,0.5281874594374935,-0.4576659006583586,-0.40616103901885925,0.2364419090631597,-0.8263435804053717,0.8635297830140003,-0.8313315717879989,0.7636819970533919,-0.7615207881332474,0.7777843513604283,0.9800773080462137,null,null,null,null,-0.9328717146471964,-0.5924827782464558,0.09868355860205397,-0.5848591845142603,0.3869943897012373,0.21286230328141229],"ID":"26","lit":6.997739399678049},{"inputs":[0.3304607473345645,-0.4014863755830929,0.7546754249801471,0.45535909867432733,0.6244792297418724,-0.8158678373966993,-0.6666566862019043,-0.06575673986925079,0.4301363963062642,0.3282134236797896,0.6116798726243188,-0.5722510345989168,-0.3243184178681236,0.10467710518277637,null,null,null,null,-0.12180186721749567,-0.9127515740939806,-0.5477786177715834,0.8753039017456109,-0.20074074513938103,-0.14751917852332527],"ID":"27","lit":0},{"inputs":[0.20283461593279997,0.7899481107037368,-0.6872010257642457,-0.9784866291114068,-0.9535130195609568,-0.47489648041842986,0.3471311330475013,-0.12658357591154437,0.062034568000341704,-0.2566707426738278,0.40359776280876786,-0.6706851528342853,0.25452048632168606,0.8048872429522692,null,null,null,null,0.5188724708292205,-0.7747122776502557,-0.47906638711078636,0.4620487814815466,-0.05229292412882312,-0.2111122777020454],"ID":"28","lit":9.266255393362766},{"inputs":[-0.5303115906059035,-0.31070942638204624,0.17935145476881717,0.583455526897407,-0.8388956647271073,-0.7425722851933877,0.774086818008794,-0.011384468284736967,0.4653496621528593,-0.744503990500782,0.14632713882091022,-0.06492907867960332,0.32626918306242647,-0.014839270501054836,null,null,null,null,0.2519190811079838,-0.579291955986549,-0.11595660401926028,0.03534205544283556,-0.6201301939275254,-0.7275330215105151],"ID":"29","lit":3.719143864608931},{"inputs":[0.7236929332342881,-0.7256661144382572,0.6658179526517218,0.0435554129619314,-0.2677267293277549,-0.4280978332485806,0.11519904215504284,0.2434045778184879,-0.8546826029308945,0.23328090754977795,0.5831920734214877,0.799884894226971,0.514186219976209,-0.19210621459604435,null,null,null,null,-0.8050192560836565,-0.9775427003524539,-0.18191013091532132,-0.667501410496342,0.11654617656591265,0.5196579875462121],"ID":"30","lit":6.926478634719171},{"inputs":[0.8025176741472302,-0.09497488248072565,-0.761077315630984,0.14632128560866117,0.18381414576832444,-0.8690115268823939,0.566772945699244,0.8459939541838699,0.34003797198530034,-0.6893969663003919,-0.19560536237364387,-0.9685071676707817,-0.7376188070196852,0.12823552232660673,null,null,null,null,0.0543389246232129,-0.5219452023727564,0.682335554280762,0.4862794208579307,0.717650648761119,-0.2523361898616935],"ID":"31","lit":0.434342762470715},{"inputs":[-0.5975877566744549,0.04427183334287583,0.11191832399676582,0.36073789371828696,0.7102647124057517,-0.9316796114278295,0.6566668893902415,0.07591862536632861,0.7208783885439203,0.6550990486680953,0.8848955057506757,-0.8349033501390515,0.13786678305431335,-0.4024912133244229,null,null,null,null,-0.7399688241174947,-0.4180241021661451,0.3521793308991847,0.6256117449631062,-0.9090918990888498,0.006488911855418776],"ID":"32","lit":0},{"inputs":[0.19712569790454612,-0.6795412306894975,0.2241949311196476,0.624103986082254,0.7588674622444982,-0.5583487429454859,-0.6151379031730455,0.42594732377607386,-0.15404413708068534,0.3235775176942382,0.5077137979266425,0.1404880698385774,-0.6110486374334227,-0.9469708641022045,null,null,null,null,-0.5029918111195919,0.7636630740461625,-0.23069888957523205,-0.7525466895454382,-0.1291215729139301,-0.7108150102053655],"ID":"33","lit":0},{"inputs":[-0.21939006372987654,0.047092778225836525,-0.2571927511388708,-0.17370768654747126,-0.5262021252789909,-0.4466587526954964,-0.5756538013233559,0.8560986527571679,-0.05757321037652431,-0.8420255338298391,-0.25180145348627947,0.12298347183451586,-0.5913179334197878,0.052725987479653784,null,null,null,null,0.2728266974819713,-0.2853873078414366,-0.9733916752192282,-0.8384244484746919,0.1150884955819432,0.7835942928308773],"ID":"34","lit":1.1896053946655962},{"inputs":[0.9476751797193174,0.4207176492626508,0.3083389333015748,0.24496003206368216,-0.37920734233046005,-0.6588818095243572,0.7393273105778639,0.2016865010040635,-0.3269038002797205,0.3782946061066184,0.4150050587655187,0.0926045979590714,-0.21682194368630733,0.26787903916620703,null,null,null,null,0.9373132788732859,0.8671433976838027,-0.982868009917507,-0.18643243474002538,0.9656464429388126,-0.09783554147827862],"ID":"35","lit":6.99786994207137}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.09702247715931205,0.6714862187025865,0.10767928530798353,0.08598131596118766,0.5246140074338294,0.9791186740154411,0.4234172730064795,0.9471878141482231,0.9822534006020729,0.32145463735649377,0.5373106177365261,-0.18288800875213204],"ID":"36","lit":11.959758139419602},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.49960772456509783,-0.409544358324129,-0.2923792736703367,0.021058170896708195,-0.4313464943201377,-0.3112969479407572,-0.02429798458774578,-0.862747415565201,-0.026041220506109995,0.5761881623580632,-0.13270833581087452,-0.8267001522684845],"ID":"37","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.5381804293044735,-0.10700170964065564,-0.780107378198296,0.25270620850731657,0.23286577250264404,-0.7473399563366186,-0.553529384274952,0.19559716756720286,-0.2746898756307422,-0.544883767459087,0.3012797517576752,-0.4819308006456747],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.005925046483763861,0.6244163935414263,-0.34061985047075727,0.5400050401478198,-0.5141775363629252,0.1052008653497308,-0.9143902884597824,-0.1527520769307895,-0.41515234570207493,0.3411462278310262,-0.8652455765413535,-0.03684905767162771],"ID":"39","lit":0}]}]}]';
var brain1 = JSON.parse(B1)[0];
Object.setPrototypeOf(brain1, network.prototype);

//var B2 = B1;
var brain2 = JSON.parse(B1)[1];
Object.setPrototypeOf(brain2, network.prototype);