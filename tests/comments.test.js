const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

// comment creation
pm.test('201 for comment creation', function () {
  pm.response.to.have.status(201);
});

pm.test('contains comment ID and review ID', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
  pm.expect(jsonData).to.have.property('reviewId');
});

// fetch comments by review ID
pm.test('200 for fetching comments', function () {
  pm.response.to.have.status(200);
});

pm.test('an array of comments', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
  pm.expect(jsonData.length).to.be.above(0);
  pm.expect(jsonData[0]).to.have.property('text');
});

// updating a comment
pm.test('200 for comment update', function () {
  pm.response.to.have.status(200);
});

pm.test('Updated comment text', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.text).to.eql('Updated comment text');
});

// comment deletion
pm.test('204 for comment deletion', function () {
  pm.response.to.have.status(204);
});

// unauthorized access
pm.test('403 for comment modification by unauth user', function () {
  pm.response.to.have.status(403);
});

pm.test('403 for unauthorized comment deletion', function () {
  pm.response.to.have.status(403);
});

// bad requests
pm.test('400 missing comment text', function () {
  pm.response.to.have.status(400);
});

pm.test('error missing text', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('Comment text is required');
});

pm.test('400 invalid data format', function () {
  pm.response.to.have.status(400);
});

pm.test('error message for invalid format', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('Invalid data format');
});

// comment ID doesnt exist
pm.test('404 for comment id doesnt exist', function () {
  pm.response.to.have.status(404);
});

pm.test('error message for non-existent comment id', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Comment not found');
});
