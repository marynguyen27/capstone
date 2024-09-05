pm.test('201 user registration', function () {
  pm.response.to.have.status(201);
});

pm.test('user ID after registration', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
});

pm.test('User email matches input', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.email).to.eql('user@example.com');
});

pm.test('200 fetching user details', function () {
  pm.response.to.have.status(200);
});

pm.test('array fetching users', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
});

pm.test('array is not empty', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.length).to.be.above(0);
});

pm.test('200 updating user details', function () {
  pm.response.to.have.status(200);
});

pm.test('User email is updated', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.email).to.eql('updateduser@example.com');
});

pm.test('204 user deletion', function () {
  pm.response.to.have.status(204);
});

pm.test('200 user login', function () {
  pm.response.to.have.status(200);
});

pm.test('token after login', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('token');
});

pm.test('user data after login', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.user.email).to.eql('user@example.com');
});

pm.test('401 access protected routes not allowed', function () {
  pm.response.to.have.status(401);
});

pm.test('403 attempt access user data not allowed', function () {
  pm.response.to.have.status(403);
});

pm.test('409 for duplicate email', function () {
  pm.response.to.have.status(409);
});

pm.test('error message duplicate email', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Email already exists');
});

pm.test('400 invalid email', function () {
  pm.response.to.have.status(400);
});

pm.test('error message invalid email', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Invalid email format');
});

pm.test('400 for missing fields', function () {
  pm.response.to.have.status(400);
});

pm.test('error message missing fields', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('email is required');
});

pm.test('200 fetching details', function () {
  pm.response.to.have.status(200);
});

pm.test('user details', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.email).to.eql('user@example.com');
  pm.expect(jsonData).to.have.property('name');
  pm.expect(jsonData).to.have.property('createdAt');
});
