const mongoose = require('mongoose'),
  _ = require('lodash');

/** @model eventListenerModel
 *  @description eventListener model - is used to store callbacks
 */
const EventListener = new mongoose.Schema({
  event: {type: String, required: true},
  callback: {type: String, required: true},
  controlIndexHash: {type: String, required: true},
  filter: {
    type: mongoose.Schema.Types.Mixed, required: true, validate: [v => {
      if (!_.isObject(v))
        try {
          JSON.parse(v);
        } catch (e) {
          return false;
        }
      return true;
    }, 'wrong filter'],
  },
  fails: {type: Array, required: false, default: []},
  updated: {type: Date, default: Date.now, required: true, expires: 86400 * 30}

});

module.exports = mongoose.model('EventListener', EventListener);