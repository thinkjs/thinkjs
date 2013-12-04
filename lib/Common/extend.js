//该文件内容为原生对象的扩展

/**
 * 获取对象的值
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Object.values = function(obj){
    return Object.keys(obj).map(function(item){
        return obj[item];
    })
}
/**
 * 数组求和
 * @return {[type]} [description]
 */
Array.prototype.sum = function(){
	var count = 0;
	this.forEach(function(item){
		count += item;
	})
	return count;
}
