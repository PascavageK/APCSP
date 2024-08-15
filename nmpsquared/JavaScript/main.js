var canvas;
var context;

var setupOccured = false;

var gridDimensions;

var impassableSquareMap = [0,0,0,0,1,0,0,0,0,0,1,1,1,0,1,1];

// Gets the context of the HTML canvas
// Needed elsewhere in the code
function setUp() {
    try {
        canvas = document.getElementById("myCanvas");
        context = canvas.getContext("2d");
        gridDimensions = [canvas.width/8, canvas.height/6]
        setBG(false);
    }
    catch (error) {
        console.error("Setup failed\n" + error);
        return 0;
    }

    setupOccured = true;
    return 1;
}

// Sets the background of the canvas element to a grid
// Returns 1 if successful
function setBG(callSetup = !setupOccured) {

    if (callSetup) setUp();
    
    context.clearRect(0,0,canvas.width,canvas.height);
    context.beginPath();

    context.strokeStyle = "grey";

    for (var i = 0; i < 7; i++) {
        context.moveTo((i+1)*gridDimensions[0],canvas.height);
        context.lineTo((i+1)*gridDimensions[0], 0);
        context.stroke();
    }

    for (var i = 0; i < 5; i++) {
        context.moveTo(canvas.width, (i+1)*gridDimensions[1]);
        context.lineTo(0, (i+1)*gridDimensions[1]);
        context.stroke();
    }

    context.fillStyle = "red";

    for (var i = 0; i < impassableSquareMap.length; i++) {
        if (impassableSquareMap[i] == 1) {
            context.fillRect(i%(canvas.width/gridDimensions[0])*gridDimensions[0], 
                             Math.trunc(i/(canvas.height/gridDimensions[1]))*gridDimensions[1], 
                             gridDimensions[0], gridDimensions[1]);
        }
    }

    context.fillStyle = "black";
    context.strokeStyle = "blue";

    return 1;
}

// Draws a path between two points given by user input
// Returns 1 if successful
function drawPath(callSetup = !setupOccured) {

    var pointList;

    if (callSetup) setUp();

    try {
        setBG();
    }
    catch(error) {
        console.error("drawPath failed to set BG\n" + error);
    }
    
    try {
        pointList = generatePath([document.getElementById("inputStartX").value, document.getElementById("inputStartY").value]
                                ,[document.getElementById("inputEndX").value, document.getElementById("inputEndY").value]);
    }
    catch(error) {
        console.error("Failed to fetch start and end points\n" + error);
        return 0;
    }

    context.beginPath();
    context.lineWidth = 2;

    for (var i = 0; i < pointList.length-1; i++) {
        context.moveTo(pointList[i][0], pointList[i][1]);
        context.lineTo(pointList[i+1][0], pointList[i+1][1]);
        context.stroke();
    }

    context.lineWidth = 1;

    return 1;
}

// Generates a valid path between a start point and end point
// Returns a list of way points
function generatePath(startPoint, endPoint) {

    checkPointValidity(startPoint);
    checkPointValidity(endPoint);

    var points = [];

    var repeatsNeeded = gridDimensions[0]+gridDimensions[1]-1;

    var centerStartPoint = centerPoint(startPoint);
    var centerEndPoint = centerPoint(endPoint);
    var slope;
    var newPoint;

    points.push(centerStartPoint);
    points.push(centerEndPoint);

    if (comparePoints(points[0], points[1])) return points;

    for (var r = 0; r < repeatsNeeded; r++) {
        for (var i = 0; i < points.length-1; i++) {
            slope = slopeOfLine(points[i], points[i+1], false);
            if (slope != 0 && slope != "Infinity") {
                newPoint = centerPoint([(points[i][0]+points[i+1][0])/2-Math.sign(slope),
                                        (points[i][1]+points[i+1][1])/2+1]);
                if (!comparePoints(newPoint, points[i], false)) points.splice(i+1,0,newPoint);
            }
        }
    }

    return points;
}

//Takes a point to square to a grid
//Returns a new point centered in a grid square
function centerPoint(point, callSetup = !setupOccured) {

    if (callSetup) setUp();

    checkPointValidity(point);

    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 6; y++) {
            if ((x*gridDimensions[0] <= point[0] && point[0] <= (x+1)*gridDimensions[0]) && 
                (y*gridDimensions[1] <= point[1] && point[1] <= (y+1)*gridDimensions[1])) {
                return [x*gridDimensions[0]+gridDimensions[0]/2, 
                        y*gridDimensions[1]+gridDimensions[1]/2];
            }
        }
    }

    console.error("Failed to center point");
    return 0;
}

//Takes in two points of a line
//Returns the slope of the line
function slopeOfLine(pointA, pointB, checkPoint = true) {
    
    if (checkPoint) {
        checkPointValidity(pointA);
        checkPointValidity(pointB);
    }

    return (pointB[1]-pointA[1])/(pointB[0]-pointA[0]);
}

//Takes in two points
//Returns if the two points are equal
function comparePoints(pointA, pointB, checkPoint = true) {

    if (checkPoint) {
        checkPointValidity(pointA);
        checkPointValidity(pointB);
    }

    return (pointA[0]==pointB[0]) && (pointA[1]==pointB[1]);
}

//Takes in a point
//Returns if the point is valid throws error if not
function checkPointValidity(point, callSetup = !setupOccured) {

    if (callSetup) setUp();

    if ((isNaN(point[0]) || isNaN(point[1])) || 
        (point[0] < 0 || point[1] < 0) || (point[0] > canvas.width || point[1] > canvas.height)) {
        throw new Error("The point " + point + " is not valid");
    }
    return 1;
}
