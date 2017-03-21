const crypto = require('crypto');
const debug = require('debug')('keygrip');

/**
 * Keygrip class
 * from https://github.com/crypto-utils/keygrip
 */
class Keygrip {
  /**
   * keys
   * @param {Array} keys 
   */
  constructor(keys){
    this.keys = keys;
    this.cipher = 'aes-256-cbc';
  }
  /**
   * crypto
   * @param {Object} cipher 
   * @param {String} data 
   */
  crypt(cipher, data){
    let text = cipher.update(data, 'utf8');
    let pad  = cipher.final();
    if (typeof text === 'string') {
      text = new Buffer(text, 'binary');
      pad  = new Buffer(pad, 'binary');
    }
    return Buffer.concat([text, pad]);
  }
  /**
   * encrypt a message
   * @param {String} data 
   * @param {String} iv 
   * @param {String} key 
   */
  encrypt(data, iv, key){
    key = key || this.keys[0];
    let cipher = iv
      ? crypto.createCipheriv(this.cipher, key, iv)
      : crypto.createCipher(this.cipher, key);

    return this.crypt(cipher, data);
  }
  /**
   * decrypt message
   * @param {String} data 
   * @param {String} iv 
   * @param {String} key 
   */
  decrypt(data, iv, key){
    if (!key) {
      // decrypt every key
      let keys = this.keys;
      for (let i = 0, l = keys.length; i < l; i++) {
        let message = this.decrypt(data, iv, keys[i]);
        if (message !== false) return [message, i];
      }
      return false
    }
    try {
      let cipher = iv
        ? crypto.createDecipheriv(this.cipher, key, iv)
        : crypto.createDecipher(this.cipher, key);
      return this.crypt(cipher, data);
    } catch (err) {
      debug(err.stack);
      return false
    }
  }
}
module.exports = Keygrip;