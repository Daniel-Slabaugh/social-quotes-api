const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {Quote} = require('../social-quotes');
const {closeServer, runServer, app} = require('../server');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');
const {User} = require('../users');

chai.use(chaiHttp);

function tearDownDb() {
	return new Promise((resolve, reject) => {
		console.warn('Deleting database');
		mongoose.connection.dropDatabase()
			.then(result => resolve(result))
			.catch(err => reject(err))
	});
}

function seedQuoteData() {
	console.info('seeding quote data');
	const seedData = [];
	for (let i=1; i<=10; i++) {
		seedData.push({
			quote: faker.lorem.sentence(), 
			user: faker.internet.email(),
			reference: faker.name.firstName() + faker.name.lastName(),
			tags:  faker.random.words()
		});
	}
	// this will return a promise
	return Quote.insertMany(seedData);
}

describe('Quote server resource', function() {
	const username = 'exampleUser';
	const password = 'examplePass';
	const name = 'User';    
	const token = jwt.sign(
		{
			user: {
				username,
				name
			}
		},
		JWT_SECRET,
		{
			algorithm: 'HS256',
			subject: username,
			expiresIn: '7d'
		}
	);

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedQuoteData();
	});

	afterEach(function() {
		// tear down database so we ensure no state from this test
		// effects any coming after.
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('GET endpoints', function() {
		it('should return all existing quotes', function() {
			let res;
			return chai
				.request(app)
				.get('/social-quotes')
				.set('authorization', `Bearer ${token}`)
				.then(_res => {
					res = _res;
					res.should.have.status(200);
					// otherwise our db seeding didn't work
					res.body.should.have.length.of.at.least(1);

					return Quote.count();
				})
				.then(count => {
					// the number of returned posts should be same
					// as number of posts in DB
					res.body.should.have.length(count);
				});
		});
		it('should return spcific quote based on search', function() {

			return Quote
				.findOne()
				.exec()
				.then(function(quote) {
					updateData.quote = quote.quote;

					return chai
						.request(app)
						.get(`/social-quotes/${quote.quote}`)
						.set('authorization', `Bearer ${token}`)
				})
				.then(_res => {
					res = _res;
					res.should.have.status(200);
					// otherwise our db seeding didn't work
					res.body.should.have.length.of(1);

					return Quote.findById(updateData.id).exec();
				})
				.then(function(quote) {
					quote.state.should.equal(updateData.state);
					quote.name.should.equal(updateData.name);
					quote.description.should.equal(updateData.description);
					quote.condition.should.equal(updateData.condition);
				});
			let res;
			return chai
				.request(app)
				.get('/social-quotes:')
				.set('authorization', `Bearer ${token}`)

		})

	});

	describe('POST endpoint', function() {

		it('should add a new quote', function() {

			const newQuote =  {     
				quote: faker.lorem.sentence(), 
				user: faker.internet.email(),
				reference: faker.name.firstName() + faker.name.lastName(),
				tags:  faker.random.words()
			}

			return chai.request(app)
				.post('/social-quotes')
				.set('authorization', `Bearer ${token}`)
				.send(newQuote)
				.then(function(res) {
					res.should.have.status(201);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.include.keys('id', 'quote', 'user', 'reference', 'tags');
					res.body.quote.should.equal(newQuote.quote)
					res.body.id.should.not.be.null;
					res.body.user.should.equal(newQuote.user);

					return Quote.findById(res.body.id);
				})
				.then(function(quote) {
					quote.quote.should.equal(newQuote.quote);
					quote.user.should.equal(newQuote.user);
					quote.reference.should.equal(newQuote.reference);
					quote.tags.should.equal(newQuote.description);
				});
		});
	});

	describe('PUT endpoint', function() {

		it('should update fields you send over', function() {
			const updateData = {
				quote: faker.lorem.sentence(), 
				user: faker.internet.email(),
				reference: faker.name.firstName() + faker.name.lastName(),
				tags:  faker.random.words()
			};

			return Quote
				.findOne()
				.exec()
				.then(function(quote) {
					updateData.id = quote.id;

					return chai
						.request(app)
						.put(`/social-quotes/${quote.id}`)
						.set('authorization', `Bearer ${token}`)
						.send(updateData);
				})
				.then(function(res) {
					res.should.have.status(204);

					return Quote.findById(updateData.id).exec();
				})
				.then(function(quote) {
					quote.quote.should.equal(updateData.quote);
					quote.reference.should.equal(updateData.reference);
					quote.tags.should.equal(updateData.tags);
				});
		});
	});

	describe('DELETE endpoint', function() {
		// strategy:
		//  1. get a restaurant
		//  2. make a DELETE request for that restaurant's id
		//  3. assert that response has right status code
		//  4. prove that restaurant with the id doesn't exist in db anymore
		it('delete a quote by id', function() {

			let quote;

			return Quote
				.findOne()
				.exec()
				.then(function(_quote) {
					quote = _quote;
					return chai
						.request(app)
						.delete(`/social-quotes/${quote.id}`)
						.set('authorization', `Bearer ${token}`);
				})
				.then(function(res) {
					res.should.have.status(204);
					return Quote
						.findById(quote.id)
						.exec();
				})
				.then(function(_quote) {
					// when a variable's value is null, chaining `should`
					// doesn't work. so `_restaurant.should.be.null` would raise
					// an error. `should.be.null(_restaurant)` is how we can
					// make assertions about a null value.
					should.not.exist(_quote);
				});
		});
	});
});

