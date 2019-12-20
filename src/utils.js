const utils = require('util');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const { promisify } = utils;

const getKey = async pathToPKey => await promisify(fs.readFile)(pathToPKey, 'UTF-8');

const verifyToken = async token => {
  const cert = await getKey(path.join(__dirname, '..', 'keys', 'jwtRS256.key.pub'));
  return new Promise((resolve, reject) => jwt.verify(token, cert, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err){
      reject(err);
    } else {
      resolve(decoded);
    }
  }));
};



module.exports = verifyToken;