/* globals require, console*/

//export makeAGoodBrain;

/*jshint esversion: 6 */

var displayingGraphics;
if (typeof window === "undefined") {
    displayingGraphics = false;
} else {
    displayingGraphics = true;
}

if (!displayingGraphics) {
    var main = require("./Main.js");
    var network = require("./Network.js");
    var numberOfInputs = 6;
    var universeInfo = main.universeInfo;
    var gameStatus = main.gameStatus;
    var playerTypes = main.playerTypes;
}

//function synapse(toNeuron, w){
//    this.weight = w;
//    this.to = toNeuron;
//}

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
        console.log("Input size:");
        console.log(inputArray[this.sizes[0]].length);
        console.log("Expected size:");
        console.log(this.sizes[1]);
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




//var u = new main.universeInfo();
//var status = new main.gameStatus();
//var ship = main.ship;
//u.Player = new main.playerTypes(u);
//u.Player.One.takeStep(u, status);
//console.log(u.Player.One);


function playGame(brain1, brain2, options){
    options.onePlayer = options.onePlayer || false;
    var u = new universeInfo();
    u.explosionLength = 0;
    var status = new gameStatus();
    u.Player = new playerTypes(u);
    u.Player.One.whoPlaying = brain1;
    if (options.onePlayer){
        u.Player.Two.whoPlaying = undefined;
    } else {   
        u.Player.Two.whoPlaying = brain1;
    }
    u.Player.Two.whoPlaying = brain2;
    let angle = Math.random() * 0.01 - 0.005;
    u.flipAround();
    u.flipAround();
    u.flipAround();
    u.Player.One.vel = u.Player.One.vel.rot(angle);
    u.Player.Two.vel = u.Player.Two.vel.rot(angle);
    if (options.random !== undefined && options.random){
        u.Player.One.pos.x = -200 + Math.random() * 400;
        u.Player.One.pos.y = -150 + Math.random() * 300;
        u.Player.One.vel.x = -10 + Math.random() * 20;
        u.Player.One.pos.x = -10 + Math.random() * 20;
        u.Player.Two.pos.x = -200 + Math.random() * 400;
        u.Player.Two.pos.y = -150 + Math.random() * 300;
        u.Player.Two.vel.x = -10 + Math.random() * 20;
        u.Player.Two.pos.x = -10 + Math.random() * 20;
    }
    status.playing = true;
    status.winner = "none";
    status.onePlayer = options.onePlayer;
    status.stepCount = 0;
    while(status.playing && status.stepCount < 10000){
        gameStep(u,status);
        status.stepCount += 1;
    }
    if (status.onePlayer){
        return status.stepCount;
    } else {
        if (status.winner == "P1"){
            return 1;
        } else if (status.winner == "P2"){
            return -1;
        } else {
            return 0;
        }
    }
}

function gameStep(u, status){
    status.onePlayer = status.onePlayer || false;
    u.Player.One.makeDecision(u.Player.One.whoPlaying, status, u);
    u.Player.One.takeStep(u, status);
    if (!status.onePlayer) {
        u.Player.Two.makeDecision(u.Player.Two.whoPlaying, status, u);
        u.Player.Two.takeStep(u, status);
    }
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

function playTournament(A, gameNumber, options){//A is an array of networks, number of games Played
    var playerNumber = A.length;
    var results = [];
    options.onePlayer = options.onePlayer || false;
    if (options.onePlayer){
        var scores = [];
        for (var player = 0; player < playerNumber; player++){
            var currentScore = 0;
            for (var nthGame2 = 0; nthGame2 < gameNumber; nthGame2++){
                var gameResult2 = playGame(A[player], null, options);
                currentScore += gameResult2;
            }
            scores.push(currentScore);
        }
        return scores;
    } else {
        for (var row = 0; row < playerNumber; row++){
            results.push(Array(playerNumber).fill(0));
        }
        for (var homePlayer = 0; homePlayer < playerNumber; homePlayer++){
            for (var awayPlayer = 0; awayPlayer < playerNumber; awayPlayer++){
                if (homePlayer != awayPlayer){
                    for (var nthGame = 0; nthGame < gameNumber; nthGame++){
                        var gameResult = playGame(A[homePlayer], A[awayPlayer],{onePlayer:false});
                        results[homePlayer][awayPlayer] = results[homePlayer][awayPlayer] + gameResult;
                        results[awayPlayer][homePlayer] = results[awayPlayer][homePlayer] - gameResult;
                        gameResult = playGame(A[awayPlayer], A[homePlayer],{onePlayer:false});
                        results[homePlayer][awayPlayer] = results[homePlayer][awayPlayer] - gameResult;
                        results[awayPlayer][homePlayer] = results[awayPlayer][homePlayer] + gameResult;
                    }
                }
            }
            fs.appendFileSync('log.txt', 'Games between '+(homePlayer)+' and the rest concluded.\n', writingCallback);
        }
        var score = Array(playerNumber).fill(0);
        for (homePlayer = 0; homePlayer < playerNumber; homePlayer++){
            for (var awayPlayer2 = 0; awayPlayer2 < playerNumber; awayPlayer2++){
                    score[homePlayer] += results[homePlayer][awayPlayer2];
            }
        }
        return score;
    }
}

function improveSpecies(A, nGames, learningRate, options){
    var playerNumber = A.length;
    options.onePlayer = options.onePlayer || false;
    var score;
    if (options.onePlayer){
        score = playTournamentOnePlayer(A, nGames, options);
    } else {
        score = playTournament(A, nGames, options);
    }
    var winners = [];
    var topScore = 0;
    var secondBest = 0;
    var thirdBest = 0;
    for (var contestant = 0; contestant < playerNumber; contestant++){
        if(score[contestant] == topScore){
            winners.push(contestant);
        } else if (score[contestant] > topScore){
            winners =[contestant];
            thirdBest = secondBest;
            secondBest = topScore;
            topScore = score[contestant];
        } else if (score[contestant] > secondBest){
            thirdBest = secondBest;
            secondBest = score[contestant];
        } else if (score[contestant] > thirdBest){
            thirdBest = score[contestant];
        }
    }
    console.log("Winner is number "+winners+". Top score: "+(topScore / nGames).toFixed(1) +". Second: "+secondBest / nGames +". Third: " + thirdBest / nGames);
    var winnersNumber = winners.length;
    var B = [];
    if (winnersNumber == playerNumber){
        //console.log("All ties :(");
        for (var newNetwork = 0; newNetwork < playerNumber; newNetwork++){
            B.push(A[newNetwork].perturb(learningRate));
        }
    } else {
        if (winners.length != 1 || winners[0] !== 0){
            //console.log("Winners are: "+winners);
        }
        for (var newNetwork2 = 0; newNetwork2 < winnersNumber; newNetwork2++){
            B.push(A[winners[newNetwork2]]);
        }
        for (newNetwork2 = winnersNumber; newNetwork2 < playerNumber; newNetwork2++){
            //console.log(winners[newNetwork2 % winnersNumber]);
            var newNumber = Math.floor(Math.random() * winnersNumber);
            B.push(A[winners[newNumber]].perturb(learningRate));
        }
    }
    return B;
}

function improveSpeciesGenetic(A, nGames, learningRate, options){
    var playerNumber = A.length;
    options.onePlayer = options.onePlayer || false;
    var score;
    if (options.onePlayer){
        score = playTournamentOnePlayer(A, nGames, options);
    } else {
        score = playTournament(A, nGames, options);
    }
    var winners = Array(options.survivors).fill(-1);
    var smallestWinningScore = 0;
    var indices = [];
    for (var contestant = 0; contestant < playerNumber; contestant++){
        indices.push(contestant);
    }
    //console.log("Highest score: "+score[indices[0]]/ nGames);
    //console.log("Lowest surviving score: "+score[indices[options.survivors - 1]]/ nGames);
    console.log("Scores:");
    console.log(score);
//    console.log("Indices before sort:");
//    console.log(indices);
    indices.sort( (a,b) => (score[b] - score[a])|| (a-b)); //HOLY SHIT THE SORT ALGORITHM IS SUPER WEIRD AND IT WILL CHOOSE A STRANGE ORDERING IF THE COMPARISON GIVES 0
//    console.log("Indices after sort:");
//    console.log(indices);
    var B = [];
    for (contestant = 0; contestant < options.survivors; contestant++){
        B.push(A[indices[contestant]]);
        console.log((contestant + 1)+ordinalSuffix(contestant + 1) + " best score: "+(score[indices[contestant]] / nGames / playerNumber / 4).toFixed(2) + ". Number: "+(indices[contestant]+1));
    }for (contestant = 0; contestant < options.survivors; contestant++){
        console.log("Score of previous #"+(contestant + 1)+": "+(score[contestant] / nGames / playerNumber / 4).toFixed(2));
    }
    
    B.push(A[Math.floor(Math.random() * playerNumber)]); //Add one more randomly
    for (contestant = options.survivors + 1; contestant < playerNumber; contestant++){
        var oneParent = Math.floor(Math.random() * (options.survivors + 1));
        var otherParent = Math.floor(Math.random() * options.survivors);
        if (contestant > playerNumber * options.percentMutated && oneParent!== otherParent){
            B.push(makeAChild([B[oneParent], B[otherParent]], 0));
        } else {
            B.push(makeAChild([B[oneParent], B[otherParent]], learningRate));
        }
    }
    return B;
}
    
function ordinalSuffix(n){
    var suffix = "th";
    switch (n) {
        case 1: suffix = "st";
            break;
        case 2: suffix = "nd";
            break;
        case 3: suffix = "rd";
            break;
    }
    return suffix;
}


function makeAChild(n, mutationRate){//n is an array of networks
    var child = n[0].clone();
    var nParents = n.length;
    for(var layerCount in child.layers){
        var currentNeuronList = child.layers[layerCount].neuronList;
        for(var neuronCount in currentNeuronList){
            var currentInputList = currentNeuronList[neuronCount].inputs;
            for(var inputCount in currentInputList){
                var whichParent = Math.floor(Math.random() * nParents);
                currentInputList[inputCount] = n[whichParent].layers[layerCount].neuronList[neuronCount].inputs[inputCount] + (Math.random() * 2 - 1)* mutationRate;
            }
        }
    }
    return child;
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
function makeAGoodBrain(nPlayers, nGames, nIterations, learningRate, options){//options = {consoleInterval:interations, writeInterval:In minutes, seed:another array, survivors:number of survivors each generation, mutatedPercent:how many children get mutations, genetic: true or false, return:how many brains to return}
    var A = [];
    var newBrains = nPlayers;
    var date;
    if (options.seed !== null){
        A = options.seed;
        newBrains -= options.seed.length;
        for (let i = 0; i < newBrains; i++){
            A.push(makeAChild(options.seed, learningRate));
        }
    } else {
        for (let i = 0; i < newBrains; i++){
            A.push(new network([14,4,6,12,4], "random"));
        }
    }
    
    console.log("Number of contestants:");
    console.log(A.length);
    var then = Date.now();
    for (let i = 0; i < nIterations; i++){
        fs.writeFileSync('log.txt', 'Tournament number '+(i+1)+'.\n', writingCallback);
        options.genetic = options.genetic || false;
        if (!options.genetic){
            A = improveSpecies(A, nGames, learningRate, options);
        } else {
            A = improveSpeciesGenetic(A, nGames, learningRate, options);
        }
        var nowDate = Date.now();
        if (options.consoleInterval !== undefined){
                if (i % options.consoleInterval == options.consoleInterval - 1){
                    date = new Date();
                    date.setUTCHours(date.getUTCHours() - 5);
                    date = date.toISOString().
                      replace(/T/, ' ').      // replace T with a space
                      replace(/\..+/, '');
                    console.log(i+1+' tournaments so far!');
                    console.log("The time is "+date);
            }
        }
        if (options.writeInterval !== undefined){
            if (nowDate > then + options.writeInterval * 60000){
                then = Date.now();
                date = new Date();
                date.setUTCHours(date.getUTCHours() - 5);
                date = date.toISOString().
                  replace(/T/, ' ').      // replace T with a space
                  replace(/\..+/, '');
                fs.writeFileSync("./Brains/Brain"+date+".JSON", JSON.stringify(A.slice(0, options.return)), writingCallback);

            }
        }
    }
    options.return = options.return || 1;
    return A.splice(0, options.return);
}






//////// ONE PLAYER GAMES

function playGameOnePlayer(brainArray, angle){
    var nBrains = brainArray.length;
    var scores = [];
    for (var countBrain = 0; countBrain <  nBrains; countBrain++){
        fs.writeFileSync("./Brains/LastBrain.JSON", JSON.stringify(brainArray[countBrain]), writingCallback);
        var u = new universeInfo();
        //u.dt = 0.7; //Fast speed!!!
        u.explosionLength = 0;
        var status = new gameStatus();
        u.Player = new playerTypes(u);
        u.Player.One.whoPlaying = brainArray[countBrain];
        u.Player.One.vel = u.Player.One.vel.rot(angle);
        status.playing = true;
        status.winner = "none";
        status.onePlayer = true;
        status.stepCount = 0;
        var pos = [];
        while(status.playing && status.stepCount < 20000){
            gameStep(u,status);
            status.stepCount++;
        }
        //fs.writeFileSync("./Brains/Positions.JSON", JSON.stringify(pos), writingCallback);
        scores.push(status.stepCount);
    }
    return scores;
}

function playTournamentOnePlayer(A, gameNumber, options){//A is an array of networks, number of games Played
    var playerNumber = A.length;
    var scores = Array(playerNumber).fill(0);
    var angle = 0;
    for (var nthGame2 = 0; nthGame2 < gameNumber; nthGame2++){
        angle = Math.PI * 2 * (nthGame2 + Math.random())/ gameNumber;
        var gameResult = playGameOnePlayer(A, angle);
        for (var player = 0 ; player < playerNumber; player++){
            scores[player] += gameResult[player];
        }
        fs.appendFileSync('log.txt', 'Game number '+(nthGame2+1)+' concluded.\n', writingCallback);
        //console.log('Game number '+nthGame2+' concluded.');
    }
    return scores;
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


/////////////////


function writingCallback(err){
  if (err) console.log(err);
  console.log("Successfully written to file.");
}

const fs = require('fs');

function trainingSequence(){

    var B = importBrainArray("./Brains/StartingBrain.JSON");
    //console.log(B);
    //console.log(typeof B);
    //console.log(typeof B[0]);
    //var B = [startingBrain];
    //

    var A = makeAGoodBrain(30, 2, 100, 0.01, {consoleInterval:1,
                                                writeInterval:10,
                                                random:false,
                                                onePlayer:false,
                                                genetic:true,
                                                survivors: 5,
                                                mutatedPercent:0.5,
                                                seed:null,
                                                return:5});
    
//(nPlayers, nGames, nIterations, learningRate, options)options = {consoleInterval:interations, writeInterval:In minutes, seed:another array, survivors:number of survivors each generation, mutatedPercent:how many children get mutations, genetic: true or false, return:how many brains to return}


//Y calcular correlaciones de todos los pesos con la puntuación, y luego modificar la red acordemente?
    var date = new Date();
    date.setUTCHours(date.getUTCHours() - 5);
    date = date.toISOString().
      replace(/T/, ' ').      // replace T with a space
      replace(/\..+/, '');
    fs.writeFile("./Brains/FinalBrain"+date+".JSON", JSON.stringify(A), (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
}


trainingSequence();




function importBrain(path){
    let rawdata = fs.readFileSync(path);
    let B = JSON.parse(rawdata);
    Object.setPrototypeOf(B, network.prototype);
    //B.__proto__ = network.prototype;
    return B;
}

function importBrainArray(path){
    let rawdata = fs.readFileSync(path);
    let B = JSON.parse(rawdata);
    for (var i = 0; i < B.length; i++){
        Object.setPrototypeOf(B[i], network.prototype);
    }
    //B.__proto__ = network.prototype;
    return B;
}



//TESTING
//var A = new network([14,4,6,12,4], "random");
//var u = new universeInfo();
//u.Player = new playerTypes(u);
//var input = u.Player.One.observeBattle(u);
//console.log(input);
//var answers = A.activate(input);
//console.log(answers);






//function perturb(aNetwork){
//    var answer = aNetwork.clone();
//    for(var chooseNeuron in answer.neurons()){
//        console.log(answer);
//        console.log(chooseNeuron);
//        var thisNeuron = answer.neurons()[chooseNeuron].neuron;
//        for(var chooseConnection in thisNeuron.connections.inputs){
//            var thisWeight = thisNeuron.connections.inputs[chooseConnection].weight;
//            thisWeight = thisWeight + Math.random() * learningRate;
//        }
//    }
//    return answer;
//}

//
//const fs = require('fs');
//var synaptic = require('synaptic'); // this line is not needed in the browser
//var Neuron = synaptic.Neuron,
//	Layer = synaptic.Layer,
//	Network = synaptic.Network,
//	Trainer = synaptic.Trainer,
//	Architect = synaptic.Architect;
//
//var brain1 = createNetwork();
//var brain2 = createNetwork();
//
////console.log(playGame(brain1, brain2));
//
//var brain3 = perturb(brain1);
//console.log(brain1.activate([0.2,0.5,0.2,0.12,0.2,0.2]));
////console.log(brain2.activate([0.2,0.2,0.2,0.2,0.2,0.2]));
//console.log(brain3.activate([0.2,0.5,0.2,0.12,0.2,0.2]));

            
            
            
//var a = new network([3,5,3], "random");
//
//var n = a.layers[1].neuronList[1];
//
//var b = a.perturb(0.1);
//
//console.log(b);
//
//console.log(a.layers[1].neuronList[1].inputs);
//console.log(b.layers[1].neuronList[1].inputs);

//for (var i in a.layers[2].neuronList[1].inputs){
//    console.log("Key: "+i);
//    console.log("Weight: "+a.layers[2].neuronList[1].inputs[i]);
//}
            
///////////////////////////            
            
            
            
//var inputLayer = new Layer(4);
//var hiddenLayer = new Layer(6);
//var outputLayer = new Layer(2);
//
//inputLayer.project(hiddenLayer);
//hiddenLayer.project(outputLayer);
//
//var myNetwork = new Network({
//	input: inputLayer,
//	hidden: [hiddenLayer],
//	output: outputLayer
//});

//var standalone = myNetwork.standalone();
//
//var text = "thinking = " + standalone.toString() + "\nexport thinking;\n";
//
//fs.writeFile('Network.js', text, (err) => { 
//      
//    // In case of a error throw err. 
//    if (err) throw err; 
//}) 
