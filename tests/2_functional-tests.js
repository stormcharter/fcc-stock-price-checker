'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

describe('Functional Tests', function() {
  this.timeout(5000);

  describe('GET /api/stock-prices', function() {

    it('Viewing one stock: GET request to /api/stock-prices/', function(done) {
      chai.request(server)
        .get('/api/stock-prices?stock=GOOG') // <-- Параметры прямо в URL
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body.stockData);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.exists(res.body.stockData.price);
          assert.exists(res.body.stockData.likes);
          done();
        });
    });

    let likes;

    it('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
      chai.request(server)
        .get('/api/stock-prices?stock=MSFT&like=true') // <-- Параметры прямо в URL
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.isAtLeast(res.body.stockData.likes, 1);
          likes = res.body.stockData.likes;
          done();
        });
    });

    it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
      chai.request(server)
        .get('/api/stock-prices?stock=MSFT&like=true') // <-- Параметры прямо в URL
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.equal(res.body.stockData.likes, likes); // Убеждаемся, что лайки не увеличились
          done();
        });
    });

    it('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
      chai.request(server)
        // Для двух акций передаем два параметра 'stock'
        .get('/api/stock-prices?stock=AMZN&stock=AAPL')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.lengthOf(res.body.stockData, 2);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes');
          done();
        });
    });

    it('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
      chai.request(server)
        .get('/api/stock-prices?stock=SPOT&stock=PINS&like=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.lengthOf(res.body.stockData, 2);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes');
          done();
        });
    });

  });
});