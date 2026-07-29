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
    // if (typeof text === 'string') {
    //   text = new Buffer(text, 'binary');
    //   pad  = new Buffer(pad, 'binary');
    // }
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
      : this.createLegacyCipher(key, false);

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
        : this.createLegacyCipher(key, true);
      return this.crypt(cipher, data);
    } catch (err) {
      debug(err.stack);
      return false
    }
  }
  /**
   * Reproduce the password-based key derivation used by the removed
   * crypto.createCipher/createDecipher APIs so existing cookies remain valid.
   * @param {String|Buffer} password
   * @param {Boolean} decrypt
   */
  createLegacyCipher(password, decrypt) {
    const cipherInfo = crypto.getCipherInfo(this.cipher);
    const passwordBuffer = Buffer.isBuffer(password)
      ? password
      : Buffer.from(password, 'binary');
    const length = cipherInfo.keyLength + cipherInfo.ivLength;
    let block = Buffer.alloc(0);
    let derived = Buffer.alloc(0);

    while (derived.length < length) {
      block = crypto.createHash('md5')
        .update(block)
        .update(passwordBuffer)
        .digest();
      derived = Buffer.concat([derived, block]);
    }

    const key = derived.slice(0, cipherInfo.keyLength);
    const iv = derived.slice(
      cipherInfo.keyLength,
      cipherInfo.keyLength + cipherInfo.ivLength
    );

    return decrypt
      ? crypto.createDecipheriv(this.cipher, key, iv)
      : crypto.createCipheriv(this.cipher, key, iv);
  }
}
module.exports = Keygrip;
