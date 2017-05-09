var gameWidth = 800;    //Width of game zone in pixels
var gameHeight = 600;   //Height of game zone in pixels
var bgColor = "#000000";  //Color of the sky backdrop
var starColor = "#FFFFFF";  //Color of the background stars
var earthColor = "blue";   //Color of the planet in the middle
var defaultG = 20000;       //Default strength of gravity
var G = defaultG;             //strength of gravity
var dt = 0.5;               //Changing this is a mess. Most of the speed is measured in framses anyway
var rotationSpeed = 0.2;    //Speed at which ships rotate when you press keys
var earthRadius = 75;       //Size of planet inside
var mode = "Torus";         //Universe is a torus. Only mode for now. Other possibilites: Invertx, inverty (klein bottles), RP2
var then;                   //Time of last animation frame
var PlayerOne;              //Player ship
var PlayerTwo;              //Player ship
var scene = "menu";        //Scene: possibilities: "start", "GameOver", "menu"
var winner = "none";        //Winner of the last game
var missiles = [];          //Array storing all the flying missiles 
var projectileSpeed = 20;   //Speed at which a missile is fired
var explosionLength = 15;   //Time a ship spends exploding
var overheatTemp = 20;      //Temperature at which a ship starts overheating
var missileCooldown = 5;    //Min time between missiles
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
var weaponTypes = ["Mine", "Banana", "Gravity", "Top"];       //All the possible weapons
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
var weaponsCurrent = [];    //Array that keeps track of weapons currently flying around
var effectDuration = 15;    //Duration of weapon effects, in frames
var GravityWarpTimer = 0;
var changingKey = false;
var whichKeyIsChanging = null;
var topologyCounter = 0;




var area = document.getElementById("gameZone");
area.width = gameWidth;
area.style.width = gameWidth+"px";
area.height = gameHeight;
area.style.height = gameHeight+"px";
var ctx = area.getContext("2d");
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
var imageLightning = new Image();
imageLightning.src = 'Lightning.png';
var imageTop = new Image();
imageTop.src = 'Topologizer.png';
var imageHCrack = new Image();
imageHCrack.src = 'HCrack.png';
var imageVCrack = new Image();
imageVCrack.src = 'VCrack.png';

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
}

//Placing a rotated image ////////////////////////
//VDisplacement from the top, where the center of mass should be
placeRotated = function(imgObject, position, angle, imgW, imgH, Hdisplace, Vdisplace){   
    ctx.translate(position.x, position.y);
    ctx.rotate(-angle);
    ctx.drawImage(imgObject, -Hdisplace, -Vdisplace, imgW, imgH);
    ctx.rotate(angle);
    ctx.translate(-position.x, -position.y);
}

var O = new vec(gameWidth/2, gameHeight/2); //The origin, the planet.

canToEarth = function(v){
    return v.plus(O.op());
};

earthToCan = function(v){
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

function stringFromCharCode(code){
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

var p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
var p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);


var keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
window.onkeyup = function(e) {keysList[e.keyCode]=false;
                             }
window.onkeydown = function(e) {keysList[e.keyCode]=true;
                               // console.log(e.keyCode);
                               if (e.keyCode == leftKey || e.keyCode == rightKey || e.keyCode == upKey || e.keyCode == downKey || e.keyCode == spaceBar){e.preventDefault();}
                               if (changingKey){
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
        var x = Math.floor(Math.random()*gameWidth);
        var y = Math.floor(Math.random()*gameHeight);
        starDisplay.push(new vec(x,y));
    }   
}

function flipStarDisplay(HV, LRUD){
    for (var s = 0; s < starDisplay.length; s++){
        if(HV == "H" && LRUD == "U"){
            if (starDisplay[s].y < gameHeight/2){
                starDisplay[s].x = gameWidth - starDisplay[s].x;
            }
        }
        if(HV == "H" && LRUD == "D"){
            if (starDisplay[s].y > gameHeight/2){
                starDisplay[s].x = gameWidth - starDisplay[s].x;
            }
        }
        if(HV == "V" && LRUD == "L"){
            if (starDisplay[s].x < gameWidth/2){
                starDisplay[s].y = gameHeight - starDisplay[s].y;
            }
        }
        if(HV == "V" && LRUD == "R"){
            if (starDisplay[s].x > gameWidth/2){
                starDisplay[s].y = gameHeight - starDisplay[s].y;
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
            ctx.arc(starDisplay[i].x, starDisplay[i].y, 2, 0, 2 * Math.PI);
        } else {
            ctx.arc(starDisplay[i].x, starDisplay[i].y, 3, 0, 2 * Math.PI);
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
    ctx.drawImage(imageEarth, O.x - earthRadius, O.y - earthRadius , 2*earthRadius, 2*earthRadius);
}

function drawEyes(){
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(O.x - 32, O.y - 30, 18, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(O.x + 32, O.y - 30, 18, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    var direction = eyesChasing.pos.plus(O.op());
    direction = direction.times(1/direction.Vlength()*6);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(O.x - 32 + direction.x, O.y - 30 + direction.y, 8, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(O.x + 32 + direction.x, O.y - 30 + direction.y, 8, 0, 2 * Math.PI); //draw left Eye
    ctx.fill();
    ctx.stroke();
    
}

////////////////// THE CLASS FOR HITBOXES ///////////////

function hitboxClass(front, back, sides){
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

hitboxClass.prototype.increase = function(r){
    return new hitboxClass(this.front + r, this.back + r, this.sides + r)
}

////////////////// THE CLASS FOR FLYING STUFFS ///////////////

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

flyingThing.prototype.freeFall = function(gMult){
    gMult = gMult || 1;
    var acc = this.gPull(gMult);
    this.vel = this.vel.plus(acc.times(dt));
    this.pos = this.pos.plus(this.vel.times(dt));
    this.pos = this.pos.plus(acc.times(dt*dt/2));
}



flyingThing.prototype.leaveScreen = function(){
    if(mode == "Torus"){
        if (this.pos.x > gameWidth){
            this.pos.x -= gameWidth;
        } else if (this.pos.x < 0){
            this.pos.x += gameWidth;
        }
        if (this.pos.y > gameHeight){
            this.pos.y -= gameHeight;
        } else if (this.pos.y < 0){
            this.pos.y += gameHeight;
        }    
    } 
    if(mode == "InvertX"){
        if (this.pos.x > gameWidth){
            this.pos.x -= gameWidth;
        } else if (this.pos.x < 0){
            this.pos.x += gameWidth;
        }
        if (this.pos.y > gameHeight){
            this.pos.y -= gameHeight;
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0){
            this.pos.y += gameHeight;
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        }    
    }
    if(mode == "InvertY"){
        if (this.pos.x > gameWidth){
            this.pos.x -= gameWidth;
            this.pos.y = gameHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI/2 -this.facing;
            }
        } else if (this.pos.x < 0){
            this.pos.x += gameWidth;
            this.pos.y = gameHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI/2 -this.facing;
            }
        }
        if (this.pos.y > gameHeight){
            this.pos.y -= gameHeight;
        } else if (this.pos.y < 0){
            this.pos.y += gameHeight;
        }    
    }
    if(mode == "RP2"){
        if (this.pos.x > gameWidth){
            this.pos.x -= gameWidth;
            this.pos.y = gameHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI/2 -this.facing;
            }
        } else if (this.pos.x < 0){
            this.pos.x += gameWidth;
            this.pos.y = gameHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if (this.constructor == ship){
                this.facing = Math.PI/2 -this.facing;
            }
        }
        if (this.pos.y > gameHeight){
            this.pos.y -= gameHeight;
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        } else if (this.pos.y < 0){
            this.pos.y += gameHeight;
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if (this.constructor == ship){
                this.facing = -this.facing;
            }
        }    
    }
};


flyingThing.prototype.checkCollision = function(){
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
}

weapon.prototype = Object.create(flyingThing.prototype);
weapon.prototype.constructor = weapon;

weapon.prototype.draw = function(){
    switch (this.type){
        case "Mine":
            this.facing += 0.03;
            placeRotated(imageMine, this.pos, this.facing, 26, 26, 13, 13);
            break;
        case "Banana":
            placeRotated(imageBanana, this.pos, 0, 26, 26, 13, 13);
            break;
        case "Gravity":
            this.facing += 0.06;
            placeRotated(imageGravity, this.pos, this.facing, 26, 26, 13, 13);
            break;
        default:
            break;
        }
}

flyingThing.prototype.flip = function(HV, LRUD){
    if(HV == "H" && LRUD == "U"){
        if (this.pos.y < gameHeight/2){
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship){
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "H" && LRUD == "D"){
        if (this.pos.y > gameHeight/2){
            this.pos.x = gameWidth - this.pos.x;
            this.vel.x = -this.vel.x;
            if(this.constructor == ship){
                this.facing = -this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "L"){
        if (this.pos.x < gameWidth/2){
            this.pos.y = gameHeight - this.pos.y;
            this.vel.y = -this.vel.y;
            if(this.constructor == ship){
                this.facing = Math.PI-this.facing;
                this.orbiting = false;
            }
        }
    }
    if(HV == "V" && LRUD == "R"){
        if (this.pos.x > gameWidth/2){
            this.pos.y = gameHeight - this.pos.y;
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
        ctx.drawImage(imageHCrack, 0, 0, gameWidth, gameHeight);
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
        ctx.drawImage(imageVCrack, 0, 0, gameWidth, gameHeight);
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


function dealWithWeapons(){
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
                        PlayerOne.status = "slowed";
                        PlayerOne.statusTimer = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        //PlayerTwo.engineTemp += overheatTemp/2;
                        PlayerTwo.vel = PlayerTwo.vel.times(0.2);
                        PlayerTwo.status = "slowed";
                        PlayerTwo.statusTimer = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    }
                    
                    break;
                case "Banana":
                    if (W.living < 10){
                        W.living ++;
                    }
                    if (PlayerOne.easyCollide(W.pos, 10) && PlayerOne.status != "slowed" && (W.living == 10 || W.firedBy == 2)){
                        PlayerOne.orbiting = false;
                        PlayerOne.vel = PlayerOne.vel.times(2);
                        PlayerOne.status = "slowed";
                        PlayerOne.statusTimer = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && PlayerTwo.status != "slowed" && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        PlayerTwo.vel = PlayerTwo.vel.times(2);
                        PlayerTwo.status = "slowed";
                        PlayerTwo.statusTimer = effectDuration;
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
                        PlayerOne.status = "gravitied";
                        PlayerOne.statusTimer = effectDuration;
                        weaponsCurrent.splice(w, 1);
                        w--;
                    } else if (PlayerTwo.easyCollide(W.pos, 10) && (W.living == 10 || W.firedBy == 1)){
                        PlayerTwo.orbiting = false;
                        PlayerTwo.status = "gravitied";
                        PlayerTwo.statusTimer = effectDuration;
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
        ctx.drawImage(imageLightning, 0, 0, gameWidth, gameHeight);
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
    this.pos = new vec(gameWidth * Math.random(), gameHeight * Math.random());
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
        placeRotated(imageBox, this.pos, 0, 24+this.timer, 24+this.timer, 12+this.timer/2, 12+this.timer/2);
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
    this.status = "ok";
    this.statusTimer = 0;
}


ship.prototype = Object.create(flyingThing.prototype);
ship.prototype.constructor = ship;

ship.prototype.setAngularSpeed = function(){
    this.angularspeed = Math.sqrt((this.gPull().Vlength())/(canToEarth(this.pos).Vlength()));
    this.vel = canToEarth(this.pos).rot(Math.PI/2).times(this.angularspeed);
}

ship.prototype.clearStatus = function(){
    this.statusTimer = 0;
    this.enginePower = new vec(0, -enginesPower);
    this.status = "ok";
}

ship.prototype.checkStatus = function(){
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
       
    }
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
            if (this.status == "gravitied"){
                var extraG = 7;
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
            this.coolDownTimer = missileCooldown * 3;
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
                    placeRotated(imageShipOverheating1, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    placeRotated(imageShipOverheating1Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            } else {
                if (this.whichPlayer == 1){
                    placeRotated(imageShipOverheating2, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    placeRotated(imageShipOverheating2Blue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            }
        } else if (!keysList[this.keyScheme.thrust]){
            if (this.whichPlayer == 1){
                    placeRotated(imageShipNoFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    placeRotated(imageShipNoFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
        } else {
            this.firestate = (this.firestate+1) % 6;
            if (this.firestate < 3){
                if (this.whichPlayer == 1){
                    placeRotated(imageShipFire, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    placeRotated(imageShipFireBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            } else {
                if (this.whichPlayer == 1){
                    placeRotated(imageShipFireAlt, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                } else {
                    placeRotated(imageShipFireAltBlue, this.pos, this.facing, 17*1.5, 37*1.5, 17*0.75, 37/2);
                }
            }
        }
    } else {
        if (Math.floor(this.firestate / 3) % 2 == 0){
            placeRotated(imageExplosion, this.pos, this.facing, 50, 50, 25, 25);
        } else {
            placeRotated(imageExplosion, this.pos, this.facing + Math.PI, 50, 50, 25, 25);
        }
    }
    this.drawTempBar();
    this.drawCurrentWeapon();
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
    if (dist < 27+ size){
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
        var xPosition = gameWidth-110;
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
    ctx.strokeRect(xPosition,10,100,10);
    ctx.fillRect(xPosition,10,100* rate,10);
    ctx.strokeStyle = "#000000";
}

ship.prototype.drawHitbox = function(){
    
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
        default:
            this.weapon = "none";
    }
}

ship.prototype.drawCurrentWeapon = function(){
    if (this.whichPlayer == 1){
        var xPosition = 130;
    } else {
        var xPosition = gameWidth-160;
    }
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(xPosition,10,30,30);
    ctx.strokeStyle = "#000000";
    switch (this.weapon){
        case "Mine":
            ctx.drawImage(imageMine, xPosition, 10, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2, 23);
            break;
        case "Banana":
            ctx.drawImage(imageBanana, xPosition, 10, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2, 23);
            break;
        case "Gravity":
            ctx.drawImage(imageGravity, xPosition, 10, 30, 30);
            ctx.fillStyle = "red";
            ctx.font = "bolder 15px Arial Black";
            ctx.textAlign = "left";
            ctx.fillText(this.ammo, xPosition + 2, 23);
            break;
        case "Top":
            ctx.drawImage(imageTop, xPosition, 10, 30, 30);
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
}


missile.prototype = Object.create(flyingThing.prototype);
missile.prototype.constructor = missile;

missile.prototype.draw = function(){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI);
    if (this.firedBy ==1){
        ctx.fillStyle = "red";
    } else {
        ctx.fillStyle = "#00FF00";
    }
    ctx.fill();
    ctx.stroke();
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

function gameOver(){
    scene = "GameOver";
    drawBackground();
    drawEyes();
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
    weaponsCurrent = [];
    clearSpecialEffects();
    PlayerOne = new ship(new vec(150,300), 1, Math.PI, p1Keys);
    PlayerTwo = new ship(new vec(650,300), 2, 0, p2Keys);
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
    ctx.fillText(score[0], gameWidth/2-30, 25);
    ctx.fillStyle = "turquoise";
    ctx.fillText(score[1], gameWidth/2+30, 25);
    ctx.fillStyle = "white";
    ctx.fillText("-", gameWidth/2, 25);
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

function changeControls(whichPlayer, whichKey, buttonId){
    if (whichKeyIsChanging != null){
        showControlButtons();
    }
    document.getElementById(buttonId).innerHTML = "Choose key now";
    changingKey = true;
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
Add googly eyes to planet

Start menu

Am I sure about hitbox?

WEAPONS IDEAS:
Missile
Guided missile
Mine
Banana
Sudden repelling thing
Sudden attracting thing
Control jammer
Nitrous oxide
Increase gravity
Random ?!
Asteroid rain
Wormhole
Universe breaks and topology changes


Random gravity

Make box have attractive animation
Make box open




*/



