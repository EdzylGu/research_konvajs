//parameter
var node_height = 15;

var width = window.innerWidth;
var height = window.innerHeight;

// globals
var stage, curveLayer, lineLayer, anchorLayer, imagelayer;
var points = []; //store all points Anchor
var points_status = []; //store all points status
var lines = []; //store all lines


function updateDots() {
  lineLayer.destroyChildren();
  for (var i = 0; i < points.length; i++) {
    for (var j = 0; j < points[i].length; j++) {
      //update color
      if (points_status[i][j] === 1) {
        points[i][j].setFill('#ddd');
      }
      if (points_status[i][j] === 0) {
        points[i][j].setFill('black');
      }
    }
  }
  anchorLayer.draw();
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
    fill: '#ddd',
    strokeWidth: 2,
    id: id
  });

  // add hover styling
  anchor.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
    anchorLayer.draw();
  });
  anchor.on('mouseout', function() {
    document.body.style.cursor = 'default';
    this.setStrokeWidth(2);
    anchorLayer.draw();
  });
  anchor.on('click', function() {
    id = anchor.attrs.id.split(",");
    if (anchor.attrs.fill === "black") {
      this.setFill('#ddd');
      points_status[id[0]][id[1]] = 1;
    } else {
      this.setFill('black');
      points_status[id[0]][id[1]] = 0;
    }
    updateLines();
  });
  anchorLayer.add(anchor);
  return anchor;
}

function save() {
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

function load() {
  var status_str = localStorage.getItem("demo");
  var status = JSON.parse(status_str);
  $.each(status, function(index, value) {
    var position = index.toString().split(",");
    points_status[position[0]][position[1]] = parseInt(value);
  });
  updateLines();
  updateDots();
}

function init() {
  var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
  });

  anchorLayer = new Konva.Layer();
  lineLayer = new Konva.Layer();
  imagelayer = new Konva.Layer();

  var start_x = 47,
    start_y = 108;
  for (var i = 0; i < node_height + 20; i++) {
    var points_temp = [];
    var points_status_temp = [];
    for (var j = 0; j < node_height; j++) {
      points_temp[j] = buildAnchor(start_x + 35 * i, start_y + 35 * j, i.toString() + "," + j.toString());
      points_status_temp[j] = 1;
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
      width: width*1,
      height: height*1.2
    });

    // add the shape to the layer
    imagelayer.add(map);
    stage.add(imagelayer);
    stage.add(lineLayer);
    stage.add(anchorLayer);
    updateLines();
  };
  imageObj.src = 'images/map.png';
}
