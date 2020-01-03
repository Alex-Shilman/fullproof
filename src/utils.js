const utils = require('util');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const { promisify } = utils;

const getKey = async pathToPKey => await promisify(fs.readFile)(pathToPKey, 'UTF-8');

const verifyToken = async token => {
  const cert = await getKey(path.join(__dirname, '..', 'keys', 'jwtRS256.key.pub'));
  const options = { algorithms: ['RS256'], issuer: 'auth0' };
  return new Promise(resolve => jwt.verify(token, cert, options, (error, decoded) => {
    if (error){
      resolve({ error });
    } else {
      resolve({error: null, decoded});
    }
  }));
};



module.exports = verifyToken;