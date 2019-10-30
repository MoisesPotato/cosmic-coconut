
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

var B1 = '[{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.0409762104991497},{"inputs":[],"ID":"1","lit":-0.07682446647907341},{"inputs":[],"ID":"2","lit":1.5715840350591725},{"inputs":[],"ID":"3","lit":-0.29610333036320385},{"inputs":[],"ID":"4","lit":-0.5115456325379967},{"inputs":[],"ID":"5","lit":-1.170682535585646},{"inputs":[],"ID":"6","lit":0.1},{"inputs":[],"ID":"7","lit":-2.668152422422372},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":0.4082875829253265},{"inputs":[],"ID":"10","lit":1.6550431762312128},{"inputs":[],"ID":"11","lit":-0.7134505226414203},{"inputs":[],"ID":"12","lit":-0.0022554551004271063},{"inputs":[],"ID":"13","lit":-0.03203702466288115}]},{"neuronList":[{"inputs":[],"ID":"14","lit":1.7036033369516619},{"inputs":[],"ID":"15","lit":-0.8471834831567853},{"inputs":[],"ID":"16","lit":-0.048569238007467756},{"inputs":[],"ID":"17","lit":-0.15184922655810154}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8577168873517503,0.42034127388065173,-0.16320366134066094,-0.4003696091607661,-0.11647602468237211,0.14680350852526067,0.7388566219376227,-0.14379118596976262,-0.055283994117207476,0.09430735011103164],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.9451259629867036,-0.6345661510542348,-0.7024790619054869,0.174486604754405,0.5779304531762457,0.7044297114730168,-0.8626216394806188,0.4727497031897552,0.7498600934666717,0.27830888037880125],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.2786520636782268,-0.3334095438137742,-0.8725084146017847,0.6920302659156259,-0.03579177437846631,0.40412536622383105,-0.07656160662668818,-0.28317026215513164,-0.5137239220075127,-0.2354578373991352],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.28348303769186695,-0.23817422018532414,0.7463723380364761,0.7127597547898834,0.6035262223859293,-0.4424647664412522,0.8151662387289311,-0.9007609581033507,0.7376171937182231,-0.2524106289300753],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.06816676124123117,-0.34312140972410976,0.830860683615476,-0.6559088099414389,0.15788309614182658,-0.6162460503273824,0.17953062081808077,0.42304299972262155,-0.6509879056884248,0.8323570498697812],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8840652239672084,-0.02027324108072229,-0.4304051351489156,-0.7510013813380985,-0.6935391024015425,-0.9608813518823277,0.4955791271712963,0.8962112293509201,-0.8115799277203308,-0.7987446349635466],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[0.4980873574338,0.4797505344541601,-0.8034468891280183,0.7698761289592319,0.5972520996522711,-0.9151766129395997,0.567835764104036,0.0901968392351194,-0.9817861631276671,-0.46904717754301195,0.30947412754300874,0.410748595035513,0.35844434155797716,-0.36578897481737316,null,null,null,null,-0.899205940231154,0.48014840950024673,0.12700578290691955,0.18064467414354687,0.7186911288260184,-0.7963395065383089],"ID":"24","lit":0},{"inputs":[0.21755346164908976,0.8240838414626146,0.10521526511748716,-0.854371935443708,-0.5962558606875117,0.04807889155524036,0.3023652347261084,0.6949382317490435,-0.6427260139279071,-0.07528052632840686,-0.11146607134901079,-0.11653815335921566,0.560837735910091,-0.18367147550058863,null,null,null,null,-0.0006020066714665846,0.3538218176643481,0.7005283735104845,0.47509203640487874,0.4060316467874867,0.5149294808462989],"ID":"25","lit":0},{"inputs":[0.7048686614790021,-0.15819601843752992,-0.5078675142364832,0.40631034899392865,-0.5591348354315668,-0.7025848245497341,-0.1325709236419055,-0.7876195740477608,0.5270956317776387,0.7009688398113469,0.6414996134599771,-0.8348576827472504,-0.6996563628794573,0.06619711260668026,null,null,null,null,0.7558069244191655,-0.02448770986609282,-0.1635525941865954,0.8942997664917968,0.9330712115121093,-0.5562973673723751],"ID":"26","lit":4.789417593548902},{"inputs":[0.8793949720873303,-0.16167003277663583,0.3266408339304296,-1.0009600295599785,-0.7429258890847842,0.387979496241902,-0.9715585551735407,0.014646838624809982,-0.2729302254412203,-0.35568685628055013,0.4102108489820929,0.01317675201026666,0.047828470552163084,0.9220516105003849,null,null,null,null,0.31260646168303435,0.6180243847785236,-0.9576857237502601,0.25799483683675656,-0.0671727755103266,-0.7541433168304585],"ID":"27","lit":0.8695047139797172},{"inputs":[-0.03546875706699516,-0.7700620673890044,0.6403016752484355,0.2701683777910809,-0.20556196571793292,0.008394273155440977,-0.15573797550139287,-0.6620119989238784,-0.08993747324446164,0.32705285115759636,0.6125321621015433,-0.8835947765587061,-0.8582863249052531,0.8399126127251478,null,null,null,null,-0.5901763511777502,-0.8147615854953807,0.2722236739310373,-0.7620990054816928,-0.5277547508115619,-0.779225498256083],"ID":"28","lit":4.492888784366192},{"inputs":[0.03436567541798332,-0.4536229253176378,-0.21410441686917692,-0.8041225799768371,-0.15263715004531697,0.43061767150306157,0.6710181849789468,-0.42245408096542925,-0.6460426092004794,0.22731965206535862,0.5944156625169178,-0.41382884624785016,0.19560428309562386,0.9171131092126537,null,null,null,null,-0.08468829817046392,-0.7877705703727977,-0.07949459436756877,0.46696831272791306,0.5335089845325247,0.25055640930927053],"ID":"29","lit":1.4020922056972236},{"inputs":[-0.27193725323048973,-0.7914315583244034,0.35341213404552646,0.8686988241901412,0.3780461917569202,-0.09604881551053725,-0.48119509937316646,0.41963664260419176,0.7815109137185485,0.8608552834533656,0.46567771043733597,-0.6223075008285073,-0.41059663090393717,0.2141322089321667,null,null,null,null,0.2718385976329406,0.668036992101314,-0.021904200711976452,0.0679377670361255,-0.3753044322203743,-0.25096822085546855],"ID":"30","lit":1.4408870487279952},{"inputs":[-1.0225801427664836,0.48350253929089454,-1.0009516466863395,0.4598913433885457,-0.37755010491600055,-0.5434932570644779,-0.8610718508467888,-0.5503193258118609,0.32794616464208004,0.92107226141245,0.5052206696583412,-0.2787165555551849,0.7489771806285905,0.7197628521952959,null,null,null,null,0.14219376027650465,0.09844100313354372,0.9185313576879143,0.32517386520966596,-0.08507026147039223,-0.5341232111685237],"ID":"31","lit":2.1375922400315637},{"inputs":[-0.9469945837017402,-0.2774873539215187,0.15283765699971522,0.14278190077341568,0.654906855030353,0.9187467419997759,0.6479405579930076,-0.9138033564337498,0.2661031602484271,0.5547644419266065,-0.3284592504291938,0.40997587075655595,0.3627729986372199,-0.3465427176245941,null,null,null,null,-0.7324541857783652,0.9000838799859585,-0.8190085908033519,0.4856843941290384,0.21026189071239532,-0.3346200106351515],"ID":"32","lit":0.9395966142310558},{"inputs":[-0.21154240008603842,-0.24879654729906403,-0.4805908325396341,0.46937723909831813,0.8867286058017435,0.45641365465886485,-0.9347565283004703,0.004679670808458658,-0.43070120396641715,-0.24368226281713953,0.253647287844356,0.1109621433127837,0.31502474346497644,-0.6047617083732845,null,null,null,null,0.35926426755106344,0.47228473406548355,0.026461250247073458,0.1061326467608674,0.8826324200628065,0.015617938956159785],"ID":"33","lit":0},{"inputs":[0.2198390061425027,-0.34656615767644855,0.34815270493308503,-0.7329169403217669,-0.7421166755357198,1.0070286959669759,-0.9044897557446472,0.2734006455068168,0.7861226277377247,-0.5124801456368716,0.7151996552976132,0.2534251532872995,-0.5326450895025038,-0.40170938244079435,null,null,null,null,-0.04469688686193384,0.5905431675800212,0.17630972578109538,-0.6525913800087467,0.5592036870009377,-0.35198414992262567],"ID":"34","lit":0.7744296554604273},{"inputs":[0.8169365089397631,0.23649758689237443,0.6535985342829069,-0.6780335050205732,-0.6972185751686188,-0.3401484653229567,0.4745562390409077,-0.807300486512221,0.06190144452503569,-0.6773424151757748,0.8761799728243139,0.5085074751875253,-0.8344234063901815,0.8745997414532359,null,null,null,null,-0.2752847411759459,-0.9080994109804899,-0.3588031921616117,-0.20078900108431172,-0.36142111859343024,-0.23773478096343229],"ID":"35","lit":5.046114658990438}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.10355543336867815,0.33926314099128846,-0.8983695502580535,-0.21452272859908875,-0.9668848809560394,0.9167350488924377,-0.8074954329864084,-0.6704367013818053,-0.12035549074082394,-0.7571646870092329,0.6195569414541261,-0.9239081188663734],"ID":"36","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6774219474993922,-0.1015707877019681,-0.5050608568832456,-0.6469864211886996,0.29789203420238713,0.7253644251928641,0.20644009129175703,0.48407078503084827,0.2732502464999401,0.5545876145806002,0.015241378018142064,0.46822424374439514],"ID":"37","lit":3.3373828986171827},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.09372603302503683,0.1740403917414452,-0.8719067566835403,-0.9568811509741921,0.41642332387884634,0.6359024260978441,-0.895959966424571,-0.4908079370231653,-0.7587594936271647,0.9532668204415661,0.07800847002146885,0.9711460285171833],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.32712285249973844,0.7928672828607841,-0.03131765983230976,0.3187019611503197,-0.1638722603550579,0.4356455364997029,0.18629733540764062,-0.7792315024245478,-0.7394363639741315,-0.6779145970217082,0.6340121383944002,0.39642235944389087],"ID":"39","lit":0.4010476591772185}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.033168097001048835},{"inputs":[],"ID":"1","lit":-0.07242421240605608},{"inputs":[],"ID":"2","lit":1.5716529841068345},{"inputs":[],"ID":"3","lit":-0.29637856956349395},{"inputs":[],"ID":"4","lit":-0.4255240938235056},{"inputs":[],"ID":"5","lit":-1.349345253523627},{"inputs":[],"ID":"6","lit":-0.025},{"inputs":[],"ID":"7","lit":4.693364391930425},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":2.146978639511682},{"inputs":[],"ID":"10","lit":-0.05472892725866792},{"inputs":[],"ID":"11","lit":0.05472892725866792},{"inputs":[],"ID":"12","lit":0.000018396310778481252},{"inputs":[],"ID":"13","lit":0.0019338926530343544}]},{"neuronList":[{"inputs":[],"ID":"14","lit":2.1803644375887323},{"inputs":[],"ID":"15","lit":-0.20939730331222903},{"inputs":[],"ID":"16","lit":0.07794139850567446},{"inputs":[],"ID":"17","lit":0.2362037572218046}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8490416548851315,0.4316426148287055,-0.16139980298931508,-0.39186818966076725,-0.11870251107486707,0.13674969694382547,0.7398340574647233,-0.13939793744043877,-0.047953250919646216,0.09063420293199458],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.9525791902314402,-0.646333441418881,-0.7059431093531489,0.17301264924685006,0.5899138840016077,0.7155193451892826,-0.8502949114334426,0.4616871265339386,0.7558122732330035,0.28362691382381516],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.287624756874028,-0.3232965272024728,-0.8671448650076509,0.6935582915842695,-0.04187742604716678,0.42179594048384705,-0.08204872930417204,-0.27748529065180344,-0.5033443751227041,-0.2184814543020205],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.28693806089288015,-0.2525257408235465,0.7391479361308916,0.710605196389176,0.6215080913128739,-0.4516700931721243,0.8104828384550339,-0.8954673060045009,0.7506670924584662,-0.2545227926323087],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.06919725283594279,-0.34942682106836703,0.8379096542421485,-0.6674121015055507,0.16987445612161395,-0.6102090637130538,0.18943926329437272,0.42469589613274267,-0.6493650958943605,0.8364715246928139],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8819052609110158,-0.020572566092644847,-0.43974047228107593,-0.7445885932107754,-0.6875616710317918,-0.9466098206249969,0.5122409750764263,0.8864986515066382,-0.7950523416065652,-0.7940718039135006],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[0.4962634217353586,0.48273145883782925,-0.7858064690345216,0.7549730885167132,0.5824475223434552,-0.9094220376220079,0.5533478492222182,0.09794100584319243,-0.9783075135724912,-0.46532137782337674,0.3057053729010683,0.40826013068863026,0.3609765651115173,-0.3652955998279748,null,null,null,null,-0.9070602642336939,0.4882054034823044,0.12298503861904121,0.18151302772599864,0.7313762990506086,-0.8061034023620495],"ID":"24","lit":0},{"inputs":[0.21684973298767563,0.8110911226062694,0.10342094379013582,-0.8611857223847746,-0.5818338605522148,0.06088230752508611,0.3160505371193716,0.6854286809359138,-0.6566963828588627,-0.08056697209744125,-0.11482449986874645,-0.10987203764070286,0.5537902517779022,-0.19060192382699345,null,null,null,null,0.0003235833413539474,0.36091455960603547,0.6871317635033788,0.47110807543621874,0.40943058264218535,0.5024572060551346],"ID":"25","lit":2.9109677351394083},{"inputs":[0.7057383186952355,-0.1556860544314068,-0.5077513308189825,0.4005550122119933,-0.5683895574577411,-0.7036306005240152,-0.14920290675244435,-0.7752519473404295,0.5221442345329449,0.7150606904687048,0.6465709112945057,-0.8339419582298303,-0.6974109337016139,0.06040676460158992,null,null,null,null,0.7581916110626843,-0.022657572114179347,-0.1649545334385457,0.9109512147476352,0.9319857126253304,-0.5532359507134647],"ID":"26","lit":0},{"inputs":[0.8698767712782483,-0.17322934311838112,0.33253338752145883,-0.9857936838162216,-0.7344324918976881,0.3859438679585782,-0.9700914865048946,0.02724814175181094,-0.2592171963890755,-0.36908089475499534,0.4065808888267679,0.022000671835152655,0.05054957121610148,0.9322601222907987,null,null,null,null,0.31650984801464477,0.6180743521155592,-0.9578142651625652,0.2512279660204431,-0.06720884872796606,-0.7520603619988604],"ID":"27","lit":0},{"inputs":[-0.0451123920794264,-0.7833883720996032,0.6495244727150895,0.266191511763897,-0.20748977684298409,0.0091080971802312,-0.15022059234818508,-0.6761981049213828,-0.1095394159161621,0.3241432212568549,0.6182590754246909,-0.8785498873962446,-0.8577008786379298,0.8350566055416375,null,null,null,null,-0.5996013741718572,-0.8308587412695964,0.2759568250452568,-0.7631121451792728,-0.5139963546748428,-0.7858801752667163],"ID":"28","lit":0},{"inputs":[0.02206746986078577,-0.454331976141295,-0.2154763183750968,-0.7985497669615276,-0.16087373543032893,0.44669969874814364,0.6699608445524008,-0.4329793747105783,-0.6453936335463709,0.21674443909002578,0.6023672389533571,-0.4026018873443028,0.18181186751384806,0.9100227232336218,null,null,null,null,-0.08230451310433176,-0.7843573873471869,-0.07433249850616977,0.4702914057194165,0.5465125956266927,0.2553682563210399],"ID":"29","lit":0},{"inputs":[-0.2815007357240424,-0.7921682201866146,0.3596622712238299,0.875557719310025,0.3719155932649027,-0.11063337967207988,-0.49021871953102947,0.430279801700754,0.7706277611974934,0.8631961589309448,0.46833015769847813,-0.6088675825235838,-0.4142274242775267,0.20089418942060822,null,null,null,null,0.2739083212810597,0.6720826651085854,-0.013961019152668333,0.0847974174460957,-0.3702232271758439,-0.23375780630965706],"ID":"30","lit":4.9418604878518275},{"inputs":[-1.0218177320993993,0.4848081575277846,-0.9910861941335181,0.47392076283514867,-0.37961962521857284,-0.5429985920660049,-0.8568457262479815,-0.5563201052669441,0.31894395409270604,0.9094523310119952,0.5005401315231626,-0.2648333029553451,0.7558027984093187,0.7210922306675475,null,null,null,null,0.15708237918727116,0.1068834926629276,0.9155947548817502,0.31649654368566443,-0.08583541486166865,-0.5479174943884616],"ID":"31","lit":0},{"inputs":[-0.9512717121106018,-0.27072778807714687,0.14291265953589846,0.14177881732258435,0.6568964896133312,0.914648665065986,0.640027908929459,-0.8975392006352678,0.2521337182332404,0.5418668305360637,-0.330624267989714,0.41056620797253807,0.37111403030653384,-0.3463936555038153,null,null,null,null,-0.730946159087875,0.9086437115261795,-0.8169896187663359,0.49568565897123495,0.21773126134691884,-0.33057353890693375],"ID":"32","lit":0},{"inputs":[-0.20335073414278107,-0.23903196562059706,-0.48816200067697146,0.4792335447617214,0.880201725076458,0.4463952393640108,-0.9414091051526082,0.015315320648503739,-0.429198939941413,-0.2428879074328402,0.2517670500965439,0.11360883945807479,0.30872141628202376,-0.5924914874135657,null,null,null,null,0.3540895061959633,0.46668651092387553,0.01883638886274768,0.10925501343346958,0.8809612297526904,0.01382238864064046],"ID":"33","lit":0},{"inputs":[0.21750924387548795,-0.3497421194542357,0.34876576366738654,-0.7373274387049153,-0.7538497727094823,0.999106652494133,-0.9099106021746807,0.2717919918536392,0.7896685883208991,-0.5147681968283143,0.7277357305882728,0.26365046788851976,-0.5338865254605031,-0.41303139158953595,null,null,null,null,-0.036407156544038234,0.6078217242943816,0.18473852003720279,-0.6608035521781167,0.5722324583273218,-0.3511567080603423],"ID":"34","lit":0.728483810718449},{"inputs":[0.8195648810721109,0.24292014690093638,0.6383160065624375,-0.6768312633430447,-0.7010631501193101,-0.3346507264816505,0.4717407527495176,-0.7962946783714265,0.06148976257666112,-0.680972910657613,0.8850722448790334,0.5102933126682062,-0.8318510761613743,0.8659371352065542,null,null,null,null,-0.26878351337700634,-0.9085527329085529,-0.3679650128920383,-0.20120038088026873,-0.3616527906116565,-0.2518374499672345],"ID":"35","lit":0}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.09399250448499073,0.3338319866251775,-0.9159069427432783,-0.21781321216817115,-0.9595336865411646,0.9203793990313276,-0.8092249942470345,-0.6886180402739658,-0.13115881373015945,-0.760081403224981,0.616679908557498,-0.9185864822581923],"ID":"36","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6681161524160252,-0.09727885199895153,-0.5051445277817573,-0.6333307093844369,0.2949715212409404,0.7215745646603229,0.20752328794160302,0.47155212430831095,0.2860414001432532,0.557089484915612,0.016603867119860567,0.4650024929847152],"ID":"37","lit":0.7544711858994947},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.10434792463982574,0.17813486236446466,-0.8645445515312313,-0.9685457764433946,0.4232558234032583,0.6418019455292372,-0.889988873085603,-0.489623128891099,-0.7740591167834568,0.940054522519309,0.08658406905806701,0.9660433572229945],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.330244889855882,0.8043743806214043,-0.040720242895236236,0.31479285114978095,-0.1524245770307209,0.45311768440766076,0.19003215020372438,-0.7832968989158043,-0.7432917325823267,-0.6812150773333431,0.6306475085935608,0.39271286455539667],"ID":"39","lit":3.7400367437552955}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.02281202731372254},{"inputs":[],"ID":"1","lit":-0.05057878573736645},{"inputs":[],"ID":"2","lit":1.5727739051569505},{"inputs":[],"ID":"3","lit":-0.2661798335110535},{"inputs":[],"ID":"4","lit":-0.9041279613037705},{"inputs":[],"ID":"5","lit":-0.6564238597952374},{"inputs":[],"ID":"6","lit":0.425},{"inputs":[],"ID":"7","lit":-1.118455588627203},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":2.4899147331388383},{"inputs":[],"ID":"10","lit":0.45234073816769343},{"inputs":[],"ID":"11","lit":-0.45234073816769343},{"inputs":[],"ID":"12","lit":0.010172064670295527},{"inputs":[],"ID":"13","lit":-0.044205730127574935}]},{"neuronList":[{"inputs":[],"ID":"14","lit":2.0689983668139327},{"inputs":[],"ID":"15","lit":0.4743040812833376},{"inputs":[],"ID":"16","lit":0.09729119968248176},{"inputs":[],"ID":"17","lit":0.1343057664684707}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8383959758612776,0.4283142047271619,-0.1624273103048845,-0.3984083429415617,-0.10975579157458909,0.1372686868799454,0.7456166921133447,-0.14187550796456957,-0.051116134976674554,0.08500418366838326],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.9395511219001458,-0.653877405596471,-0.7115878463317389,0.18107799208841796,0.5845338014089247,0.7092177411445771,-0.8447666278340521,0.4654446674220527,0.7591048244992938,0.292658102591329],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.29389957693884267,-0.3333063882813713,-0.8679198824688044,0.6983640249170614,-0.04286783738824819,0.4170278979114729,-0.08189995783786541,-0.2825322638500664,-0.5044072793833656,-0.22618740866767534],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.2906420929419382,-0.24064673024104108,0.7378614635019536,0.7136763217302512,0.6178495440400544,-0.46661211958200083,0.8034028662562995,-0.9014267436060098,0.7421772740964159,-0.2548611858865833],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.07348077889160667,-0.35586743096186535,0.8520386557667994,-0.6765351840630295,0.1671887468140914,-0.6033202707965948,0.18869212425692836,0.4327092399382655,-0.6454773832175531,0.8246641959970918],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.879262503410429,-0.021460575956236384,-0.44607725455199687,-0.7416453140276734,-0.6917859030108652,-0.9570392768722417,0.5093885498447409,0.8822984388440384,-0.795061190078593,-0.7923227785105909],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[0.4911131040082545,0.48112647629524913,-0.7871312829397286,0.7717234812947005,0.5838152543722392,-0.9082474462813592,0.5701485691055251,0.09526099650464341,-0.9921221085560791,-0.46610785646949304,0.2999191294707197,0.4058467753479984,0.3549065273672869,-0.36782473047140707,null,null,null,null,-0.9187949185915483,0.4965296522003389,0.11102978371995041,0.16527958100770163,0.7129570682089398,-0.8006942522912779],"ID":"24","lit":0},{"inputs":[0.22688110726366803,0.8030961613140648,0.10665816167642438,-0.8687361438354397,-0.5817278885051834,0.0562355855856458,0.3191415012414455,0.6835132373766224,-0.6450472191215181,-0.07960716297225393,-0.10539112919833285,-0.1164020626761404,0.5566304060244742,-0.18109839150934998,null,null,null,null,0.007306999420395565,0.36599529998525837,0.6994736702162679,0.46806273267571896,0.3979242149449052,0.5031876273625736],"ID":"25","lit":0},{"inputs":[0.7100565499446668,-0.14606806589849214,-0.519943596826823,0.39670140971669837,-0.5719928151182949,-0.7019790496836885,-0.13916500901853984,-0.779113677260157,0.5203905491001588,0.701809003955492,0.6300210808833345,-0.8185900347820315,-0.7012637968235299,0.05256402484414598,null,null,null,null,0.7621430763621201,-0.026940148574915206,-0.17705861727669042,0.8946198456651264,0.9333330979819706,-0.562963167188978],"ID":"26","lit":3.8040915686493384},{"inputs":[0.87457873768201,-0.1745638253073207,0.3363103340367276,-0.9863463713670119,-0.7425864988825869,0.39472250147962223,-0.9704080519313348,0.01400134097911995,-0.25994020791474953,-0.3742352277139917,0.41158373289949773,0.027277968497706764,0.04272940756932025,0.939861722732563,null,null,null,null,0.31760131140359565,0.6217739913630643,-0.9520734113765462,0.2604495698606249,-0.06934312119249135,-0.741844406062953],"ID":"27","lit":0},{"inputs":[-0.044172490301383496,-0.771411564089124,0.6557117406182097,0.2743078491484095,-0.2066536663510368,0.004603948354624925,-0.13640721428004107,-0.666999522104429,-0.10064518681770612,0.3165689705844474,0.6087260514348743,-0.8891133671396917,-0.8666802067459988,0.8420732076239676,null,null,null,null,-0.5985149775648668,-0.815615401817593,0.2816182873208488,-0.760308965854236,-0.5188841906783185,-0.794848000727633],"ID":"28","lit":3.187213944311832},{"inputs":[0.018218092602916142,-0.4454822708701256,-0.23235754507708303,-0.7960185081782509,-0.1610748817435886,0.45079040647640206,0.6747915722489685,-0.42194510242062727,-0.6451846254739863,0.21526184035977827,0.5955985957270978,-0.4178558513934228,0.16747009893293943,0.9122655478667239,null,null,null,null,-0.07596806002573438,-0.7801460086966228,-0.08759925090978919,0.4718769403564634,0.5495931210492512,0.26002276637417243],"ID":"29","lit":0.788423623434688},{"inputs":[-0.2852027773767056,-0.7971520993960898,0.3474221066250884,0.8690129226789862,0.3722905069418272,-0.11423439305939347,-0.4851881406151927,0.42068186999702045,0.7690798476522462,0.8494544078545063,0.4578080921240047,-0.6138817071650742,-0.4029338189323992,0.20818240971356375,null,null,null,null,0.28494669439188136,0.6568634544311378,-0.013348141206425494,0.08672577444450341,-0.3778290549958743,-0.24695595273108983],"ID":"30","lit":2.7662009393614957},{"inputs":[-1.0253049677457273,0.4788307805438414,-0.9921668839224037,0.48571065981723593,-0.37240159149428603,-0.5376802464392043,-0.8629494281571821,-0.5675826279237929,0.3235707113707906,0.9072872070377095,0.499290831581694,-0.2631397724304944,0.7633270116910073,0.7325945830032682,null,null,null,null,0.1529622649374519,0.09141198336821296,0.9052933880002381,0.3217353284363247,-0.08553732752926448,-0.5340796351682258],"ID":"31","lit":2.1232554089893556},{"inputs":[-0.9457764073290379,-0.2519503244271027,0.13815977074139968,0.1570801648567063,0.6527646275112261,0.9139344403018617,0.6328995079057171,-0.9089629783447649,0.2596759552861325,0.5458277094358617,-0.3214962272518171,0.4036598551997065,0.36770268705554454,-0.34688154506826185,null,null,null,null,-0.7403611979524551,0.916977999831839,-0.8126246429623563,0.4951380610010673,0.20834065810365754,-0.34692192112464065],"ID":"32","lit":1.5719538839559473},{"inputs":[-0.2020953787485097,-0.23427354387163385,-0.48609752078240276,0.47587898669790457,0.8776926857108784,0.4490262433484944,-0.9467218554113482,0.022327743827618093,-0.4315195219456593,-0.23921052376332616,0.24341700012294107,0.10786981561425113,0.313665759929556,-0.5911074481350951,null,null,null,null,0.3381890574317369,0.4597771626497011,0.01895096858001829,0.11286292714876554,0.8958185138208903,0.0202962860808979],"ID":"33","lit":0},{"inputs":[0.21837783101879066,-0.35294211946300674,0.35642987360525463,-0.750833244880556,-0.7422008192554008,1.0013312764056854,-0.9069684947103953,0.27937044048959825,0.78258271370203,-0.5265080087474021,0.7260492202252823,0.27814835321792886,-0.533028318369133,-0.4060717521663905,null,null,null,null,-0.039213970940284185,0.6007133621657776,0.19060673056093302,-0.6508534401367609,0.5841957029325036,-0.3438385816582582],"ID":"34","lit":0},{"inputs":[0.8123435069148416,0.2374831765057836,0.6491306614343906,-0.6848324416554051,-0.6951796033804488,-0.3422423669604364,0.47200311178489635,-0.7969707729873814,0.05392251743981816,-0.6861035263033592,0.8800835984639134,0.508587201624376,-0.8276615481238507,0.8697285529723913,null,null,null,null,-0.25992032752685007,-0.9086873511192175,-0.36977767567851844,-0.20731413086278921,-0.3519040651185976,-0.2396669177753629],"ID":"35","lit":1.621669233512084}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.10094236081542533,0.350815123014739,-0.8988371688621241,-0.20817164564302798,-0.9509027965034437,0.9147951273674249,-0.8015192134603601,-0.6877985109473749,-0.11632895976542847,-0.7456014385529743,0.6073283712928944,-0.9268631897222276],"ID":"36","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6689480721248882,-0.11184920254663602,-0.49545406840953066,-0.6467667443967297,0.27654428254262853,0.7292374697266336,0.20815881268245082,0.4797941384983501,0.2955416872131544,0.5550459162510343,0.0017098847492514457,0.4734008452980339],"ID":"37","lit":2.3984132894467107},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.1052791108293746,0.18092635991734016,-0.865217942723525,-0.9651894917774831,0.422289546013179,0.6334331376870203,-0.8950071211655752,-0.4904128839420679,-0.758609465151307,0.9428222637228773,0.08680739460851454,0.9650204105604185],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.31451693902393674,0.8151217728363641,-0.034514766666118295,0.3155702766204671,-0.1657251992229662,0.45120549334487353,0.17948167598047712,-0.7733482930720574,-0.7351409470735223,-0.6918947466828003,0.6267477546318854,0.4077773098761849],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.03247020446242317},{"inputs":[],"ID":"1","lit":-0.06006764359581183},{"inputs":[],"ID":"2","lit":1.5706348387136604},{"inputs":[],"ID":"3","lit":-0.27664582716174324},{"inputs":[],"ID":"4","lit":-0.8855555610174326},{"inputs":[],"ID":"5","lit":-0.6854798603825566},{"inputs":[],"ID":"6","lit":0.425},{"inputs":[],"ID":"7","lit":-1.1266300085208814},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":2.4968708782563658},{"inputs":[],"ID":"10","lit":0.44416631827401576},{"inputs":[],"ID":"11","lit":-0.44416631827401576},{"inputs":[],"ID":"12","lit":0.009860608813420609},{"inputs":[],"ID":"13","lit":-0.04366815492944932}]},{"neuronList":[{"inputs":[],"ID":"14","lit":2.0762276896812275},{"inputs":[],"ID":"15","lit":0.4662413436483534},{"inputs":[],"ID":"16","lit":0.09550852835914164},{"inputs":[],"ID":"17","lit":0.1355457606496309}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8446015140968788,0.4307255698062837,-0.16514540374050748,-0.3984891971235753,-0.12112639836387143,0.1428553130484701,0.7349936738704423,-0.13418718807343083,-0.05001031200445328,0.08872097240622531],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.9482553486453474,-0.6349946728273583,-0.7039702291323647,0.18197228176619115,0.5754227865467341,0.7110897582853453,-0.8440598343236569,0.4419213295418409,0.7467628659186558,0.283411704578828],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.2802679574444884,-0.33627426343448075,-0.8781118911437024,0.691373118035526,-0.03882177571542156,0.41610218071032956,-0.09648121784765704,-0.28062963066649105,-0.5196834043993754,-0.24196867362381033],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.2847011349051657,-0.24293353652221972,0.7275787778734618,0.7061875948345193,0.6041463287438102,-0.45672694642548234,0.80725525501999,-0.8998446728567235,0.7432452250374971,-0.2563096528136595],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.06285209112214811,-0.34473710030214455,0.8340106919953073,-0.6670951875150302,0.18419280835548607,-0.6040223850195401,0.19637499415519918,0.4226156093792692,-0.6501676401376867,0.838532898668912],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8826575334950852,-0.0240113553798659,-0.43156167530136347,-0.7463146836374362,-0.6754687427120047,-0.9561917347936142,0.48922118871351145,0.884347156795199,-0.8036235016057883,-0.7999431494459873],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[0.4953981532022881,0.4833427599267838,-0.8124274822826091,0.7614639138041849,0.5901689198821536,-0.918184735784901,0.5688981419147674,0.10467713205378538,-0.9722947622275394,-0.4669634422770314,0.3156475972038494,0.4177675134222155,0.3542873253334152,-0.36665912281039176,null,null,null,null,-0.9091146910642002,0.48889511928108087,0.11540393887019373,0.17214545937639528,0.7100588458937654,-0.8070752778872203],"ID":"24","lit":0},{"inputs":[0.2140951032129986,0.8215935855599721,0.11387469575583059,-0.8503284645234543,-0.5900484706876593,0.0524464906204608,0.31528895905202536,0.6866652761294444,-0.6554109199602962,-0.09247242126265633,-0.10310628409279046,-0.1173656171376673,0.5602460660629388,-0.19549468527623368,null,null,null,null,0.0018975674135270097,0.3561934682886534,0.7094211362592254,0.46724737506361796,0.41000198688187844,0.5130456852736711],"ID":"25","lit":0},{"inputs":[0.7038327199457122,-0.1476113380941865,-0.5125580661273165,0.40068602418398624,-0.5636267824221853,-0.6956677717539068,-0.15245051471795495,-0.7812523096551119,0.5251699426673512,0.7058697849390172,0.6487367962231391,-0.8251437497765138,-0.7049528355069387,0.0679013178718803,null,null,null,null,0.7680668897895871,-0.03390149823515952,-0.17284031088103524,0.9015780125343713,0.9275533387756412,-0.5661784979125958],"ID":"26","lit":3.839577850354378},{"inputs":[0.888925997522904,-0.15468646691579674,0.3251033572071328,-1.009548160416355,-0.737730152821932,0.38268613373101695,-0.9735925425272085,0.01157622135082452,-0.2677041847717955,-0.355424768536843,0.42293675384971113,0.009915792167700818,0.05715690703139155,0.9267555632480148,null,null,null,null,0.3112691632294669,0.6272401890449625,-0.9592845988441291,0.2657170606058621,-0.06783783027564705,-0.7504398811611135],"ID":"27","lit":0},{"inputs":[-0.026817278609548155,-0.7797599234281607,0.6326314113393184,0.266548429083494,-0.2159286435623993,0.014265397449648116,-0.1447021109310284,-0.6777472936626204,-0.0958247845076212,0.323701686734759,0.6094245878178152,-0.8788486585764573,-0.8585014724849735,0.8480333630460728,null,null,null,null,-0.5868867422727793,-0.8217696473475924,0.2705003448417425,-0.7582631996408276,-0.5157241564722971,-0.7942525370722792],"ID":"28","lit":3.1773311925596115},{"inputs":[0.030699526610518488,-0.4460001732395655,-0.22654304430262848,-0.7954166367903429,-0.15154209109975197,0.42841235304126424,0.6659655761059647,-0.42636701363205787,-0.637156008594776,0.22378419678865075,0.5945514161708658,-0.41677621420707495,0.16478440989802026,0.9114656864365989,null,null,null,null,-0.08788738701148963,-0.7837039188113375,-0.07402510459899836,0.4597146472943695,0.5592849056388691,0.2594012970468261],"ID":"29","lit":0.8285681938588509},{"inputs":[-0.2874574454249269,-0.8036896882112822,0.35721911113698857,0.866876845249067,0.38349003071341925,-0.09717411529915013,-0.4856699102903751,0.4271188804575107,0.7809346800977447,0.8631640880078231,0.4741689143090421,-0.6108483896860746,-0.4085869284062293,0.21864591875195763,null,null,null,null,0.2808495652574428,0.6672083233843359,-0.019526879365789628,0.071747528945747,-0.37319373458078686,-0.24600724113518502],"ID":"30","lit":2.8040746887813226},{"inputs":[-1.016462833828013,0.4870685623157393,-0.9931260770932497,0.4767549479057666,-0.3712913105256355,-0.5320264439911465,-0.8656533652757105,-0.5530654807384244,0.3256807965100262,0.9276639696094808,0.4892945215143008,-0.26642394682354864,0.7490571225968273,0.7290891879207122,null,null,null,null,0.1598050378678491,0.10730409421309246,0.9088718375421756,0.334423791226339,-0.07514764433723498,-0.5406208201453365],"ID":"31","lit":2.1478483011080423},{"inputs":[-0.9433769980519265,-0.2874368745575496,0.14658020269871702,0.14479717037782033,0.6543653153074184,0.9024139554482209,0.6502587088213974,-0.9049196270983411,0.2632535669876479,0.5469513182045841,-0.32087258033086413,0.42541496836017173,0.3666727080902686,-0.34544387747333477,null,null,null,null,-0.7287662959106641,0.9118590221777161,-0.8173590041448797,0.4961209188618427,0.21435803828250416,-0.33184000381210726],"ID":"32","lit":1.5907516793808085},{"inputs":[-0.21311749933515167,-0.2356914834829231,-0.48248053432061533,0.4786658956047138,0.8783378447302135,0.4599095908048022,-0.941133088444791,0.004618762679659456,-0.4269760238727396,-0.24348192015996606,0.24981757282405745,0.11617903486419393,0.31433354922104895,-0.5753415961297439,null,null,null,null,0.364155186274036,0.4795943879185241,0.019592988568010027,0.10597397626058865,0.8861391752201799,0.021911366387999957],"ID":"33","lit":0},{"inputs":[0.21180297777126356,-0.3438230852858977,0.3422049080550111,-0.7264955549014941,-0.7497851832997438,1.0041822707151782,-0.9007833180886683,0.26974592102624523,0.7906523576750624,-0.5209838527645196,0.7200191673991978,0.259206758565083,-0.5357019052973407,-0.39527186743840814,null,null,null,null,-0.037340911164913025,0.5988170841830794,0.1679098470355599,-0.646811241691108,0.5738055231917494,-0.3588052811126626],"ID":"34","lit":0},{"inputs":[0.810353312710919,0.23514022187162797,0.6291187724006997,-0.6894830090566874,-0.6913463371290408,-0.33235459622190466,0.47973941658601577,-0.7958356553808665,0.060491729583749126,-0.6708121210456613,0.8763458085789962,0.5137470846253729,-0.8389578061272759,0.8807901709218565,null,null,null,null,-0.2664672974507457,-0.9084787790291018,-0.3616322433232807,-0.20081165575687554,-0.36812506983868293,-0.23003054804795317],"ID":"35","lit":1.631475540196687}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.11047687958640098,0.3512402544820707,-0.9015133439408465,-0.21717907527769342,-0.9578281991531664,0.9241407492860682,-0.8141272407951109,-0.667843844822119,-0.11110026525551224,-0.7614651674889452,0.6280614525612614,-0.9084585479434423],"ID":"36","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6746686067716025,-0.09891875543163302,-0.5063429476070472,-0.6387827117293932,0.305924754827076,0.7250215886329091,0.20513429393059496,0.4796427711499944,0.2820936791631105,0.556141849647151,0.0010097716629925285,0.4761837808857762],"ID":"37","lit":2.4596459055653286},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.11078695156432031,0.18103603755953884,-0.8687612865681464,-0.9607662898397046,0.42409921449006466,0.6384262252826063,-0.9053519920270539,-0.49678180543559447,-0.7655100355191072,0.9609540338803108,0.08723508819828113,0.9610796978814582],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.32070878596182195,0.7991410882025397,-0.037420532751647834,0.3201269218722886,-0.1575552747497187,0.4275684828337926,0.18611309438939136,-0.7749440875108792,-0.7271223311622657,-0.6840110144714452,0.6245308166660867,0.40458116554884627],"ID":"39","lit":0}]}]},{"sizes":[14,4,6,12,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.03039104410869129},{"inputs":[],"ID":"1","lit":-0.06644902384921295},{"inputs":[],"ID":"2","lit":1.5720178317473508},{"inputs":[],"ID":"3","lit":-0.28791405368924955},{"inputs":[],"ID":"4","lit":-0.5226982016773661},{"inputs":[],"ID":"5","lit":-1.1346574757776609},{"inputs":[],"ID":"6","lit":0.1},{"inputs":[],"ID":"7","lit":-2.658311965350131},{"inputs":[],"ID":"8","lit":1},{"inputs":[],"ID":"9","lit":0.40832268337509314},{"inputs":[],"ID":"10","lit":1.7060172920460028},{"inputs":[],"ID":"11","lit":-0.7644246384562103},{"inputs":[],"ID":"12","lit":-0.0011040950398619387},{"inputs":[],"ID":"13","lit":-0.033088015674027825}]},{"neuronList":[{"inputs":[],"ID":"14","lit":1.70409270477459},{"inputs":[],"ID":"15","lit":-0.8378443173107364},{"inputs":[],"ID":"16","lit":-0.04861669661720466},{"inputs":[],"ID":"17","lit":-0.1541133976228678}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8469968673427636,0.43373815434160484,-0.14663986881120017,-0.3969302130984188,-0.12035267187591804,0.1453972357852984,0.739088133678189,-0.13870139087955594,-0.05048761353202942,0.08702579673174478],"ID":"18","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.9590738609699233,-0.6516564214351215,-0.7045848181743937,0.16544401415243723,0.586428395327233,0.7174746216463311,-0.8423673609468328,0.4615408715978716,0.7646094483541648,0.28545672631169355],"ID":"19","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.2789625896028386,-0.31801040564449584,-0.8634682432912628,0.687203232358053,-0.024767722156830103,0.42931470577704545,-0.0845053331309985,-0.2800449239892098,-0.5038735161513911,-0.21560339848133145],"ID":"20","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.28504629185779523,-0.24101429173184,0.7469493004760562,0.7050655543137176,0.6191418077468968,-0.4531717240662427,0.8179834686243399,-0.903019960390591,0.7467022110885279,-0.27097477531767644],"ID":"21","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.06762277104939772,-0.34214731133113785,0.8549106122538496,-0.668354019338733,0.16914891528378465,-0.6100685383537402,0.19915430780275667,0.42061442169191465,-0.6564709789504686,0.8367667028564906],"ID":"22","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.8790363741366007,-0.027077967094908388,-0.4343161610121406,-0.7433873285905769,-0.6755215989602184,-0.9465297558976081,0.5206821772808691,0.882933449990999,-0.8024882661860119,-0.7872658881116749],"ID":"23","lit":0}]},{"neuronList":[{"inputs":[0.4922474872763995,0.478633388156874,-0.7916024632223085,0.7540883934284922,0.5809065027375175,-0.9082501356908929,0.559311592645665,0.0995800153392316,-0.9678721784650974,-0.4624903564448738,0.30431813331264157,0.4103167704710331,0.34881195546356675,-0.3678368841172827,null,null,null,null,-0.9149230510404268,0.4899034233569938,0.11285020724880385,0.17449369811238769,0.7304987664014685,-0.8139056124872465],"ID":"24","lit":0},{"inputs":[0.210311193426437,0.8124478878417222,0.11812577028931906,-0.8543431246026105,-0.5799672454828848,0.06765108029728127,0.31009461823062157,0.6752894092030072,-0.6498377922103933,-0.08440513572385398,-0.10948377054431334,-0.11662444928430317,0.5506963995899934,-0.20708798335025286,null,null,null,null,0.011988822228649316,0.3633852058130372,0.6989753979498867,0.47699268236982006,0.40993925241647733,0.5118546654677092],"ID":"25","lit":0},{"inputs":[0.7202880333110282,-0.15283993800944062,-0.512885433362554,0.3976497872860307,-0.5726720960434135,-0.715920959579787,-0.1630550173076057,-0.7670449806640302,0.5123611666999681,0.709158021550627,0.6510120511301839,-0.8277737173580422,-0.7004701299973395,0.05650043277899891,null,null,null,null,0.7575449911676685,-0.01296428630756727,-0.17495649673416047,0.912397956078293,0.9324427795006984,-0.5449486766395928],"ID":"26","lit":4.789930265478259},{"inputs":[0.8728907073832132,-0.17469205789628725,0.3268845169540778,-0.9962232034045228,-0.7324622461332266,0.3924436628104273,-0.9724908077179714,0.027275299792482024,-0.2620734969348564,-0.37034849614039933,0.41834871106677207,0.026718497735907593,0.04417634506555412,0.9396846562397746,null,null,null,null,0.3029480401768542,0.6004124298909435,-0.953382697288411,0.24919677776722227,-0.07004533769585108,-0.7468541726648152],"ID":"27","lit":0.855492946641903},{"inputs":[-0.04345573732485673,-0.7783622716523686,0.6470764972888489,0.2632490159884956,-0.20033817506610008,0.007571774797637199,-0.14371024861035187,-0.6837983145674422,-0.10322287528572527,0.32663925879597555,0.6268036318009739,-0.8851786361692509,-0.8629389783722883,0.8341245512563524,null,null,null,null,-0.5975499378199342,-0.8342683609971477,0.2765145634689761,-0.7648384211172733,-0.5286058438310953,-0.79414344130205],"ID":"28","lit":4.640821475711155},{"inputs":[0.02415006891428488,-0.4518473398847779,-0.2185656564807489,-0.7978664831447797,-0.1537917073673893,0.44714310846236505,0.6801860226486475,-0.4263776232136908,-0.6390719670968433,0.22541708562966226,0.5918834072301976,-0.40475091880030184,0.1816315559492228,0.9129548686172456,null,null,null,null,-0.07996519119721539,-0.783816387418427,-0.07171182337200893,0.4630676115388888,0.5416348664946348,0.2648959147606351],"ID":"29","lit":1.4331097835315387},{"inputs":[-0.2921394512507233,-0.8055709162595712,0.3568296504001882,0.8588543402754348,0.3605885651727668,-0.10326870036524283,-0.494316292883557,0.43191850438519586,0.7798358772028771,0.8544394627773929,0.4670494307677382,-0.6020301808542038,-0.4031460443433431,0.20755108872725064,null,null,null,null,0.28624826704721074,0.6571267160758364,-0.022719781026902402,0.07035838303183543,-0.3734823320737854,-0.23116913278343046],"ID":"30","lit":1.4687088253021128},{"inputs":[-1.0226513403604192,0.4754425374835664,-0.9877807795831165,0.4759105186664954,-0.37657045074892387,-0.532739851789069,-0.8601641239052439,-0.5660165723282329,0.3197874267915668,0.9013487533151407,0.5014377260117162,-0.2771745855075433,0.7560359138530355,0.7304788802522771,null,null,null,null,0.15315898132087394,0.10543373931949658,0.9024744675356995,0.3115837310164462,-0.08438151035241256,-0.5408074521864689],"ID":"31","lit":2.19760395685136},{"inputs":[-0.943260518105347,-0.26322762975789366,0.13330588891769563,0.14349842234231353,0.6448194786350431,0.9152195739059878,0.6419610358066505,-0.9055620177618892,0.2505215809538234,0.5403991547597089,-0.32197747633871954,0.413859077869985,0.35619058612430793,-0.34771985471624683,null,null,null,null,-0.7326944140282643,0.9045634667377839,-0.8196905067653012,0.48921035577508165,0.2089996196599548,-0.3412629091633175],"ID":"32","lit":0.8696519937877478},{"inputs":[-0.21350824751596528,-0.23478608628555966,-0.4947555687224292,0.470060141229405,0.8826661959892136,0.4455448973642015,-0.9522702677442341,0.013347805252203554,-0.4197352751019298,-0.2450562185149312,0.2531481110511452,0.10821489839413624,0.3132483114688452,-0.5760909580718161,null,null,null,null,0.3500396093337537,0.47213336056567057,0.017509598462747737,0.11171402571277729,0.8899948974577186,0.020220741647883355],"ID":"33","lit":0},{"inputs":[0.20681508252359704,-0.3461175622649809,0.350766208151542,-0.7292640396058945,-0.7517477486336053,0.9993129036129592,-0.9134252294883297,0.2749920568507841,0.8029898913600758,-0.5227599983779166,0.7333695091294299,0.2627286268117506,-0.5463982402044416,-0.4000865425303646,null,null,null,null,-0.03771260601394676,0.6095948389689417,0.19171616834584435,-0.6659719450354071,0.5815300626506021,-0.3570943409427126],"ID":"34","lit":0.8810440417446892},{"inputs":[0.8276079510512827,0.22362656146388457,0.6351385822298558,-0.6779941052054138,-0.6954617330320466,-0.340327745758792,0.4637007059238157,-0.7875268148803425,0.049667233049427495,-0.6725380152449802,0.8675009165987063,0.5146538596457658,-0.8280164727493988,0.8647978208652887,null,null,null,null,-0.2589272595185089,-0.9147843888634112,-0.3723956163633357,-0.20935582409072678,-0.35400131088906456,-0.24747580215032733],"ID":"35","lit":4.927391299901174}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,-0.11025034469114432,0.34578493641662034,-0.915278492032598,-0.2307839193387525,-0.954272051169533,0.9247205070829075,-0.8161626133513789,-0.6777405639245004,-0.1257285355145648,-0.7485864905995573,0.6177875220378906,-0.9118543739578129],"ID":"36","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.6851296207081774,-0.09378749802539235,-0.49706275634405045,-0.6367447244590345,0.29065797216310524,0.7202886138260035,0.1937036548072463,0.481498722248225,0.2901282724665323,0.5529035867619934,0.004235731238620439,0.4700423317695977],"ID":"37","lit":3.3702806147630113},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.09850130295581487,0.18895101657590646,-0.8548080332409025,-0.9760449052249238,0.4113645514504357,0.6272206833674456,-0.8879911354410724,-0.4891701612539798,-0.7708402193346494,0.9427498673178251,0.10080086387527393,0.9565748021847861],"ID":"38","lit":0},{"inputs":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0.32152849599878863,0.809378404579311,-0.043782731029481374,0.3058449834815237,-0.15647913806932015,0.45508363271602154,0.19979905041032192,-0.7889619942362183,-0.7349121979389992,-0.681440148308576,0.6353328522405736,0.3955658898180783],"ID":"39","lit":0.40729197769604153}]}]}]';
var brain1 = JSON.parse(B1)[0];
Object.setPrototypeOf(brain1, network.prototype);

//var B2 = B1;
var brain2 = JSON.parse(B1)[1];
Object.setPrototypeOf(brain2, network.prototype);
