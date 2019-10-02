var displayingGraphics;
if (typeof window === "undefined"){
    displayingGraphics = false;
} else {
    displayingGraphics = true;
}
var then;                   //Time of last animation frame

/*global window, document, Image*/

/* jshint -W030, -W119*/


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
    this.keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
    this.p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
    this.p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);
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
                                   // console.log(e.keyCode);
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
                document.getElementById("controls").style.display = "none";
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

function flipUniverse(HV, LRUD, u) {
        u.Player.One.flip(HV, LRUD, u);
        u.Player.Two.flip(HV, LRUD, u);
        var m;
        for (m = 0; m < u.missiles.length; m++) {
            u.missiles[m].flip(HV, LRUD, u);
        }
        for (m = 0; m < u.weaponsCurrent.length; m++) {
            u.weaponsCurrent[m].flip(HV, LRUD, u);
        }
        if (u.floatingBox.existing) {
            u.floatingBox.flip(HV, LRUD, u);
        }
        flipStarDisplay(HV, LRUD, u);
        var newMode;
    if(HV == "H") {
        switch (u.mode) {
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
        switch (u.mode) {
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
    u.mode = newMode;
}



function flipAround(u) {
    u.topologyFlipping = 0;
    var whichFlip = Math.floor(Math.random()*5);
    switch (whichFlip) {
        case 1:
            u.topologyFlipping = "H";
            flipUniverse("H","U", u);
            break;
        case 2:
            u.topologyFlipping = "H";
            flipUniverse("H","D", u);
            break;
        case 3:
            u.topologyFlipping = "V";
            flipUniverse("V","L", u);
            break;
        case 4:
            u.topologyFlipping = "V";
            flipUniverse("V","R", u);
            break;
    }
}

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
        flipAround(u);
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
    var num = u.weaponTypes.length;
    return u.weaponTypes[Math.floor(Math.random()*num)];
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

function synapse(toNeuron, w){
    this.weight = w;
    this.to = toNeuron;
}

var neuron = function(ID){
    this.inputs = [];
    this.ID = ID.toString();
    this.lit = 0;
};

neuron.prototype.connect = function(aNeuron, weights){
    var connKey = aNeuron.ID;
    if(weights == "random"){
        this.inputs[aNeuron.ID] = Math.random();
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

var network = function(layerNos, weights){// three numbers
    this.sizes = layerNos;
    this.layers = [];
    var ID = 0;
    for (var l in layerNos){
        var newLayer = new layer(layerNos[l], ID);
        ID += layerNos[l];
        this.layers.push(newLayer);
        if(l > 0){
            this.layers[l].connect(this.layers[l-1], weights);
        }
    }
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
                currentInputList[inputCount] = squash(currentInputList[inputCount] + Math.random() * rate);
            }
        }
    }
    return theNewNetwork;
};

function squash(x){
    return 1/(1 + Math.exp(-x));
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
    if (inputArray.length < this.sizes[0]){
        inputArray.push(new Array(this.sizes[0] - inputArray.length).fill(0));
    } else if (inputArray.length > this.sizes[0]){
        inputArray.splice(this.sizes[0], inputArray.length - this.sizes[0]);
    }
    for (var chooseNeuron in this.layers[0].neuronList){
        var currentNeuron = this.layers[0].neuronList[chooseNeuron];
        currentNeuron.lit = inputArray[chooseNeuron];
    }
    for (var chooseLayer = 1; chooseLayer < this.sizes.length; chooseLayer++){
        var currentLayer = this.layers[chooseLayer].neuronList;
        for (var pickNeuron in currentLayer){
            var thisNeuron = currentLayer[pickNeuron];
            var sum = 0;
            for (var otherNeuron in thisNeuron.inputs){
                sum += thisNeuron.inputs[otherNeuron] * this.neuronFind(otherNeuron).lit;
            }            
            thisNeuron.lit = squash(sum);
        }
    }
    var output = [];
    for (var outNeuron in this.layers[this.sizes.length-1].neuronList){
        output.push(this.layers[this.sizes.length-1].neuronList[outNeuron].lit);
    }
    return output;
};




//var u = new main.universeInfo();
//var status = new main.gameStatus();
//var ship = main.ship;
//u.Player = new main.playerTypes(u);
//u.Player.One.takeStep(u, status);
//console.log(u.Player.One);


function playGame(brain1, brain2){
    var u = new universeInfo();
    u.explosionLength = 0;
    var status = new gameStatus();
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
    for (var i = 0; i < nIterations; i++){
        A = improveSpecies(A, nGames, 0.1);
        if (i % 10 == 9){
            console.log(i+1+' tournaments so far!');
        }
    }
    return A[0];
}


//console.log(R[1][0]);
//console.log(R[0][1]);

function improveSpecies(A, nGames, learningRate){
    var playerNumber = A.length;
    var R = playTournament(A, nGames);
    console.log(R);
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
    var inputArray = this.observe(u);
    var answers = brain.activate(inputArray);
    //console.log(answers);
    var answersIndex = 0;
    if (answers[0] > 0.5){
        status.keysList[this.keyScheme(status).thrust] = true;
    } else {
        status.keysList[this.keyScheme(status).thrust] = false;
    }
    if (answers[1] > 0.5){
        //status.keysList[this.keyScheme(status).fire] = true;
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

ship.prototype.pointToCoordinates = function(v, u){     ///////////// Expresses v in the coordinates where the speed of this ship is (v,0) and the position is (0,0)
    var answer = new vec(v.x, v.y);
    answer = answer.plus(this.pos.op());
    var rotate = this.vel.toAngle() - Math.PI / 2;
    answer = answer.rot(-rotate);
    return answer;
};

ship.prototype.vectorToCoordinates = function(v, u){     ///////////// Expresses v in the coordinates where the speed of this ship is (v,0) and the position is (0,0)
    var answer = new vec(v.x, v.y);
    var rotate = this.vel.toAngle() - Math.PI / 2;
    answer = answer.rot(-rotate);
    return answer;
};
    
var computerError = 4;
var computerForesight = 10;

ship.prototype.observe = function(u){
    var observations = [];
    ///////////// In our system of coordinates, the speed of the ship is (v,0) and the position is (0,0)
    // Speed of the ship:
    var speed = this.vel.Vlength();
    //console.log("Speed: " + speed);
    observations.push(squash((speed - 10)/5));
    // Distance to earth:
    var earthWhere = this.pointToCoordinates(u.O, u);
    var dist = earthWhere.Vlength();
    //console.log("Distance to Earth: " + dist);
    observations.push(squash( (dist - 200)/100 ));
    // Angle of Earth:
    var earthAngle = earthWhere.toAngle() - Math.PI / 2;
    //console.log("Angle to Earth: " + earthAngle);                     
    observations.push(squash( earthAngle ));
    // Where will I be in a while?
    var ghost = new flyingThing(this.pos, this.vel);
    var minDistance = dist;
    for(var simTime = 0; simTime < computerForesight; simTime++){
        var whereIsGhost = canToEarth(ghost.pos, u);
        //if ((Math.abs(whereIsGhost.x) > 10 || Math.abs(whereIsGhost.y) > 10) && whereIsGhost.x > - u.universeWidth/2 && whereIsGhost.x/2 < u.universeWidth && whereIsGhost.y > -u.universeHeight/2 && whereIsGhost.y < u.universeHeight/2){
        ghost.freeFall(1, u, computerError);
        //console.log(ghost.pos.x+", "+ghost.pos.y);
        var newDist = shortestPath(ghost.pos, u.O, u)
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
    observations.push(squash( (minDistance - 200)/100 ));
    // Future Earth Coordinates
    observations.push(squash( (canToEarth(ghost.pos, u).x - 200)/100 ));
    observations.push(squash( (canToEarth(ghost.pos, u).y - 200)/100 ));
    // Temperature
    observations.push(squash((this.engineTemp - u.overheatTemp/2)/u.overheatTemp));
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



function universeInfo() {
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
    this.weaponTypes = ["Mine", "Banana", "Gravity", "Top", "Guided", "Guided3", "Magnet", "Bomb"];       //All the possible weapons
    this.guidedAgility = 0.1;        //How fast can the guided missile turn
    this.magnetStrength = 2;       //How strong the magnet pull is
    this.bombTimer = 60;            //How long before bomb detonation
    this.blastRadius = 130;          //Of the bomb
    this.effectDuration = 15;        //Duration of weapon effects, in frames
    this.infiniteAmmo = true;
    this.missiles = [];          //Array storing all the flying missiles 
    this.successfulMissiles = [];//Keeps track of the missiles that have hit their targetu.
    this.eyesChasing = 1;        //Who the eyes of the Earth are chasing
    this.weaponTimer = 0;        //Time until a weapon spawns
    this.floatingBox = new presentBox(null);//The one possible weapon box
    this.weaponsCurrent = [];        //Array that keeps track of weapons currently flying around
    this.GravityWarpTimer = 0;       //Time left of extra gravity
    this.topologyCounter = 0;        //Time left in the topolgizer effect
    this.topologyFlipping = 0;       //0 if it's not currently changing, H or V if it's changing
    this.mode = "RP2";         //Universe is a torus. Only mode for now. Other possibilites: InvertX, InvertY (klein bottles), RP2
    this.O = new vec(this.universeWidth/2, this.universeHeight/2); //The origin, the planet.
    this.starDisplay = [];
    this.Player = null;
}
















/////////////////////////////// Things running in the game ////////////////////////

function gameOver(c, g, imgList, status, u) {
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

function startTheGame(c, g, imgList, status, u) {
    g = new graphicalInfo(u);
    c = new makeContext(g);
    u.Player = new playerTypes(u);
    u.Player.One.whoPlaying = brain1;
    u.Player.Two.whoPlaying = brain2;
    u.mode = "Torus";
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
    c.ctx.fillStyle = "black";
    c.ctx.fillRect(0,0,1000,1000);
    status.scene = "menu";
    getBackground(50, u);
    drawBackground(c, g, imgList, u);
    if (Math.floor(Math.random()*2) > 0) {
        c.ctx.fillStyle = "turquoise";
    } else {
        c.ctx.fillStyle = "yellow";
    }
    c.ctx.font = "100px Faster One";
    c.ctx.textAlign = "center";
    c.ctx.fillText("Cosmic", g.gameWidth/2, g.gameHeight/2-150);
    c.ctx.fillText("Coconut!", g.gameWidth/2, g.gameHeight/2-20);
    c.ctx.font = "30px Bungee Shade";
    c.ctx.fillText("Press S to start", g.gameWidth/2, 3* g.gameHeight/4);
    c.ctx.fillText("Press O for options", g.gameWidth/2, 3* g.gameHeight/4 + 70);
    //c.ctx.fillText("Press C for credits", g.gameWidth/2, 3* g.gameHeight/4 + 100);
   // c.ctx.font = "20px Bungee Shade";
    //c.ctx.fillText("In nomin: Eva", g.gameWidth/2, 3* g.gameHeight/4+40);
}

function showOptions(c, g, imgList, status, u) {
    c.ctx.fillStyle = "black";
    c.ctx.fillRect(0,0,1000,1000);
    status.scene = "options";
    getBackground(50, u);
    drawBackground(c, g, imgList, u);
    c.ctx.fillStyle = "white";
    c.ctx.font = "100px Faster One";
    c.ctx.fillText("Options", g.gameWidth/2, 100);
    c.ctx.font = "40px Bungee Shade";
    c.ctx.textAlign = "left";
    c.ctx.fillText("Controls", 30, 200);
    c.ctx.font = "18px Bungee Shade";
    c.ctx.textAlign = "center";
    c.ctx.fillText("Press M to go back to menu", g.gameWidth/2, g.gameHeight - 50);
    document.getElementById("controls").style.display = "table";
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

function finishLoading() {
    //console.log("Loaded");
    document.getElementById("LoadingMessage").style.color = "#000033";
    var status = new gameStatus();
    var imgList = new getImages();
    var u = new universeInfo();
    var g = new graphicalInfo(u);
    var c = new makeContext(g);
    //symmetricControls(status); ////Remove this
    c.area.style.display = "inline";
    setKeyListeners(c, g, imgList, status, u);
    showMenu(c, g, imgList, status, u);
    controlsClickingListeners(status);
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


*/

if (!displayingGraphics) {
    module.exports = {
        universeInfo:universeInfo,
        playerTypes:playerTypes,
        gameStatus:gameStatus,
        ship:ship,
    };
}

var B1 = '{"sizes":[7,9,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.8553427080926441},{"inputs":[],"ID":"1","lit":0.49557322918987906},{"inputs":[],"ID":"2","lit":0.7328861032253466},{"inputs":[],"ID":"3","lit":0.37616414304416373},{"inputs":[],"ID":"4","lit":0.2742395340615952},{"inputs":[],"ID":"5","lit":0.5735848616059925},{"inputs":[],"ID":"6","lit":0.46879062662624377}]},{"neuronList":[{"inputs":[0.5440517376642204,-0.4754927666300322,1.2468016538907325,0.9221884820981777,0.49570634373498895,0.17481647362824215,0.35855093389246057],"ID":"7","lit":0.8692867122697889},{"inputs":[1.2689321452123978,0.7949124029281032,-0.10549459731820221,0.7541436083000246,0.48119264819112173,-1.2099129567389646,-0.8106297210055387],"ID":"8","lit":0.6777900222917552},{"inputs":[-1.1105289933806282,0.479712796051044,-0.30685169357874087,0.6937179658185981,-0.4908915537113244,0.27789028110460173,-0.6402826380597443],"ID":"9","lit":0.2785888296430771},{"inputs":[-0.5533269001258934,-0.5301475178282622,-0.5989062408133473,-0.4699980734251107,-0.4799771815352749,-0.2834011146227605,-0.26712279558035384],"ID":"10","lit":0.1453999325932188},{"inputs":[0.9979674435694214,0.4393133934883381,-0.2775938152726155,-0.5048399895622646,-0.2348128208611287,0.2643885999791416,0.008101753597513556],"ID":"11","lit":0.6833091102116758},{"inputs":[0.21344735368070766,-0.21766782596925938,-0.2649618791347101,0.45689688429951736,-0.013415781929633136,-0.6898030561912468,-0.3944331681044798],"ID":"12","lit":0.3700820897750981},{"inputs":[0.07695021810779555,-1.049357950753781,0.23581018799510203,-0.6105190228747235,-0.017110588525973802,0.33113691698811887,0.6303979320887767],"ID":"13","lit":0.4924303556275918},{"inputs":[-0.8250555481303253,0.8808794503395504,0.14232333684036175,0.29992916333136466,-0.7206985555877851,0.2779403786761952,0.45949507983209503],"ID":"14","lit":0.5312466681415087},{"inputs":[-0.879758154812022,1.1173107056225244,0.007103183890058956,-0.07723027470813008,0.0867953398608193,0.14844782807304902,-0.5227402159082706],"ID":"15","lit":0.4112654685805655}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,-0.4177632918020322,-0.10574936700353621,-0.3455837898389761,0.1882410474865498,0.7431886512478502,0.26156369695308307,0.1677355093701054,-0.34329901398230395,0.06388909761078998],"ID":"16","lit":0.5068463476352258},{"inputs":[null,null,null,null,null,null,null,0.2235731929426166,0.7812969892680337,-1.2422913241809008,0.34402395657123724,1.347274712408948,0.5461211947894401,0.3290530229881457,-0.05772286061619978,-0.4546494820490665],"ID":"17","lit":0.8168187061467788},{"inputs":[null,null,null,null,null,null,null,0.15686677460389442,0.44829332106232656,-0.22685897438490654,-0.08993172712612404,1.3833190845928163,-0.28246861744786594,-0.580220541891719,-0.47908405259547837,0.927815430035904],"ID":"18","lit":0.7400023730770529},{"inputs":[null,null,null,null,null,null,null,0.4271638882969523,0.7733647864006669,-0.3997166347665606,-0.3347470302846233,-0.47432433145443686,-0.8184010527820333,-0.46906872761867224,-0.17950360002361354,-0.30300078114246354],"ID":"19","lit":0.4152106308370901}]}]}';
var brain1 = JSON.parse(B1);
Object.setPrototypeOf(brain1, network.prototype);

var B2 = '{"sizes":[7,9,4],"layers":[{"neuronList":[{"inputs":[],"ID":"0","lit":0.5297686627974418},{"inputs":[],"ID":"1","lit":0.444811908406958},{"inputs":[],"ID":"2","lit":0.8278035899054215},{"inputs":[],"ID":"3","lit":0.38047191407910574},{"inputs":[],"ID":"4","lit":0.036244031068205784},{"inputs":[],"ID":"5","lit":0.05706626624208751},{"inputs":[],"ID":"6","lit":0.3775406687981454}]},{"neuronList":[{"inputs":[-0.08281454504683161,1.0268284636073624,-0.5135545105994512,0.40094479341941974,0.370908504819206,1.531686892140105,0.5158747128598856],"ID":"7","lit":0.6072848696724863},{"inputs":[0.9272498008159586,1.3440540028587982,0.8774950044643,0.7299859967447151,-0.19179379443852237,-0.31202874417980425,-0.8756532619924253],"ID":"8","lit":0.850414963239495},{"inputs":[-0.42784834665034355,0.7588108462949424,0.18090682541961606,0.545968821377401,-0.42056126370639124,1.3403699982702462,-0.19360745269302293],"ID":"9","lit":0.6121837801808725},{"inputs":[-0.3586717605608628,-0.4883114724752858,-1.9994200329966625,-0.23052058438542866,-0.7339196264394485,0.6022503118756223,1.1154792962252889],"ID":"10","lit":0.1517235158387866},{"inputs":[-0.6821033008674745,-0.07148654960880768,0.20943013796348034,-0.3043143572589829,-1.439317368905585,-0.1700769586463957,0.09426885061039907],"ID":"11","lit":0.41051106562120104},{"inputs":[0.22183781493140167,0.21067597406735505,-0.23298012239252425,-0.8304333815142726,-0.951393415201426,-0.5635965135465215,-0.2643664647481333],"ID":"12","lit":0.38602828215762125},{"inputs":[-2.055356345057604,-0.3208344140644546,0.09159213575510988,-0.9429396712094784,-0.9777065505828123,-0.7808493639918525,-1.411278485095409],"ID":"13","lit":0.10646898528820332},{"inputs":[-1.2552674425581714,-0.1669208836442951,0.3991094335784696,-0.9232808323734392,-0.2676867267494811,-0.19236315992203554,0.6709261236106374],"ID":"14","lit":0.3710941986833791},{"inputs":[-0.09802606367207498,-0.8118342387729195,-0.3061944891213205,0.5007489888151755,0.2501073484695774,1.6240006922402082,-0.40044917302886973],"ID":"15","lit":0.3715815433877886}]},{"neuronList":[{"inputs":[null,null,null,null,null,null,null,-0.7044750264767229,-1.0095721524142467,1.5676432224316472,0.4911614472682318,1.4637815845210225,-1.118510154686779,0.4414260779422303,-0.7246014563132128,0.2811542538614536],"ID":"16","lit":0.45004984881760357},{"inputs":[null,null,null,null,null,null,null,0.822265202491216,-0.21866607856516734,-0.632719159473382,1.571997458584676,0.6859020747662277,-0.18055358461293108,-0.05293350409781647,-0.18518723624187616,0.9327517518236536],"ID":"17","lit":0.6567102677002942},{"inputs":[null,null,null,null,null,null,null,0.09745506902737881,0.29326067797890143,-1.4979087518182674,0.6020614832054613,-1.2104047794719397,1.809076384714311,0.4309349543244723,-0.23842024149567065,0.5131376873391409],"ID":"18","lit":0.4582164557385277},{"inputs":[null,null,null,null,null,null,null,-0.44759387175560406,-0.5697092686039591,-0.48549769850327595,0.8203894113184004,-0.622782669882613,-0.7494585464141666,-0.4611234287806754,1.1754792207781206,0.04973125771422719],"ID":"19","lit":0.25570334856342225}]}]}';
brain2 = JSON.parse(B2);
brain1 = brain2;
Object.setPrototypeOf(brain2, network.prototype);