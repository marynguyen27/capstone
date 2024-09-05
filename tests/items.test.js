pm.test('201 for item creation', function () {
  pm.response.to.have.status(201);
});

pm.test('item ID after creation', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
});

pm.test('item name matches input', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.name).to.eql('Example Item');
});

pm.test('200 for fetching all items', function () {
  pm.response.to.have.status(200);
});

pm.test('array of items', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
});

pm.test('array is not empty', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.length).to.be.above(0);
});

pm.test('200 for updating an item', function () {
  pm.response.to.have.status(200);
});

pm.test('item name matches input', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.name).to.eql('Updated Item');
});

pm.test('204 for successful item deletion', function () {
  pm.response.to.have.status(204);
});

pm.test('200 for searching items', function () {
  pm.response.to.have.status(200);
});

pm.test('items matching search query', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an('array');
  pm.expect(jsonData.length).to.be.above(0);
  pm.expect(jsonData[0].name).to.include('searchQuery');
});

pm.test('200 fetching item details', function () {
  pm.response.to.have.status(200);
});

pm.test('item details including average rating', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('averageScore');
  pm.expect(jsonData.averageScore).to.be.a('number');
});

pm.test('200 fetching item details', function () {
  pm.response.to.have.status(200);
});

pm.test('all relevant item details', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('name');
  pm.expect(jsonData).to.have.property('description');
  pm.expect(jsonData).to.have.property('category');
});

pm.test('400 missing required fields', function () {
  pm.response.to.have.status(400);
});

pm.test('error message for missing fields', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.include('name is required!');
});

pm.test('400 for invalid data format', function () {
  pm.response.to.have.status(400);
});

pm.test('Rerror message for invalid format', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Invalid data format!');
});

pm.test('404 for doesnt exist item ID', function () {
  pm.response.to.have.status(404);
});

pm.test('error message for nonexistent item', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.error).to.eql('Item not found!');
});
