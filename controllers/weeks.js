var datejs = require('safe_datejs');

/* Resource loader: Parses req.params.week into req.week */
exports.load = function(id, next) {
  next(null, datejs.DateType.parse(id).AsRegularDate());
}

/* GET /weeks/:week */
exports.show = function(req, res) {
  var date = req.week;
  req.app.Managers.Weeks.getDays(date, function(err, days) {
    switch(req.format) {
      case 'json':
        res.send(days);
        break;
      default:
        res.render('calendars/week', {
          layout: false,
          days: days
        });
        break;
    }
  });
}

exports.route = {
  base: 'weeks',
}
