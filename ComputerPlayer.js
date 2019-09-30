/* global require, console, universeInfo*/

var displayingGraphics;
if (typeof window === "undefined"){
    displayingGraphics = false;
} else {
    displayingGraphics = true;
}

if (!displayingGraphics){
    var main = require("./Main.js");
    var network = require("./Network.js");
    var numberOfInputs = 6;
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
                currentInputList[inputCount] = currentInputList[inputCount] + Math.random() * rate;
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
    var u = new main.universeInfo();
    var status = new main.gameStatus();
    u.Player = new main.playerTypes(u);
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

function createNetwork(){
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
}

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
var A = [];
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


var nPlayers = 3;
for (var i = 0; i < nPlayers; i++){
    A.push(new network([6,8,4],"random"));
}
A = improveSpecies(A, 3, 0.1);
console.log("Round 1 done.");
A = improveSpecies(A, 3, 0.1);
console.log("Round 2 done.");
A = improveSpecies(A, 3, 0.1);
console.log("Round 3 done.");
A = improveSpecies(A, 3, 0.1);
console.log("Round 4 done.");
A = improveSpecies(A, 3, 0.1);
console.log(playTournament(A, 5));

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
