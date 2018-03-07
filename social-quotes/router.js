const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {Quote} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Get all of user's quotes
router.get('/', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    Quote.find()
        .then(quotes => res.status(200).json(quotes))
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// Get quotes based on search
router.get('/:searchTerm', 
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    let searchTerm = req.params.searchTerm;
    Quote.find(searchTerm)
        .then(count => {
            if (count > 0) {
                return res.status(200).json(quotes);
            } else {
                //ask about code i should be using
                return res.status(204).json({message: 'Nothing matching Search'});
            }
        })
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// Post to create a new quote
router.post('/', 
    jsonParser, 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    const requiredFields = ['quote', 'user'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    let {quote, user, reference = '', tags = []} = req.body;

    return Quote.find({quote})
        .count()
        .then(count => {
            if (count > 0) {
                // There is an existing quote
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'This quote already exists',
                });
            }
        })
        .then(create => {
            return Quote.create({
                quote,
                user,
                reference,
                tags
            });
        })
        .then(quote => {
            return res.status(201).json(quote);
        })
        .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            console.log(err);
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});



module.exports = {router};
