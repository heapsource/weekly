var mongoose = require('mongoose');
var Task = new mongoose.Schema({
  title: { type: String, index: true},
  description: String,
  date: Date,
  done: { type: Boolean, default: false }
});
Task.virtual('dateString').get(function() {
  return this.date ? this.date.AsDateJs().toString('M-dd-yyyy') : null;
});
module.exports = Task; 
