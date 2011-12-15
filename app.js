
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , socketIO = require('socket.io');

require('express-resource')
var datejs = require('safe_datejs');
datejs.DateType.CultureInfo.firstDayOfWeek = 1; //Monday

var app = module.exports = express.createServer();
var port = 0

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  port = 3000
});

app.configure('production', function(){
  port = process.env.PORT || 80
  app.use(express.errorHandler()); 
});


// Draw Controllers
fs.readdirSync(path.join(__dirname, 'controllers')).forEach(function(controllerFile) {
  var controller = require(path.join(__dirname, 'controllers', controllerFile))
  var resource = app.resource(controller.route.base, controller);
  if(controller.route.parent) {
    app.resources[controller.route.parent].add(resource);
  }
});

// Load Application Managers
app.Managers = {};
fs.readdirSync(path.join(__dirname, 'lib')).forEach(function(managerFile) {
  if(managerFile.indexOf('.manager.') != -1)  {
    var managerType = require(path.join(__dirname, 'lib', managerFile));
    var managerName = managerFile.substring(0, managerFile.indexOf('.manager.'));
    app.Managers[managerName] = new managerType(app);
  }
});

// Load Data Models 
app.Data = {};
fs.readdirSync(path.join(__dirname, 'models')).forEach(function(managerFile) {
  var schema  = require(path.join(__dirname, 'models', managerFile));

  // Register and Add Model
  var modelName = managerFile.substring(0, managerFile.indexOf('.js'));
  app.Data[modelName] = mongoose.model(modelName,schema);
  
  // Add Schema
  var schemaName = modelName + "Schema";
  app.Data[schemaName] = schema;
});

// Socket.io Integration
var io = socketIO.listen(app);
io.configure('production', function(){
        io.set('transports', [                     // enable all transports (optional if you want flashsocket)
          'websocket'
        , 'xhr-polling'
        , 'jsonp-polling'
      ]);
});
app.configure('production', function() {
  io.set('log level', 1);
});

app.Managers.Tasks.on('task_created', function(taskInfo) {
  // Broadcast the signale to all the connected clients
  io.sockets.clients().forEach(function(socket) {
    socket.emit('task_created', {
      date: taskInfo.dateString
    });
  });
});

app.Managers.Tasks.on('task_updated', function(taskInfo) {
  // Broadcast the signale to all the connected clients
  io.sockets.clients().forEach(function(socket) {
    socket.emit('task_updated', {
      date: taskInfo.date,
      title: taskInfo.title,
      id: taskInfo.id,
      done: taskInfo.done
    });
  });
});

mongoose.connect(process.env.MONGO_HQ || 'mongodb://localhost/weekly');


app.get('/', routes.index);

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
