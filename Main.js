var gameWidth = 800;    //Width of game zone in pixels
var gameHeight = 600;   //Height of game zone in pixels
var bgColor = "#000000";  //Color of the sky backdrop
var starColor = "#FFFFFF";  //Color of the background stars
var earthColor = "blue";   //Color of the planet in the middle
var G = 20000;             //strength of gravity
var dt = 0.5;               //Changing this is a mess. Most of the speed is measured in framses anyway
var rotationSpeed = 0.2;    //Speed at which ships rotate when you press keys
var earthRadius = 75;       //Size of planet inside
var mode = "Torus";         //Universe is a torus. Only mode for now
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
var weaponTypes = ["Mine"];       //All the possible weapons
var floatingBox = new presentBox(null);//The one possible weapon box
var paused = false;
var weaponsCurrent = [];    //Array that keeps track of weapons currently flying around


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

var p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
var p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);


var keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
window.onkeyup = function(e) {keysList[e.keyCode]=false;
                             }
window.onkeydown = function(e) {keysList[e.keyCode]=true;
                                //console.log(e.keyCode);
                               if (e.keyCode == leftKey || e.keyCode == rightKey || e.keyCode == upKey || e.keyCode == downKey){e.preventDefault();}}

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
        }
    }
    if (scene =="start"){
        if (keysList[pKey] && !paused){
            pause();
        } else if (keysList[pKey] && paused){
            unPause();
        }
    }
}

function keySet(moveLeft, moveRight, thrust, fire, special){
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.thrust = thrust;
    this.fire = fire;
    this.special = special;
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


 flyingThing.prototype.gPull = function(){ //Computes the gravitational pull from the middle
    if (this.pos.x === 0 && this.pos.y === 0){
        var Pull = new vec(0, 0);
        return Pull;
    } else {
        var Pull = this.pos.op().plus(O);
        Pull = Pull.times(G * Math.pow(Pull.Vlength(), -3));
        return Pull;
    }
};

flyingThing.prototype.freeFall = function(){
    this.vel = this.vel.plus(this.gPull().times(dt));
    this.pos = this.pos.plus(this.vel.times(dt));
    this.pos = this.pos.plus(this.gPull().times(dt*dt/2));
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
}

weapon.prototype = Object.create(flyingThing.prototype);
weapon.prototype.constructor = weapon;

weapon.prototype.draw = function(){
    switch (this.type){
                case "Mine":
                    this.facing += 0.03;
                    placeRotated(imageMine, this.pos, this.facing, 26, 26, 13, 13);
                    break;
                default:
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
                    } else {
                        if (PlayerOne.easyCollide(W.pos, 10)){
                            PlayerOne.orbiting = false;
                            PlayerOne.engineTemp += overheatTemp/2;
                            PlayerOne.vel = PlayerOne.vel.times(0.2);
                            weaponsCurrent.splice(w, 1);
                            w--;
                        } else if (PlayerTwo.easyCollide(W.pos, 10)){
                            PlayerTwo.orbiting = false;
                            PlayerTwo.engineTemp += overheatTemp/2;
                            PlayerTwo.vel = PlayerTwo.vel.times(0.2);
                            weaponsCurrent.splice(w, 1);
                            w--;
                        }
                    }
                    break;
                default:
                    break;
            }
        W.draw();
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
    var num = weaponTypes.length;
    return weaponTypes[Math.floor(Math.random()*num)];
}


////////////////////// CLASS FOR PRESENT BOXES ////////////
function presentBox(pos){
    flyingThing.call(this, pos, null);
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
}


ship.prototype = Object.create(flyingThing.prototype);
ship.prototype.constructor = ship;

ship.prototype.setAngularSpeed = function(){
    this.angularspeed = Math.sqrt((this.gPull().Vlength())/(canToEarth(this.pos).Vlength()));
    this.vel = canToEarth(this.pos).rot(Math.PI/2).times(this.angularspeed);
}

ship.prototype.takeStep = function(){
    if (!this.exploding){
        this.hitByMissile();
        if (!this.orbiting || keysList[this.keyScheme.thrust]){
            this.orbiting = false;
            if (keysList[this.keyScheme.thrust] && !this.overheat){
                this.engineTemp += engineCoolingRate + engineHeatingRate;
                this.vel = this.vel.plus(this.enginePower.rot(this.facing).times(dt));
            }
            this.freeFall();
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
        if (keysList[this.keyScheme.special]){
            this.fireWeapon();
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
            this.weapon = "none";
            break;
        default:
            this.weapon = "none";
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
    starDisplay = [];
    getBackground(100);
    drawBackground();
    missiles = [];
    weaponsCurrent = [];
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
    ctx.font = "40px Bungee Shade";
    ctx.fillText("Press S to start", gameWidth/2, 3* gameHeight/4);
    //ctx.font = "20px Bungee Shade";
    //ctx.fillText("In nomin: Eva", gameWidth/2, 3* gameHeight/4+40);
}

function pause(){
    paused = true;
    ctx.fillStyle = "red";
    ctx.font = "90px Monoton";
    ctx.fillText("PAUSED", gameWidth/2, gameHeight/2);
}

function unPause(){
    paused = false;
    playAnim();
}

function finishLoading(){
    document.getElementById("LoadingMessage").style.display = "none";
    area.style.display = "inline";
    showMenu();
}

window.onload = finishLoading();


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
Universe breaks and topolog changes


Random gravity

Make box have attractive animation
Make box open




*/



