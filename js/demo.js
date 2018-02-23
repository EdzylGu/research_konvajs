//parameter
var node_height = 15;

var width = window.innerWidth;
var height = window.innerHeight;

// globals
var stage, curveLayer, lineLayer, anchorLayer, imagelayer, robotlayer;
var points = []; //store all points Anchor
var points_status = []; //store all points status
var lines = []; //store all lines
var robots = []; //store all robots info
var robots_position = []; //store all robots position
var update;

/**
update
**/
function Run(bool) {
  if (bool) {
    update = setInterval(function() {
      UpdateRobot();
    }, 900);
  } else {
    clearInterval(update);
  }
}


function updateDots() {
  lineLayer.destroyChildren();
  for (var i = 0; i < points.length; i++) {
    for (var j = 0; j < points[i].length; j++) {
      //update color
      if (points_status[i][j] === 1) {
        points[i][j].setFill('#FFF');
        points[i][j].draw();
      }
      if (points_status[i][j] === 0) {
        points[i][j].setFill('black');
        points[i][j].draw();
      }
    }
  }
}

function updateLines() {
  lineLayer.destroyChildren();
  for (var i = 0; i < points.length; i++) {
    for (var j = 0; j < points[i].length; j++) {
      if (i < points.length - 1 && points_status[i][j] == 1 && points_status[i + 1][j] == 1) {
        var line = new Konva.Line({
          strokeWidth: 3,
          stroke: 'black',
          lineCap: 'round',
          id: 'quadLine',
          opacity: 0.3,
          points: [points[i][j].attrs.x, points[i][j].attrs.y, points[i + 1][j].attrs.x, points[i + 1][j].attrs.y]
        });
        lineLayer.add(line);
      }
      if (j < points[i].length - 1 && points_status[i][j] == 1 && points_status[i][j + 1] == 1) {
        var line = new Konva.Line({
          strokeWidth: 3,
          stroke: 'black',
          lineCap: 'round',
          id: 'quadLine',
          opacity: 0.3,
          points: [points[i][j].attrs.x, points[i][j].attrs.y, points[i][j + 1].attrs.x, points[i][j + 1].attrs.y]
        });
        lineLayer.add(line);
      }
    }
  }
  lineLayer.draw();
}

function buildAnchor(x, y, id) {
  var anchor = new Konva.Circle({
    x: x,
    y: y,
    radius: 10,
    stroke: '#666',
    fill: '#FFF',
    strokeWidth: 2,
    id: id
  });

  // add hover styling
  anchor.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
  });
  anchor.on('mouseout', function() {
    document.body.style.cursor = 'default';
    this.setStrokeWidth(2);
  });
  anchor.on('click', function() {
    id = anchor.attrs.id.split(",");
    if (anchor.attrs.fill === "black") {
      this.setFill('#FFF');
      points_status[id[0]][id[1]] = 1;
    } else {
      this.setFill('black');
      points_status[id[0]][id[1]] = 0;
    }
    this.setStrokeWidth(2);
    this.draw();
    updateLines();
  });
  robotlayer.add(anchor);
  return anchor;
}

function buildRobot(x, y, id) {
  var rect = new Konva.Ellipse({
    x: x,
    y: y,
    radius: {
      x: 12,
      y: 10
    },
    fill: 'orange',
    stroke: 'black',
    strokeWidth: 2,
    id: id
  });
  robotlayer.add(rect);
  return rect;
}

function Save() {
  var status = new Object();
  for (var i = 0; i < points_status.length; i++) {
    for (var j = 0; j < points_status.length; j++) {
      if (points_status[i][j] !== 1) {
        var str = i.toString() + "," + j.toString();
        status[str] = points_status[i][j];
      }
    }
  }
  var status_str = JSON.stringify(status);
  localStorage.setItem("demo", status_str);
}

function Load() {
  var status_str = localStorage.getItem("demo");
  var status = JSON.parse(status_str);
  $.each(status, function(index, value) {
    var position = index.toString().split(",");
    points_status[position[0]][position[1]] = parseInt(value);
  });
  updateLines();
  updateDots();
  robotlayer.draw();
}

function UpdateRobot() {
  var x_i, y_j;
  for (var i = 0; i < robots_position.length; i++) {
    x_i = robots_position[i][0];
    y_i = robots_position[i][1];
    direction = robots_position[i][2];
    console.log(direction);

    if (direction === 'r') {
      if (points_status[x_i + 1][y_i] === 1) {
        //right
        robots[i].x(points[x_i + 1][y_i].x());
        robots_position[i][0] = x_i + 1;
      } else {
        robots_position[i][2] = 'u';
        robots[i].rotate(90);
      }
    }

    if (direction === 'u') {
      if (points_status[x_i][y_i - 1] === 1) {
        //up
        robots[i].y(points[x_i][y_i - 1].y());
        robots_position[i][1] = y_i - 1;
      } else {
        robots_position[i][2] = 'l';
        robots[i].rotate(90);
      }
    }

    if (direction === 'l') {
      if (points_status[x_i - 1][y_i] === 1) {
        //left
        robots[i].x(points[x_i - 1][y_i].x());
        robots_position[i][0] = x_i - 1;
      } else {
        robots_position[i][2] = 'd';
        robots[i].rotate(90);
      }
    }

    if (direction === 'd') {
      if (points_status[x_i][y_i + 1] === 1) {
        //down
        robots[i].y(points[x_i][y_i + 1].y());
        robots_position[i][1] = y_i + 1;
      } else {
        robots_position[i][2] = 'r';
        robots[i].rotate(90);
      }
    }

    robots[i].moveToTop();
    robotlayer.draw();
  }
}

function Init() {
  var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
  });

  anchorLayer = new Konva.Layer();
  lineLayer = new Konva.Layer();
  imagelayer = new Konva.Layer();
  robotlayer = new Konva.Layer();

  var start_x = 47,
    start_y = 108;
  var robot_x = Math.floor(Math.random() * node_height);
  var robot_y = Math.floor(Math.random() * node_height);
  for (var i = 0; i < node_height + 20; i++) {
    var points_temp = [];
    var points_status_temp = [];
    for (var j = 0; j < node_height; j++) {
      points_temp[j] = buildAnchor(start_x + 35 * i, start_y + 35 * j, i.toString() + "," + j.toString());
      points_status_temp[j] = 1;
      if (robot_x === i && robot_y === j) {
        robots.push(buildRobot(start_x + 35 * i, start_y + 35 * j, "robot-" + i.toString() + "," + j.toString()));
        var robot_position = [];
        robot_position.push(i);
        robot_position.push(j);
        robot_position.push("r"); //direction
        robots_position.push(robot_position);
      }
      if (robot_x + robot_x === i && node_height-10 === j) {
        robots.push(buildRobot(start_x + 35 * i, start_y + 35 * j, "robot-" + i.toString() + "," + j.toString()));
        var robot_position = [];
        robot_position.push(i);
        robot_position.push(j);
        robot_position.push("l"); //direction
        robots_position.push(robot_position);
      }
      if (robot_x + robot_y === i && robot_y === j) {
        robots.push(buildRobot(start_x + 35 * i, start_y + 35 * j, "robot-" + i.toString() + "," + j.toString()));
        var robot_position = [];
        robot_position.push(i);
        robot_position.push(j);
        robot_position.push("r"); //direction
        robots_position.push(robot_position);
      }
    }
    points[i] = points_temp;
    points_status[i] = points_status_temp;
  }

  var imageObj = new Image();
  imageObj.onload = function() {
    var map = new Konva.Image({
      x: 0,
      y: 10,
      image: imageObj,
      width: width * 1,
      height: height * 1.2
    });

    /**
    add the shape to the layer
    **/
    imagelayer.add(map);
    stage.add(imagelayer);
    stage.add(lineLayer);
    stage.add(anchorLayer);
    stage.add(robotlayer);
    updateLines();
  };
  imageObj.src = 'images/map.png';

  /**
  Zooming stage relative to pointer position
  **/
  var scaleBy = 1.1;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    var oldScale = stage.scaleX();

    var mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    var newScale = e.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({
      x: newScale,
      y: newScale
    });

    var newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    };
    stage.position(newPos);
    stage.batchDraw();
  });
}
