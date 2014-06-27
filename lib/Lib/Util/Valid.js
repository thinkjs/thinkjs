/**
 * Valid类
 * @return {[type]} [description]
 */
var net = require('net');
var Valid = module.exports = Class(function(){
    'use strict';
    return {
        field: '',
        init: function(field){
            this.field = field;
        },
        /**
         * 长度区域
         * @param  {[type]} min [description]
         * @param  {[type]} max [description]
         * @return {[type]}     [description]
         */
        length: function(min, max){
            min = min | 0;
            var length = this.field.length;
            if (length < min) {
                return false;
            }
            if (max) {
                if (length > max) {
                    return false;
                }
            }
            return true;
        },
        /**
         * 必填
         * @return {[type]} [description]
         */
        required: function(){
            return (this.field + '').length > 0;
        },
        /**
         * 自定义正则校验
         * @param  {[type]} reg [description]
         * @return {[type]}     [description]
         */
        regexp: function(reg){
            return reg.test(this.field);
        },
        /**
         * 邮箱
         * @return {[type]} [description]
         */
        email: function(){
            return this.regexp(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/);
        },
        /**
         * 时间戳
         * @return {[type]} [description]
         */
        time: function(){
            return this.regexp(/^(([0-1]\d)|(2[0-3])):[0-5]\d:[0-5]\d$/);
        },
        /**
         * 中文名
         * @return {[type]} [description]
         */
        cnname: function(){
            return this.regexp(/^[\u4e00-\u9fa5a-zA-Z.\u3002\u2022]{2,32}$/);
        },
        /**
         * 身份证号码
         * @return {[type]} [description]
         */
        idnumber: function(){
            if (/^\d{15}$/.test(this.field)) {
                return true;
            }
            if ((/^\d{17}[0-9xX]$/).test(this.field)) {
                var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','),
                    ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','),
                    ss = this.field.toLowerCase().split(''),
                    r = 0;
                for (var i = 0; i < 17; i++) {
                    r += ps[i] * ss[i];
                }
                var isOk = (vs[r % 11] === ss[17]);
                return isOk;
            }
            return false;
        },
        /**
         * 手机号
         * @return {[type]} [description]
         */
        mobile: function(){
            return this.regexp(/^(13|15|18|14)\d{9}$/);
        },
        /**
         * 邮编
         * @return {[type]} [description]
         */
        zipcode: function(){
            return this.regexp(/^\d{6}$/);
        },
        /**
         * 2次值是否一致
         * @param  {[type]} field [description]
         * @return {[type]}       [description]
         */
        confirm: function(field){
            return this.field === field;
        },
        /**
         * url
         * @return {[type]} [description]
         */
        url: function(){
            return this.regexp(/^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/);
        },
        /**
         * 整数
         * @param  {[type]} o [description]
         * @return {[type]}   [description]
         */
        int: function(){
            var value = parseInt(this.field, 0 || 10);
            if (isNaN(value)) {
                return false;
            }
            return (value + '').length === this.field.length;
        },
        /**
         * 浮点数
         * @return {[type]} [description]
         */
        float: function(){
            var value = parseFloat(this.field);
            if (isNaN(value)) {
                return false;
            }
            return (value + '').length === this.field.length;
        },
        /**
         * 整数范围
         * @param  {[type]} min [description]
         * @param  {[type]} max [description]
         * @return {[type]}     [description]
         */
        range: function(min, max){
            var isInt = this.int();
            if (!isInt) {
                return false;
            }
            return this.field >= min && this.field <= max;
        },
        /**
         * ip4校验
         * @return {[type]} [description]
         */
        ip4: function(){
            return net.isIPv4(this.field);
        },
        /**
         * ip6校验
         * @return {[type]} [description]
         */
        ip6: function(){
            return net.isIPv6(this.field);
        },
        /**
         * ip校验
         * @return {[type]} [description]
         */
        ip: function(){
            return net.isIP(this.field);
        },
        /**
         * 日期校验
         * @return {[type]} [description]
         */
        date: function(){
            var reg = /^\d{4}-\d{1,2}-\d{1,2}$/;
            return this.regexp(reg);
        }
    };
});
/**
 * data格式
 * [{
 *     value: xxx,
 *     name: '',
 *     valid: ['required', 'range'],
 *     range_args: [],
 *     msg:{
 *         required: '',
 *         range: ''
 *     }
 * },{
 *     value: xxx,
 *     name: '',
 *     valid: ['required', 'range'],
 *     range_args: [],
 *     msg:{
 *         required: '',
 *         range: ''
 *     }
 * }]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Valid.check = function(data){
    'use strict';
    data = data ||[];
    var result = {};
    data.forEach(function(item){
        var valid = item.valid;
        if (!isArray(valid)) {
            valid = [valid];
        }
        var instance = Valid(item.value);
        valid.some(function(validItem){
            var flag;
            if (typeof validItem === 'function') {
                flag =  validItem(item.value, item);
                if (typeof flag === 'string') {
                    result[item.name] = flag;
                    return true;
                }
                return false;
            }
            flag = instance[validItem].apply(instance, item[validItem + '_args'] || []);
            if (!flag) {
                result[item.name] = item.msg[validItem];
                return true;
            }
        });
    });
    return result;
};