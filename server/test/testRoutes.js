const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));
chai.use(require('chai-json-schema-ajv'))
const app = require('../app');
const apiAddress = "http://localhost:3000";
const apiPort = 3000;
const userSchema = require('./schemas/userSchema.json');

/**
 * Not that these tests don't make sure the database is empty. This has to be done manually.
 * The test will create a new user "tester" and assume this user does not exist.
 * The test will create a new item, but assumes this item gets id = 1 in the database.
 * This will only happen with a new table.
 */

describe('Testing all the functionality for the web-interfaces graded exercise server.', function() {
    this.timeout(5000); // google & Cloudinary APIs sometimes need longer than the default 2s

    let serverInstance = null;
    before(function () {
        // start the server
        console.log("Start server...")
        serverInstance = app.listen(apiPort, () => {
            console.log('server listening at http://localhost:' + apiPort);
        });
    });
    
    after(function () {
        // close the server
        console.log('Test finished. Close server...')
        serverInstance.close();
    })

    describe('Testing route /', function() {
        it('Should return successfull response', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress).get('/')
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Testing user creation -> POST /users & GET /users/validation/newUser/:username/:validationKey', function() {
        it('Should create a new user with correct request', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester",
                    password: "1234",
                    email: "spammail-account@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(201);
                return chai.request(response.body.link).get('/');
            })
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user with dublicate username', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester",
                    password: "1234",
                    email: "spammail-account2@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(409);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user with dublicate email', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester2",
                    password: "1234",
                    email: "spammail-account@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(409);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user request missing a username', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    password: "1234",
                    email: "spammail-account2@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user request missing an email', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester2",
                    password: "1234"
                })
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user request missing a password', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester2",
                    email: "spammail-account2@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject a new user request with an invalid email', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester2",
                    password: "1234",
                    email: "notAnEmail"
                })
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should create another user', async function() {
            await chai.request(apiAddress)
                .post('/users')
                .send({
                    username: "tester2",
                    password: "1234",
                    email: "spammail-account2@gmx.de"
                })
            .then(response => {
                expect(response).to.have.status(201);
                return chai.request(response.body.link).get('/');
            })
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Testing GET /users', function () {
        it('Should return the user with matching username', async function(){
            await chai.request(apiAddress).get('/users?username=tester')
            .then(response => {
                expect(response.status).to.equal(200);
                // validate response body with JSON Schema
                expect(response.body.user).to.be.jsonSchema(userSchema);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should return the user with matching email', async function(){
            await chai.request(apiAddress).get('/users?email=spammail-account@gmx.de')
            .then(response => {
                expect(response.status).to.equal(200);
                // validate response body with JSON Schema
                expect(response.body.user).to.be.jsonSchema(userSchema);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should return the user with matching id', async function(){
            await chai.request(apiAddress).get('/users?id=1')
            .then(response => {
                expect(response.status).to.equal(200);
                // validate response body with JSON Schema
                expect(response.body.user).to.be.jsonSchema(userSchema);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should not work without specified user', async function(){
            await chai.request(apiAddress).get('/users')
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should return status 404 if no user is found', async function(){
            await chai.request(apiAddress).get('/users?username=wrongName')
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Testing Log In -> POST /login', function () {
        it('Should log in a user with correct username + password', async function(){
            await chai.request(apiAddress)
                .post('/login')
                .auth('tester', '1234')
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT log in a user with wrong username', async function(){
            await chai.request(apiAddress)
                .post('/login')
                .auth('tester123', '1234')
            .then(response => {
                expect(response).to.have.status(401);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT log in a user with wrong password', async function(){
            await chai.request(apiAddress)
                .post('/login')
                .auth('tester', 'notThePw')
            .then(response => {
                expect(response).to.have.status(401);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Test post new item. POST /products', function() {
        it('Should create a new item from the input.', async function(){
            await chai.request(apiAddress)
                .post('/products')
                .auth('tester', '1234')
                .type('form')
                .field('title', 'A Title')
                .field('description', 'A Description')
                .field('category', 'tags')
                .field('location', 'city, street')
                .field('price', 10)
                .field('delivery', 'UPS')
                .attach('images', './test/assets/eins.png')
                .attach('images', './test/assets/zwei.png')
            .then(response => {
                expect(response).to.have.status(201);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should not create new item without a title.', async function(){
            await chai.request(apiAddress)
                .post('/products')
                .auth('tester', '1234')
                .type('form')
                .field('description', 'A Description')
                .field('category', 'tags')
                .field('location', 'city, street')
                .field('price', 10)
                .field('delivery', 'UPS')
                .attach('images', './test/assets/eins.png')
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should not create new item without a registered owner.', async function(){
            await chai.request(apiAddress)
                .post('/products')
                .type('form')
                .field('title', 'A Title')
                .field('description', 'A Description')
                .field('category', 'tags')
                .field('location', 'city, street')
                .field('price', 10)
                .field('delivery', 'UPS')
                .attach('images', './test/assets/eins.png')
            .then(response => {
                expect(response).to.have.status(401);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Test get items. GET /products', function () {
        it('Should return a list of products matching the search criteria', async function () {
            await chai.request(apiAddress).get('/products')
            .then(response => {
                expect(response.body).to.have.property('products');
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Test changing a product. PUT /products/:id', async function () {
        it('Should change the specified item', async function () {
            await chai.request(apiAddress).put('/products/1')
                .auth('tester', '1234')
                .send({
                    title: "new title",
                    description : 'new description',
                })
            .then(response => {
                expect(response).to.have.status(200)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should change the attached pictures', async function () {
            await chai.request(apiAddress).put('/products/1')
                .auth('tester', '1234')
                .attach('images', './test/assets/drei.png')
            .then(response => {
                expect(response).to.have.status(201)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT change the specified item without item owner', async function () {
            await chai.request(apiAddress).put('/products/1')
                .send({
                    title: "new title",
                    description : 'new description',
                })
            .then(response => {
                expect(response).to.have.status(401)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT change the specified item without CORRECT item owner', async function () {
            await chai.request(apiAddress).put('/products/1')
                .auth('tester2', '1234')
                .send({
                    title: "new title",
                    description : 'new description',
                })
            .then(response => {
                expect(response).to.have.status(403)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should return 404 if there is no item with matching id', async function () {
            await chai.request(apiAddress).put('/products/2')
                .auth('tester', '1234')
                .send({
                    title: "new title",
                    description : 'new description',
                })
            .then(response => {
                expect(response).to.have.status(404)
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Test deleting a product. DELETE /products/:id', async function () {
        it('Should NOT delete the specified item without owner', async function () {
            await chai.request(apiAddress).delete('/products/1')
            .then(response => {
                expect(response).to.have.status(401)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT delete the specified item without CORRECT owner', async function () {
            await chai.request(apiAddress).delete('/products/1')
                .auth('tester2', '1234')
            .then(response => {
                expect(response).to.have.status(403)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should delete the specified item', async function () {
            await chai.request(apiAddress).delete('/products/1')
                .auth('tester', '1234')
            .then(response => {
                expect(response).to.have.status(204)
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should respond 404 if there is no matching item', async function () {
            await chai.request(apiAddress).delete('/products/1')
                .auth('tester', '1234')
            .then(response => {
                expect(response).to.have.status(404)
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Test changing a users information. PUT /users', function () {
        it('Should change the password of a user', async function(){
            await chai.request(apiAddress)
                .put('/users')
                .auth('tester', '1234')
                .send({ 
                    password: '12345'
                })
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should change the email address of a user', async function(){
            await chai.request(apiAddress)
                .put('/users')
                .auth('tester', '12345')
                .send({ 
                    email: 'foo@bar.com'
                })
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject an invalid email', async function(){
            await chai.request(apiAddress)
                .put('/users')
                .auth('tester', '12345')
                .send({ 
                    email: 'notAnEmail'
                })
            .then(response => {
                expect(response).to.have.status(400);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should reject an email, that is already in use', async function(){
            await chai.request(apiAddress)
                .put('/users')
                .auth('tester', '12345')
                .send({ 
                    email: 'spammail-account2@gmx.de'
                })
            .then(response => {
                expect(response).to.have.status(409);
            })
            .catch(error => {
                throw error;
            })
        })
        it('Should NOT work without authorization', async function(){
            await chai.request(apiAddress)
                .put('/users')
                .auth('tester', '1234')
                .send({ 
                    password: '12345'
                })
            .then(response => {
                expect(response).to.have.status(401);
            })
            .catch(error => {
                throw error;
            })
        })
    })

    describe('Testing password reset -> POST /users/restore & GET /users/validation/restorePw/:username/:validationKey', function() {
        it('Should reset the password of a user with correct request', async function() {
            // prepare http request
            // send the request to our server
            await chai.request(apiAddress)
                .post('/users/restore')
                .send({
                    email: "foo@bar.com"
                })
            .then(response => {
                expect(response).to.have.status(201);
                return chai.request(response.body.link).get('/');
            })
            .then(response => {
                expect(response).to.have.status(200);
            })
            .catch(error => {
                throw error;
            })
        })
    })

})