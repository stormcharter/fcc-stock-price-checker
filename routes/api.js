'use strict';

const axios = require("axios");
const Stock = require("../models/Stock");
const crypto = require("crypto");

function hashIP(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

async function getStockData(symbol, ipHash, likeFlag) {
  const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
  const price = response.data.latestPrice;
  const stock = response.data.symbol;

  let record = await Stock.findOne({ stock });

  if (!record) {
    record = new Stock({ stock, likes: 0, ipHashes: [] });
  }

  if (likeFlag && !record.ipHashes.includes(ipHash)) {
    record.likes += 1;
    record.ipHashes.push(ipHash);
    await record.save();
  }

  return {
    stock,
    price,
    likes: record.likes
  };
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      let { stock, like } = req.query;
      const ipHash = hashIP(req.ip);
      const likeFlag = like === 'true' || like === true;

      if (!stock) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      try {
        if (Array.isArray(stock)) {
          const [data1, data2] = await Promise.all([
            getStockData(stock[0], ipHash, likeFlag),
            getStockData(stock[1], ipHash, likeFlag)
          ]);

          const rel_likes_1 = data1.likes - data2.likes;
          const rel_likes_2 = data2.likes - data1.likes;

          return res.json({
            stockData: [
              {
                stock: data1.stock,
                price: data1.price,
                rel_likes: rel_likes_1
              },
              {
                stock: data2.stock,
                price: data2.price,
                rel_likes: rel_likes_2
              }
            ]
          });
        } else {
          const data = await getStockData(stock, ipHash, likeFlag);

          return res.json({
            stockData: {
              stock: data.stock,
              price: data.price,
              likes: data.likes
            }
          });
        }
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch stock data' });
      }
    });

};
