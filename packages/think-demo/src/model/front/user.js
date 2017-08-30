module.exports = class extends think.Mongoose {
    get schema() {
      return {
        title:  String,
        author: String,
        body: String,
      }
    }
    getList() {
      return this.find();
    }
  }