const mongoose = require('mongoose'),
  messages = require('../factories').messages.transactionMessageFactory;

/** @model transactionModel
 *  @description block model - represents a block in eth
 */
const Transaction = new mongoose.Schema({
  blockHash: {type: String},
  blockNumber: {type: String},
  from: {
    type: String,
    required: true,
    validate: {
      validator: (a) => /^(0x)?[0-9a-fA-F]{40}$/.test(a),
      message: messages.wrongFrom
    }
  },
  gasUsed: {type: String},
  root: {type: String},
  to: {
    type: String,
    required: true,
    validate: {
      validator: (a) => /^(0x)?[0-9a-fA-F]{40}$/.test(a),
      message: messages.wrongTo
    }
  },
  transactionHash: {type: String, unique: true},
  value: {type: String},
  network: {type: String},
  created: {type: Date, required: true, default: Date.now},

});

module.exports = mongoose.model('Transaction', Transaction);