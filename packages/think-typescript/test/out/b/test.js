/*
* @Author: lushijie
* @Date:   2017-02-15 10:22:00
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 10:22:21
*/
"use strict";
var Student = (function () {
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
    return Student;
}());
function greeter(person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
var user = new Student("Jane", "M.", "User");
//# sourceMappingURL=test.js.map