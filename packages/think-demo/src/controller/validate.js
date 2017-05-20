module.exports = class extends think.Controller {
  __before() {
    //console.log('__before')
  }
  async __call() {
    await this.display('validate_index');
  }
  __after() {
    //console.log('__after')
  }
}
