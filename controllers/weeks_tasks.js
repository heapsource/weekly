var datejs = require('safe_datejs');

/* Resource Loader: Loas the task with the id req.params.task into req.task */
exports.load = function(req, id, next) {
  req.app.Managers.Tasks.getTask(id, next);
}

/* POST /weeks/:week/tasks/ */
exports.create = function(req, res, next) {
  var taskInfo = {
    title: req.body.title,
    description: req.body.description,
    date: req.week,
    done: req.body.done == 'yes'
  };
  req.app.Managers.Tasks.create(taskInfo, function(err, item) {
    if(err) {
      next(err);
    } else {
      res.send(201);
    }
  });
}

/* GET /weeks/:week/tasks/:task/new */
exports.new = function(req, res) {
  res.render('tasks/new', {
    layout:false
  });
}

/* GET /weeks/:week/tasks/:task */
exports.show = function(req, res) {
  switch(req.format) {
    case 'json':
      res.send(req.task);
    break;
    default: 
      res.render('tasks/show', {
      layout: false,
      task: req.task
    });
    break;
  }
}

/* GET /weeks/:week/tasks/:task/edit */
exports.edit = function(req, res) {
  res.render('tasks/edit', {
    layout: false,
    task: req.task
  });
}

/* GET /weeks/:week/tasks/ */
exports.index = function(req, res, next) {
  req.app.Managers.Tasks.getList(req.week, function(err, tasks) {
    if(err) {
      next(err);
    } else {
      switch(req.format) {
        case 'json':
          res.send(tasks);
        break;
        default: 
          res.render('tasks/index', {
          layout:false,
          locals: {
            tasks: tasks,
            date: req.params.week
          }
        });
        break;
      }
    }
  });
}

/* PUT /weeks/:week/tasks/:task */
exports.update = function(req, res, next) {
  var taskInfo = {
    date: req.params.week
  };
  if(req.body.hasOwnProperty('title')) {
    taskInfo.title = req.body.title;
  }
  if(req.body.hasOwnProperty('description')) {
    taskInfo.description = req.body.description;
  }
  if(req.format) {
    if(req.body.hasOwnProperty('done')) {
      taskInfo.done = req.body.done === 'yes';
    }
  } else {
      taskInfo.done = !req.body.done ? false : true;
  }
  
  req.app.Managers.Tasks.updateTask(req.params.task, taskInfo, function(err, item) {
    if(err) {
      next(err);
    } else {
      res.send(200);
    }
  });
}

/* DELETE /weeks/:week/tasks/:task */
exports.delete = function(req, res, next) {
  this.app.Managers.Tasks.deleteTask(req.task.id, function(err) {
    if(err) {
      next(err);
    } else {
      res.send(200);
    }
  });
}

exports.route = {
  parent: 'weeks',
  base: 'tasks'
}
