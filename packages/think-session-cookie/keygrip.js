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
   * Derive a key of the correct length for the current cipher from a password string.
   * @param {String|Buffer} password
   * @returns {Buffer}
   */
  _deriveKey(password) {
    const keyLen = parseInt(this.cipher.split('-')[1]) / 8;
    if (Buffer.isBuffer(password)) {
      if (password.length >= keyLen) return password.slice(0, keyLen);
      return Buffer.concat([password, Buffer.alloc(keyLen - password.length)]);
    }
    return crypto.createHash('sha256').update(String(password)).digest().slice(0, keyLen);
  }
  /**
   * crypto
   * @param {Object} cipher 
   * @param {String} data 
   */
  crypt(cipher, data){
    let text = cipher.update(data, 'utf8');
    let pad  = cipher.final();
    return Buffer.concat([text, pad]);
  }
  /**
   * encrypt a message
   * @param {String} data 
   * @param {Buffer} iv 
   * @param {String|Buffer} key 
   */
  encrypt(data, iv, key){
    key = key || this.keys[0];
    if (iv) {
      const derivedKey = Buffer.isBuffer(key) ? key : this._deriveKey(key);
      return this.crypt(crypto.createCipheriv(this.cipher, derivedKey, iv), data);
    }
    // Generate a random IV and prepend it to the ciphertext so decrypt can recover it
    const generatedIv = crypto.randomBytes(16);
    const derivedKey = this._deriveKey(key);
    const encrypted = this.crypt(crypto.createCipheriv(this.cipher, derivedKey, generatedIv), data);
    return Buffer.concat([generatedIv, encrypted]);
  }
  /**
   * decrypt message
   * @param {String|Buffer} data 
   * @param {Buffer} iv 
   * @param {String|Buffer} key 
   */
  decrypt(data, iv, key){
    if (!key) {
      // decrypt every key
      let keys = this.keys;
      for (let i = 0, l = keys.length; i < l; i++) {
        let message = this.decrypt(data, iv, keys[i]);
        if (message !== false) return [message, i];
      }
      return false;
    }
    try {
      if (iv) {
        const derivedKey = Buffer.isBuffer(key) ? key : this._deriveKey(key);
        return this.crypt(crypto.createDecipheriv(this.cipher, derivedKey, iv), data);
      }
      // The IV was prepended during encrypt — extract the first 16 bytes
      const extractedIv = data.slice(0, 16);
      const encryptedData = data.slice(16);
      const derivedKey = this._deriveKey(key);
      return this.crypt(crypto.createDecipheriv(this.cipher, derivedKey, extractedIv), encryptedData);
    } catch (err) {
      debug(err.stack);
      return false;
    }
  }
}
module.exports = Keygrip;