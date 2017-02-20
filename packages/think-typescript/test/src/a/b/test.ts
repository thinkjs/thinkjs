/*
* @Author: lushijie
* @Date:   2017-02-15 10:22:00
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 10:22:21
*/

class Student {
    fullName: string;
    constructor(public firstName, public middleInitial, public lastName) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person : Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}

var a == 123;
var user = new Student("Jane", "M.", "User");
