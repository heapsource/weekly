/* Prepare Socket.IO */
var socket = io.connect(window.location.origin);

/* UI Controller */
function Weekly(container) {
  this.headerElement = $('div.header', container);
  this.visualElement = $('div.visual', container);
  this.listElement = $('div.list', container);
  this.setCurrentDate(new Date());
  this.reloadHeader();
  var self = this;
  socket.on('task_created', function(taskInfo) {
    // Refresh the current list when a new task is added for today.
    if(self.getCurrentDateString() == taskInfo.date) {
      self.refreshList(true, true);
    }
    $('.header li[title=' + taskInfo.date  + ']').effect('highlight');
  });
  socket.on('task_updated', function(taskInfo) {
    // Refresh the current title in the list.
    if(self.getCurrentDateString() == taskInfo.date) {
      $('ul.tasks li.' + taskInfo.id + ' a h3').html(taskInfo.title);
      if(taskInfo.done) {
        $('ul.tasks li.' + taskInfo.id + ' input[type=checkbox]').attr('checked', 'checked');
        $('ul.tasks li.' + taskInfo.id).toggleClass('done', true);
      } else {
        $('ul.tasks li.' + taskInfo.id + ' input[type=checkbox]').removeAttr('checked');
        $('ul.tasks li.' + taskInfo.id).toggleClass('done', false);
      }
      $('ul.tasks li.' + taskInfo.id).effect('highlight');
    }
    $('.header li[title=' + taskInfo.date  + ']').effect('highlight');
  });
}

/* Changes the Date of the Weekly view */
Weekly.prototype.setCurrentDate = function(date) {
  this.currentDate = date;
  this.refreshList();
}

/* Formats the current date to be sent to the server */
Weekly.prototype.getCurrentDateString = function() {
  return this.currentDate.toString('M-dd-yyyy');
}

/* Shows the View with the form to create new tasks */
Weekly.prototype.showAddVisual = function() {
  var self = this;
  this.visualElement.load('/weeks/' + this.getCurrentDateString() + '/tasks/new', function(data, status, response) {
    var form = $('form', this);
    form.attr('action', form.attr('action').replace(':date', self.getCurrentDateString()));
    form.ajaxForm({
      success: function() {
        self.resetVisual();
      }
    });
  });
}

/* Shows the View with the form to create edit tasks */
Weekly.prototype.showEdit = function(taskUrl) {
  var self = this;
  this.visualElement.load(taskUrl + '/edit', function(data, status, response) {
    var form = $('form', this);
    form.attr('action', form.attr('action').replace(':date', self.getCurrentDateString()));
    form.ajaxForm({
      success: function() {
        self.showTask(taskUrl);
      }
    });
  });
}


/* Go back to the previous weekend and refreshes the UI */
Weekly.prototype.goToPrevWeek = function() {
  this.goToRelativeWeek(-1);
}

/* Go to the next weekend and refreshes the UI */
Weekly.prototype.goToNextWeek = function() {
  this.goToRelativeWeek(1);
}

/* Go a relative week from the current date and refreshes the UI. Negative number means past weeks and positives numbers means future weeks. */
Weekly.prototype.goToRelativeWeek = function(weekPosition) {
  this.currentDate.moveToDayOfWeek(this.currentDate.getDay(), weekPosition)
  this.reloadHeader();
}

/* Reload the current header from the server. This triggers an update in the other views too. */
Weekly.prototype.reloadHeader = function() {
  this.resetVisual();
  var self = this;
  this.headerElement.load('/weeks/' +  this.getCurrentDateString(), function(data, status, response) {
    $('.prev-week a', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.goToPrevWeek();
      return false;
    });
    $('.next-week a', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.goToNextWeek();
      return false;
    });
    $('.day a', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      $('li.selected', self.headerElement).removeClass('selected');
      $(this).parent('.day').toggleClass('selected', true);
      self.setCurrentDate(Date.parse($(this).parent('.day').attr('title')));
    });

    // Reload the List for the Selected Date
    self.refreshList();
  });
}
/* Refreshes the UI list */
Weekly.prototype.refreshList = function(highlight, skipVisualReset) {
  var self = this;
  this.listElement.load('/weeks/' +  this.getCurrentDateString() + '/tasks', function(data, status, response) {
    if(highlight) {
      $(this).effect('highlight');
    }
    if(!skipVisualReset) {
      self.resetVisual();
    }
    $('ul.tasks li a', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.showTask($(this).attr('href'));
    });
    $('ul.tasks li input[type=checkbox]', this).click(function(event) {
      $.ajax({
        url: '/weeks/' + self.getCurrentDateString() + '/tasks/' + $(this).attr('value') + '.json',
        type: 'PUT',
        data: {
          done: $(this).is(':checked') ? 'yes' : 'no'
        }}, function(data, status, response) {

        });
    });

    $('a.add', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.showAddVisual();
    });
  });
}

/* Shows the task in the given URL */
Weekly.prototype.showTask = function(taskUrl) {
  var self = this;
  this.resetVisual();
  this.visualElement.load(taskUrl, function(data, status, response) {
    $('a.edit', this).click(function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      self.showEdit($(this).attr('href'));
    });
  });
}

/* Hides the details placeholder */
Weekly.prototype.resetVisual = function() {
  this.visualElement.empty();
}

$(document).ready(function() {
  $.ajaxSetup ({
    cache: false
  });
  var weekly = new Weekly($(document));
});
