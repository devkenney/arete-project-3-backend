require('dotenv').config()
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const axios = require('axios');
const crypto = require('crypto');
const base = "https://gateway.marvel.com:443/v1/public/"
const publicKey = "apikey=14c064fd7330d35f8c084637daeb2aa8"

const getDataById = async (type, id, timestamp, hash) => {
  const response = await axios.get(`${base}${type}/${id}?ts=${timestamp}&${publicKey}&hash=${hash}`);
  return response.data;
}

const getDataByType = async (type, timestamp, hash, pageNum) => {
  const offset = pageNum * 10;
  const response = await axios.get(`${base}${type}?orderBy=name&limit=10&offset=${offset}&ts=${timestamp}&${publicKey}&hash=${hash}`)
  return response.data;
}

router.get('/:type', async (req, res) => {
  const timestamp = Date.now();
  let apiKeyHash = (timestamp + process.env.PRIVATE_KEY + '14c064fd7330d35f8c084637daeb2aa8');
  apiKeyHash = crypto.createHash('md5').update(apiKeyHash).digest("hex");
  const returnedData = await getDataByType(req.params.type, timestamp, apiKeyHash, req.query.page)
  res.send(returnedData);
});

router.get('/:type/:id', async (req, res) => {
  const timestamp = Date.now();
  let apiKeyHash = (timestamp + process.env.PRIVATE_KEY + '14c064fd7330d35f8c084637daeb2aa8')
  apiKeyHash = crypto.createHash('md5').update(apiKeyHash).digest("hex");
  console.log(apiKeyHash);
  const returnedData = await getDataById(req.params.type, req.params.id, timestamp, apiKeyHash);
  res.send(returnedData);
});

module.exports = router;