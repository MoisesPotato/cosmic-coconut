var gameWidth = 800;
var gameHeight = 600;
var bgColor = "#000000";
var starColor = "#FFFFFF";
var earthColor = "blue";
var G = 20000;
var dt = 0.5; //Changing this is a mess. Most of the speed is measured in framses anyway
var rotationSpeed = 0.2;
var earthRadius = 75;
var mode = "Torus";
var then;
var PlayerOne;
var scene = "start";
var missiles = [];
var projectileSpeed = 20;
var explosionLength = 15;
var overheatTemp = 20;
var missileCooldown = 5;
var enginesPower = 1;
var engineCoolingRate = 0.5;
var engineHeatingRate = 1;



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
var wKey = 87;

var p1Keys = new keySet(leftKey, rightKey, upKey, rShift);
var p2Keys = new keySet(aKey, dKey, wKey, spaceBar);


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
        }
    }
}

function keySet(moveLeft, moveRight, thrust, fire){
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.thrust = thrust;
    this.fire = fire;
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
    ctx.beginPath();
    ctx.arc(O.x, O.y, earthRadius, 0, 2 * Math.PI); //draw Earth
    ctx.fillStyle = earthColor;
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


////////////////// THE OBJECT FOR FLYING STUFFS ///////////////

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

////////////////// THE OBJECT FOR SHIPS ///////////////


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
    this.whichPlayer = whichPlayer;
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
    if(keysList[this.keyScheme.fire] && this.coolDownTimer == 0){
        var outSpeed = new vec(0, -projectileSpeed);
        outSpeed = outSpeed.rot(this.facing);
        outSpeed = outSpeed.plus(this.vel);
        missiles.push(new missile(this.pos, outSpeed));
        this.coolDownTimer = missileCooldown;
    } else {
        this.coolDownTimer = Math.max(0, this.coolDownTimer - 1);
    }  
}

ship.prototype.hitByMissile = function(){
    for (j = 0; j < missiles.length; j++){
        if(missiles[j].living == 20){
            var dist = this.pos.plus(missiles[j].pos.op());
            dist = dist.Vlength();
            if (dist < 27){
                var relPos = missiles[j].pos.plus(this.pos.op());
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
                }
            }
        }
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

////////////////// THE OBJECT FOR MISSILES ///////////////


function missile(pos, vel){
    flyingThing.call(this, pos, vel);
    this.crashed = false;
    this.living = 0;
}


missile.prototype = Object.create(flyingThing.prototype);
missile.prototype.constructor = missile;

missile.prototype.draw = function(){
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();
}

missile.prototype.takeStep = function(){
    this.freeFall();
    if (this.checkCollision()){
        this.crashed = true;
    }
    this.leaveScreen();
    if (this.living < 20){
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
    drawBackground();
    ctx.font = "20px Arial Black";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("You crashed and the game isn't even made yet", gameWidth/2, gameHeight/2); 
    ctx.fillText("Press R to restart", gameWidth/2, gameHeight*3/4); 
    ScreenOfRestarting();
};

function playAnim(){
    var currTime = Date.now();
    if (currTime - then > 40 && playing){        
        then = Date.now();
        drawBackground();
        PlayerOne.takeStep();
        PlayerTwo.takeStep();
        PlayerOne.draw();
        PlayerTwo.draw();
        if (PlayerOne.crashed || PlayerTwo.crashed){
            playing = false;
        }
        PlayerOne.fireMissile();
        PlayerTwo.fireMissile();
        for (var m = 0; m < missiles.length; m++){
            missiles[m].takeStep();
            missiles[m].draw();
            if (missiles[m].crashed){
                missiles.splice(m, 1);
            }
        }
        window.requestAnimationFrame(playAnim);
    } else { 
        window.requestAnimationFrame(playAnim);
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
    PlayerOne = new ship(new vec(150,300), 1, 0, p1Keys);
    PlayerTwo = new ship(new vec(650,300), 2, Math.PI, p2Keys);
    PlayerOne.setAngularSpeed();
    PlayerTwo.setAngularSpeed();
    playing = true;
    then = Date.now();
    scene = "start";
    playAnim();
};

startTheGame();

/*
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

Ship overheats

Random gravity





*/



