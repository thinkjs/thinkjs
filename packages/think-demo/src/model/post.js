module.exports = class extends think.Model {
    getList(){
        return this.select();
    }
}