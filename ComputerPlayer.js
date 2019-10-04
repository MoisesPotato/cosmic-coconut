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
    while(status.playing){
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
                        var gameResult = playGame(A[homePlayer], A[awayPlayer]);
                        results[homePlayer][awayPlayer] = results[homePlayer][awayPlayer] + gameResult;
                        results[awayPlayer][homePlayer] = results[awayPlayer][homePlayer] - gameResult;
                        gameResult = playGame(A[awayPlayer], A[homePlayer]);
                        results[homePlayer][awayPlayer] = results[homePlayer][awayPlayer] - gameResult;
                        results[awayPlayer][homePlayer] = results[awayPlayer][homePlayer] + gameResult;
                    }
                }
            }
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
    console.log("Winner is number "+winners+". Top score: "+topScore / nGames +". Second: "+secondBest / nGames +". Third: " + thirdBest / nGames);
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
function makeAGoodBrain(nPlayers, nGames, nIterations, learningRate, options){//options = {consoleInterval:interations, writeInterval:In minutes, seed:another array}
    var A = [];
    var newBrains = nPlayers;
    if (options.seed !== undefined){
        A = options.seed;
        newBrains -= options.seed.length;
    }
    for (var i = 0; i < newBrains; i++){
        A.push(new network([7,9,4],"random"));
    }
    var then = Date.now();
    for (i = 0; i < nIterations; i++){
        A = improveSpecies(A, nGames, learningRate, options);
        var nowDate = Date.now();
        if (options.consoleInterval !== undefined){
                if (i % options.consoleInterval == options.consoleInterval - 1){
                console.log(i+1+' tournaments so far!');
            }
        }
        if (options.writeInterval !== undefined){
            if (nowDate > then + options.writeInterval * 60000){
                then = Date.now();
                var date = new Date();
                date.setUTCHours(date.getUTCHours() - 5);
                date = date.toISOString().
                  replace(/T/, ' ').      // replace T with a space
                  replace(/\..+/, '');
                fs.writeFileSync("./Brains/Brain"+date+".JSON", JSON.stringify(A[0]), writingCallback);

            }
        }
    }
    return A[0];
}






//////// ONE PLAYER GAMES

function playGameOnePlayer(brainArray, angle){
    var nBrains = brainArray.length;
    var scores = [];
    for (var countBrain = 0; countBrain <  nBrains; countBrain++){
        fs.writeFileSync("./Brains/LastBrain.JSON", JSON.stringify(brainArray[countBrain]), writingCallback);
        var u = new universeInfo();
        u.explosionLength = 0;
        var status = new gameStatus();
        u.Player = new playerTypes(u);
        u.Player.One.whoPlaying = brainArray[countBrain];
        u.Player.One.vel = u.Player.One.vel.rot(angle);
        status.playing = true;
        status.winner = "none";
        status.onePlayer = true;
        status.stepCount = 0;
        while(status.playing){
            gameStep(u,status);
            status.stepCount += 1;
        }
        scores.push(status.stepCount);
    }
    return scores;
}

function playTournamentOnePlayer(A, gameNumber, options){//A is an array of networks, number of games Played
    var playerNumber = A.length;
    var scores = Array(playerNumber).fill(0);
    var angle = 0;
    for (var nthGame2 = 0; nthGame2 < gameNumber; nthGame2++){
        var gameResult = playGameOnePlayer(A, angle);
        for (var player = 0 ; player < playerNumber; player++){
            scores[player] += gameResult[player];
        }
        angle += Math.PI * 2/gameNumber;
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

var startingBrain = importBrain("./Brains/FinalBrain10-3.JSON");
var A = makeAGoodBrain(100, 20, 100, 0.1, {consoleInterval:10, writeInterval:5, random:true, onePlayer:true, seed:[startingBrain]});
//console.log("First tournament done.");
//A = makeAGoodBrain(100, 5, 10, 0.1, {consoleInterval:50, writeInterval:10, random:true, onePlayer:true, seed:[A]});
//console.log("Second tournament done.");
//A = makeAGoodBrain(100, 5, 10, 0.1, {consoleInterval:50, writeInterval:10, random:true, onePlayer:true, seed:[A]});
//A = makeAGoodBrain(10, 50, 10, 0.1, {consoleInterval:50, writeInterval:10, random:true, onePlayer:true, seed:[A]});
//console.log("First tournament done. Now for the pairs");
//A = makeAGoodBrain(5, 20, 1000, 0.1, {consoleInterval:50, writeInterval:10, random:true, onePlayer:true, seed:[A, A]});//function makeAGoodBrain(nPlayers, nGames, nIterations, learningRate, options){//options = {consoleInterval:interations, writeInterval:In minutes}



var date = new Date();
date.setUTCHours(date.getUTCHours() - 5);
date = date.toISOString().
  replace(/T/, ' ').      // replace T with a space
  replace(/\..+/, '');
fs.writeFile("./Brains/FinalBrain"+date+".JSON", JSON.stringify(A), (err) => {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
});


function importBrain(path){
    let rawdata = fs.readFileSync(path);
    let B = JSON.parse(rawdata);
    Object.setPrototypeOf(B, network.prototype);
    //B.__proto__ = network.prototype;
    return B;
}
//console.log(B.constructor.toString());
////B.constructor.call(B);
//console.log(B.activate([1,2,3,4,5,.6,.7]));
//console.log(playGame(B,B));
//console.log(B);
//console.log(JSON.parse(B));











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
