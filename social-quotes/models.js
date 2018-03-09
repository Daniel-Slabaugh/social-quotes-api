const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const quoteSchema = mongoose.Schema({
    quote: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true
    },
    reference: {type: String, default: ''},
    tags: {type: Array, default: ''}
});


quoteSchema.methods.quoteWithID = function() {
  return {
    id: this._id,
    quote: this.quote,
    user: this.user,
    reference: this.reference,
    tags: this.tags
  };
}

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = {Quote};
