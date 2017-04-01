'use strict';

const request = require('request');

function curl(...arg) {
  return new Promise((resolve, reject) => {
    request(...arg, (err, res, body) => {
      // console.log(arg[0])
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

module.exports = curl;