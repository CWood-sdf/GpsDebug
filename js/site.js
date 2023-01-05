
p5.Vector.prototype.angleTo = function (v) {
    var newV = v.copy();
    newV.sub(this);
    return newV.heading();
}

var width, height, p, maxWidth;

var gpsX, gpsY, angle, main;
let fileHandle;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 1 / DEG_TO_RAD;
const getFile = async () => {
    // Destructure the one-element array.
    [fileHandle] = await window.showOpenFilePicker();
    // Do something with the file handle.
    const file = await fileHandle.getFile();
    const contents = await file.text();
    $("body").append(`<script>${contents} window.alert("Upload Succeeded");<\/script>`);
};

var newY = o => o.y + o.height + 5;
var run, upload, pause, play, updateFrameRate, save;
var frameRate = 60;
var frameRateRatioIndex = 0;
var frameRateRatios = [1, 2, 0.5, 0.25];
var frameRateSetter = {
    push: (v) => {
        frameRate = v;
        p.frameRate(frameRate * frameRateRatios[frameRateRatioIndex]);
    }
};
var initVars = function() {
    
    width = p.width / 100;
    height = p.height / 100;
    maxWidth = p.width / height;
    initVars = () => { };
    var mw = 100;
    gpsX = new Graph(100, 5, mw, 30, p.color(0, 255, 255), "X", [16, -1], 6);
    var y = newY(gpsX);
    gpsY = new Graph(100, y, mw, 30, p.color(0, 255, 255), "Y", [16, -1], 6);
    var y = newY(gpsY) - 3;
    run = new Button(153, y, 10, 5, p.color(0, 0, 0, 0), p.color(0, 255, 0), p.color(0, 235, 0), p.color(0, 200, 0), "Run", 5, 3);
    upload = new Button(177, y, 10, 5, p.color(0, 0, 0, 0), p.color(200), p.color(180), p.color(160), "Upload", 5, 3);
    pause = new Button(165, y, 10, 5, p.color(0, 0, 0, 0), p.color(200, 0, 0), p.color(180, 0, 0), p.color(160, 0, 0), "Pause", 5, 3);
    play = new Button(189, y, 10, 5, p.color(0, 0, 0, 0), p.color(0, 255, 0), p.color(0, 235, 0), p.color(0, 200, 0), "Play", 5, 3);
    updateFrameRate = new Button(153, y + 5.5, 13, 5, p.color(0, 0, 0, 0), p.color(200), p.color(180), p.color(160), "Speed: " + limDecimal(frameRateRatios[frameRateRatioIndex], 2) + "x", 6.5, 3);
    save = new Button(168, y + 5.5, 10, 5, p.color(0, 0, 0, 0), p.color(200), p.color(180), p.color(160), "Save", 5, 3);
}
function limDecimal(num, to = 2) {
    var str = `${num}`;
    var ret = '';
    var count = 0;
    var willCount = false;
    for (var i of str) {
        ret += i;
        if (willCount) {
            count++;
            if (count >= to) {
                break;
            }
        }
        if (i == '.') {
            willCount = true;
        }

    }
    return ret;
}
var isWebsocketMode = false;
var websocket = null;
var bankOff = 120;
var objectDefines = {

};

let activeDataRecieve = false;
let dataRecieveTime = 0;
var lastRecord = "";
const websocketParseMessage = function (data) {
    if (data[0] === "$") {
        activeDataRecieve = true;
        dataRecieveTime = Date.now();
        var vals = data.substr(1).split(",");
        for (var i = 0; i < vals.length; i++) {
            var command = vals[i].replaceAll(" ", "");
            if (command === "clear") {
                main.data = [];
                gpsX.data = [];
                gpsY.data = [];
                main.auxiliaryData.angle = [];
            }
            else if (command === "fit") {
                main.customizeRange();
                gpsX.customizeRange();
                gpsY.customizeRange();
            }
            else if (command.split("@")[0] === "limit") {
                var limit = parseFloat(command.split("@")[1]);
                if (isNaN(limit)) {
                    console.log("invalid data, need format: 'limit'@limit, given data: " + vals[i]);
                    continue;
                }
                // remove data from main.data until it's length is less than limit
                while (main.data.length > limit) {
                    main.data.shift();
                    gpsX.data.shift();
                    gpsY.data.shift();
                    main.auxiliaryData.angle.shift();
                }
            }
            else {
                var pos = vals[i].split("@");
                if (pos.length !== 3) {
                    console.log("invalid data, need format: x@y@angle, given data: " + vals[i]);
                    continue;
                }
                var x = parseFloat(pos[0]);
                var y = parseFloat(pos[1]);
                var angle = parseFloat(pos[2]);
                if (isNaN(x) || isNaN(y) || isNaN(angle)) {
                    console.log("invalid data (at least one value is NaN), need format: x@y@angle, given data: " + vals[i]);
                    continue;
                }
                gpsX.data.push(x);
                gpsY.data.push(y);
                main.auxiliaryData.angle.push(angle);
                main.data.push(new p5.Vector(x, y));
            }
        }
    }
};
const websocketOnMessage = async function (event) {
    var thing = await event.data.stream().getReader().read();
    var string = String.fromCharCode.apply(null, thing.value);
    var data = (lastRecord + string).split("\n");
    if (typeof string === 'string' && !string.endsWith("\n")) {
        lastRecord = data.at(-1);
        data.pop();
    } else {
        lastRecord = "";
    }
    for(var i = 0; i < data.length; i++) {
        websocketParseMessage(data[i]);
    }
};
var getSaveArrayVector = function (name, data) {
    var ret = "";
    ret += `${name} = [\n`;
    var i = 1;
    for (var v of data) {
        ret += `p.createVector(${v.x}, ${v.y}),`;
        //Every three iterations, add a new line
        if (i % 3 === 0) {
            ret += "\n";
        }
        i++;
    }
    ret += "];\n";
    return ret;
};
var getSaveArray = function (name, data) {
    var ret = "";
    ret += `${name} = [\n`;
    var i = 1;
    for (var v of data) {
        ret += `${v},`;
        //Every three iterations, add a new line
        if (i % 3 === 0) {
            ret += "\n";
        }
        i++;
    }
    ret += "];\n";
    return ret;
};
var saveAs = function (blob, name) {
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
};
var saveData = function () {
    var data = "";
    data += `frameRate = ${frameRate}; \np.frameRate(frameRate * frameRateRatios[frameRateRatioIndex]);\n`;
    data += getSaveArrayVector("main.data", main.data);
    data += getSaveArray("outputVel.data", outputVel.data);
    data += getSaveArray("encVel.data", encVel.data);
    data += getSaveArray("targetVel.data", targetVel.data);
    data += getSaveArray("slaveP.data", slaveP.data);
    data += getSaveArray("slaveD.data", slaveD.data);
    data += getSaveArray("ctrlP.data", ctrlP.data);
    data += getSaveArray("ctrlD.data", ctrlD.data);
    data += getSaveArrayVector("main.auxiliaryData.pos", main.auxiliaryData.pos);
    data += getSaveArray("main.auxiliaryData.angle", main.auxiliaryData.angle);
    data += getSaveArrayVector("main.auxiliaryData.pursuit", main.auxiliaryData.pursuit);
    data += "main.customizeRange();\n";
    data += "outputVel.customizeRange();\n";
    data += "encVel.customizeRange();\n";
    data += "targetVel.customizeRange();\n";
    data += "slaveP.customizeRange();\n";
    data += "slaveD.customizeRange();\n";
    data += "ctrlP.customizeRange();\n";
    data += "ctrlD.customizeRange();\n";
    //Save data to a file
    var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `data-${Date.now()}.js`);
};
const s = async pi => {
    p = pi;
    var isDone = false;
    pi.setup = function () {
        isDone = true;
        pi.createCanvas(p.windowWidth, p.windowHeight - 0);
        initVars();

        p.frameRate(200);
        isWebsocketMode = window.confirm("Is this using a websocket?");
        if (isWebsocketMode) {
            //Get the port number
            var port = window.prompt("Enter the port number");
            websocket = new WebSocket(`ws://localhost:${port}/vexcode/device`);
            websocket.onopen = function (event) {
                console.log("Connection Opened");
                window.alert("Websocket connection opened!");
                websocket.send("Connection open!");
            }
            websocket.onmessage = websocketOnMessage;
        }


    };
    
    main = new Graph2D(5, 5, 90, 90, [20, -20], [20, -20], p.color(255, 25, 0));
    
    
    var speed = new Slide(165, 60, 35, 5, 200, p.color(0), p.color(255, 0, 0), p.color(200));
    main.xRange = [72, -72];
    main.yRange = [72, -72];
    main.setHighlight(0);
    main.addFn(function (toX, toY, t, h) {
        //console.log(t.ah().pos);
        var pos = t.getHighlight() ?? p.createVector(0, 0);
        var angle = (t.ah().angle ?? 10) * DEG_TO_RAD;
        var globalPos = p.createVector(toX(pos.x), toY(pos.y));
        var tx = 2;
        var ty = -2;
        var ntx = -2;
        var nty = 2;
        var uleft = p.createVector(ntx, ty);
        var uright = p.createVector(tx, ty);
        var bleft = p.createVector(ntx, nty);
        var bright = p.createVector(tx, nty);
        uleft.rotate(angle);
        uright.rotate(angle);
        bleft.rotate(angle);
        bright.rotate(angle);
        uleft.add(globalPos);
        uright.add(globalPos);
        bleft.add(globalPos);
        bright.add(globalPos);
        p.stroke(0);
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();
        p.vertex(uleft.x * height, uleft.y * height);
        p.vertex(uright.x * height, uright.y * height);
        p.vertex(bright.x * height, bright.y * height);
        p.vertex(bleft.x * height, bleft.y * height);
        p.vertex(uleft.x * height, uleft.y * height);
        p.endShape();
        p.stroke(255, 0, 0);
        p.beginShape();
        p.vertex(uleft.x * height, uleft.y * height);
        p.vertex(uright.x * height, uright.y * height);
        p.endShape();

    });
    main.inputData([p.createVector(0, 0)]);
    main.auxiliaryData = {
        "angle": []
    }
    var running = false;
    pi.draw = function () {
        p.textFont("Comic Sans MS");

        p.background(100);
        main.draw();
        gpsX.draw();
        gpsY.draw();
        p.textSize(2 * height);
        run.handlePress();
        run.draw();
        if (run.isDone()) {
            running = true;
            gpsX.setHighlight(0);
            gpsY.setHighlight(0);
            main.resetI();
            main.setHighlight(0);
        }
        upload.handlePress();
        upload.draw();
        if (upload.isDone()) {
            getFile();
            running = true;
            gpsX.setHighlight(0);
            gpsY.setHighlight(0);
            main.resetI();
        }
        pause.handlePress();
        pause.draw();
        if (pause.isDone()) {
            running = false;
        }
        play.handlePress();
        play.draw();
        if (play.isDone()) {
            running = true;
        }
        if (activeDataRecieve && (dataRecieveTime + 1000) < Date.now()) {
            activeDataRecieve = false;
        }
        if (running) {
            if (isWebsocketMode && activeDataRecieve) {
                main.moveHighlightEnd();
                main.moveIEnd();
                gpsX.moveHighlightEnd();
                gpsY.moveHighlightEnd();
            } else {
                main.incHighlight();
                main.incI();
                gpsX.incHighlight();
                gpsY.incHighlight();
            }
        }
        updateFrameRate.handlePress();
        updateFrameRate.draw();
        if (updateFrameRate.isDone()) {
            // debugger;
            frameRateRatioIndex = (frameRateRatioIndex + 1) % frameRateRatios.length;
            p.frameRate(frameRate * frameRateRatios[frameRateRatioIndex]);
            updateFrameRate.msg = "Speed: " + limDecimal(frameRateRatios[frameRateRatioIndex]) + "x";
        }
        if (isWebsocketMode) {
            //Draw the save button
            save.handlePress();
            save.draw();
            if (save.isDone()) {
                saveData();
            }
        }
    };
    pi.mouseDragged = function () {
        
    }
    
};
