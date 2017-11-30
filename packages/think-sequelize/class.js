/*
* @Author: lushijie
* @Date:   2017-08-27 11:59:10
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-27 18:08:33
*/
class A {
  constructor(...props) {
    super(...props);
  }
  seq() {
    console.log(12313);
  }
}
A.test = function() {
  console.log('test');
}



class B extends A {
  constructor(...props) {
    super(...props);
  }

  test() {
    console.log(this.test);
    console.log(this.seq)
  }
}

let b = new B();
b.test();
