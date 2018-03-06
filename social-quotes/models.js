const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const QuoteSchema = mongoose.Schema({
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

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = {Quote};
