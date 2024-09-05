pm.test('201 for review creation', function () {
  pm.response.to.have.status(201);
});

pm.test('review ID', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
});

pm.test('review text matches input', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.text).to.eql('sample review');
});

pm.test('200 fetching reviews', function () {
  pm.response.to.have.status(200);
});

pm.test('array of reviews', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
});

pm.test('array isnt empty', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.length).to.be.above(0);
});

pm.test('200 updating a review', function () {
  pm.response.to.have.status(200);
});

pm.test('review text matches', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.text).to.eql('Updated review text');
});

pm.test('204 review deletion', function () {
  pm.response.to.have.status(204);
});

pm.test('409 duplicate review', function () {
  pm.response.to.have.status(409);
});

pm.test('error duplicate review', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('User has already reviewed this item');
});

pm.test('200 fetching user reviews', function () {
  pm.response.to.have.status(200);
});

pm.test('reviews written by the user', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
  pm.expect(jsonData.length).to.be.above(0);
  pm.expect(jsonData[0]).to.have.property('text');
});

pm.test('204 review deletion', function () {
  pm.response.to.have.status(204);
});

pm.test('200 review update', function () {
  pm.response.to.have.status(200);
});

pm.test('review text is correct', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.text).to.eql('Updated review text');
});

pm.test('404 non-existent review ID', function () {
  pm.response.to.have.status(404);
});

pm.test('error message for non-existent review', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Review not found');
});

pm.test('400 missing review text', function () {
  pm.response.to.have.status(400);
});

pm.test('missing review text', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('Review text is required');
});

pm.test('invalid rating', function () {
  pm.response.to.have.status(400);
});

pm.test('error message for invalid rating', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('Invalid rating');
});
