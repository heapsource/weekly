var events = require('events');
var util = require('util');

function Tasks(app) {
  this.app = app;
}
util.inherits(Tasks, events.EventEmitter);

Tasks.prototype.create = function(taskInfo, callback) {
  var self = this;
  var newTask = new this.app.Data.Task(taskInfo);
  newTask.save(function(err) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, newTask);
      self.emit('task_created', newTask);
    }
  });
}

Tasks.prototype.updateTask = function(taskId, taskInfo, callback) {
  var self = this;
  this.app.Data.Task.update({
    _id: taskId,
  }, taskInfo, function(err) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, taskInfo);
      self.emit('task_updated', {
        id: taskId,
        title: taskInfo.title,
        date: taskInfo.date,
        done: taskInfo.done
      });
    }
  });
}

Tasks.prototype.getList = function(date, callback) {
  this.app.Data.Task.find({
    date: date
  }, callback);
}

Tasks.prototype.getTask = function(id, callback) {
  this.app.Data.Task.findById(id, callback);
}

Tasks.prototype.deleteTask = function(id, callback) {
  this.app.Data.Task.findById(id, callback);
}

module.exports = Tasks
