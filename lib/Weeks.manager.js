var datejs = require('safe_datejs');
var Date = datejs.DateType

function Weeks(app) {
  this.app = app;
}

/* Days of the week for the given date */
Weeks.prototype.getDays = function(date, callback) {
  var currentDate = date.AsDateJs();
  date = currentDate.clone();
  var days = [];
  date.moveToDayOfWeek(6, -1)
  var endOfWeek = Date.CultureInfo.firstDayOfWeek + 7;
  for(var i = Date.CultureInfo.firstDayOfWeek; i < endOfWeek; i++) {
    date.moveToDayOfWeek(i)
    days.push({
      date: date.toString('M-dd-yyyy'),
      dayName: Date.CultureInfo.dayNames[date.getDay()],
      monthName: Date.CultureInfo.abbreviatedMonthNames[date.getMonth()],
      isToday: date.is().today(),
      isCurrent: Date.compare(date, currentDate) == 0,
      dayOfMonth: date.getDate()
    });
  }
  callback(null, days);
}

module.exports = Weeks;
