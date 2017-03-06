module.exports = {
  /**
   * get or set configs
   */
  config: (name, value, m = this.module) => {
    return think.config(name, value, m);
  }
}