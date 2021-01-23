// drawingfunctions.js
// This is a module to handle graphing functions. Functions queried here will typically return
// something to handle in main. 

// Imports
const { CanvasRenderingContext2D, createCanvas } = require('canvas');
const fs = require('fs');
const moment = require('moment');

// Variables
var squaresize = 100;
var bordersize = 50;
var graphwidth = 600;
var graphwidthborder = 50;
var graphheight = 300;
var graphheightborder = 50;
var bottomgrains = 24

// Self Functions
function isOdd(n) {
   return n % 2 != 0;
}

// Find the highest value in an array and set it to 100, with every other value a percentage of that. 
function percentifyArray(arr) {
    var arrmax = 0;
    arr.forEach((element) => {
        if (parseInt(element) > arrmax) { arrmax = parseInt(element) }
    })
    console.log(`Arrmax ${arrmax}`);
    var newarray = [];
    arr.forEach((element) => {
        newarray.push(Math.floor(parseInt(element)/arrmax*100))
    })
    return newarray;
}

// Exports
// Creates a graph of message rate over time. 
export function createActivityGraph(array,name) {
    return new Promise((resolve,reject) => {
        var testarray = array;
        var startingtimestamp = testarray[0];
        testarray.splice(0,1);
        testarray = percentifyArray(testarray);

        var dimensionsw = graphwidth;
        var dimensionsh = graphheight;
        var canvas = createCanvas(dimensionsw, dimensionsh); // Each square is 8x8 + border
        var ctx = canvas.getContext('2d');
        //global.CanvasRenderingContext2D = {};
        //global.CanvasRenderingContext2D.prototype = ctx;
        
        // Draw Background
        ctx.rect(0,0,dimensionsw,dimensionsh);
        ctx.fillStyle = "#36393f";
        ctx.fill();
        
        // Draw Title letters
        ctx.font = "28px Sans";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Message Rate Over Time - ${name}`, graphwidth/2, graphheightborder/2);
    
        // Draw Y axis Metrics - These never change for activity
        ctx.font = "14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        var yaxismove = (graphheight - (graphheightborder*2))/10
        ctx.fillText("100%", graphwidthborder/2, graphheightborder*1.1);
        ctx.fillText("90%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*1));
        ctx.fillText("80%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*2));
        ctx.fillText("70%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*3));
        ctx.fillText("60%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*4));
        ctx.fillText("50%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*5));
        ctx.fillText("40%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*6));
        ctx.fillText("30%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*7));
        ctx.fillText("20%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*8));
        ctx.fillText("10%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*9));
        ctx.fillText("0%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*10));
        
        // Draw midlines. 
        var i;
        for (i = 0; 10 > i; i++) {
            ctx.beginPath()
            ctx.strokeStyle = "#5b666c"
            ctx.moveTo(graphwidthborder,graphheightborder*1+(yaxismove*i));
            ctx.lineTo(graphwidth-graphwidthborder,graphheightborder*1+(yaxismove*i));
            ctx.stroke();
        }

        // Draw Line Grid
        ctx.beginPath() // Left Border
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,graphheightborder*1);
        ctx.lineTo(graphwidthborder,graphheight-graphheightborder);
        ctx.stroke();
        
        ctx.beginPath() // Bottom Border
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,graphheight-graphheightborder);
        ctx.lineTo(graphwidth-graphwidthborder,graphheight-graphheightborder);
        ctx.stroke();
    
        // Draw our line with datapoints
        var topborder = graphheightborder*1
        var heightspace = (graphheight)-(graphheightborder*2);
        var widthspace = (graphwidth)-(graphwidthborder*2);
        var pointdelta = (graphwidth-(graphwidthborder*2))/(testarray.length-1); // This is the distance between each point horizontally we should move
        ctx.beginPath()
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,(topborder+heightspace)-(heightspace*(testarray[0]/100)));
        for (i = 1; testarray.length > i; i++) {
            ctx.lineTo(graphwidthborder+(i*pointdelta),(topborder+heightspace)-(heightspace*(testarray[i]/100)));
        }
        ctx.stroke();

        // Draw our line points. 
        var i = 0;
        var graindelta = widthspace / bottomgrains;
        for (i = 0; (bottomgrains+1) > i; i++) {
            var linestroke = 5;
            if ((i == 0)||(i == 6)||(i == 12)||(i == 18)||(i == 24)) { linestroke = 15 }
            ctx.beginPath()
            ctx.strokeStyle = "white";
            ctx.moveTo((graphwidthborder+(graindelta * i)),graphheight-graphheightborder);
            ctx.lineTo((graphwidthborder+(graindelta * i)),(graphheight-graphheightborder)+linestroke)
            ctx.stroke();
        }

        // Draw the date points.
        var nowtimestamp = moment().valueOf();
        var timedelta = (nowtimestamp - startingtimestamp);
        for (i = 0; i < 5; i++) {
            ctx.fillText(`${moment((startingtimestamp)+(timedelta*(i/4))).format("MMM YYYY")}`, (graphwidthborder+((i*6)*graindelta)), graphheight-(graphheightborder*0.3));
        }

        
        var canv = canvas.toDataURL();
        var datastring = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(datastring, 'base64');
        fs.writeFile('boardTest.jpg', buffer, (err) => {
            if (err) { console.log(err) }
        });
        resolve(buffer);
    })
}

// 
export function createActivityGraphHourly(array,name) {
    return new Promise((resolve,reject) => {
        var testarray = array;
        testarray.splice(0,1);
        testarray = percentifyArray(testarray);
        testarray.push(testarray[0]);

        var dimensionsw = graphwidth;
        var dimensionsh = graphheight;
        var canvas = createCanvas(dimensionsw, dimensionsh);
        var ctx = canvas.getContext('2d');
        
        // Draw Background
        ctx.rect(0,0,dimensionsw,dimensionsh);
        ctx.fillStyle = "#36393f";
        ctx.fill();
        
        // Draw Title letters
        ctx.font = "28px Sans";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Hourly Messages Activity - ${name}`, graphwidth/2, graphheightborder/2);
    
        // Draw Y axis Metrics - These never change for activity
        ctx.font = "14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        var yaxismove = (graphheight - (graphheightborder*2))/10
        ctx.fillText("100%", graphwidthborder/2, graphheightborder*1.1);
        ctx.fillText("90%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*1));
        ctx.fillText("80%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*2));
        ctx.fillText("70%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*3));
        ctx.fillText("60%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*4));
        ctx.fillText("50%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*5));
        ctx.fillText("40%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*6));
        ctx.fillText("30%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*7));
        ctx.fillText("20%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*8));
        ctx.fillText("10%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*9));
        ctx.fillText("0%",graphwidthborder/2, graphheightborder*1.1+(yaxismove*10));
        
        // Draw midlines. 
        var i;
        for (i = 0; 10 > i; i++) {
            ctx.beginPath()
            ctx.strokeStyle = "#5b666c"
            ctx.moveTo(graphwidthborder,graphheightborder*1+(yaxismove*i));
            ctx.lineTo(graphwidth-graphwidthborder,graphheightborder*1+(yaxismove*i));
            ctx.stroke();
        }

        // Draw Line Grid
        ctx.beginPath() // Left Border
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,graphheightborder*1);
        ctx.lineTo(graphwidthborder,graphheight-graphheightborder);
        ctx.stroke();
        
        ctx.beginPath() // Bottom Border
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,graphheight-graphheightborder);
        ctx.lineTo(graphwidth-graphwidthborder,graphheight-graphheightborder);
        ctx.stroke();
    
        // Draw our line with datapoints
        var topborder = graphheightborder*1
        var heightspace = (graphheight)-(graphheightborder*2);
        var widthspace = (graphwidth)-(graphwidthborder*2);
        var pointdelta = (graphwidth-(graphwidthborder*2))/(testarray.length-1); // This is the distance between each point horizontally we should move
        ctx.beginPath()
        ctx.strokeStyle = "white"
        ctx.moveTo(graphwidthborder,(topborder+heightspace)-(heightspace*(testarray[0]/100)));
        for (i = 1; testarray.length > i; i++) {
            ctx.lineTo(graphwidthborder+(i*pointdelta),(topborder+heightspace)-(heightspace*(testarray[i]/100)));
        }
        ctx.stroke();

        // Draw our line points. 
        var i = 0;
        var graindelta = widthspace / bottomgrains;
        for (i = 0; (bottomgrains+1) > i; i++) {
            var linestroke = 5;
            if ((i == 0)||(i == 6)||(i == 12)||(i == 18)||(i == 24)) { linestroke = 15 }
            ctx.beginPath()
            ctx.strokeStyle = "white";
            ctx.moveTo((graphwidthborder+(graindelta * i)),graphheight-graphheightborder);
            ctx.lineTo((graphwidthborder+(graindelta * i)),(graphheight-graphheightborder)+linestroke)
            ctx.stroke();
        }

        // Draw the date points.
        ctx.fillText(`12AM PST`, (graphwidthborder+((0)*graindelta)), graphheight-(graphheightborder*0.3));
        ctx.fillText(`6AM PST`, (graphwidthborder+((6)*graindelta)), graphheight-(graphheightborder*0.3));
        ctx.fillText(`12PM PST`, (graphwidthborder+((12)*graindelta)), graphheight-(graphheightborder*0.3));
        ctx.fillText(`6PM PST`, (graphwidthborder+((18)*graindelta)), graphheight-(graphheightborder*0.3));
        ctx.fillText(`12AM PST`, (graphwidthborder+((24)*graindelta)), graphheight-(graphheightborder*0.3));

        var canv = canvas.toDataURL();
        var datastring = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(datastring, 'base64');
        fs.writeFile('boardTest.jpg', buffer, (err) => {
            if (err) { console.log(err) }
        });
        resolve(buffer);
    })
}