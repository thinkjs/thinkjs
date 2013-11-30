/**
 * 过滤器
 * @return {[type]} [description]
 */
var Filter = module.exports = {
	/**
	 * 分页
	 * @param  {[type]} value [description]
	 * @return {[type]}       [description]
	 */
	page: function(value){
		return this.id(value);
	},
	/**
	 * xxx asc,yyy desc
	 * @return {[type]} [description]
	 */
	order: function(value){
		if (is_string(value)) {
			value = value.split(",");
		};
		if (!is_array(value)) {
			return '';
		};
		return value.filter(function(item){
			item = item.split(" ");
			var field = item[0];
			var type = item[1];
			if (/^(ASC|DESC)$/i.test(type) && /^[\w]+$/.test(field)) {
				return field + " " + type;
			};
		}).join(",");
	},
	/**
	 * 大于0
	 * @return {[type]} [description]
	 */
	id: function(value){
		var value = parseInt(value + "", 10);
		if (value > 0) {
			return value;
		};
		return 0;
	},
	/**
	 * id列表
	 * @return {[type]} [description]
	 */
	ids: function(value){
		if (is_string(value)) {
			value = value.split(",");
		};
		if (!is_array(value)) {
			return [];
		};
		return value.filter(function(item){
			item = item.trim();
			item = parseInt(item, 10);
			if (item > 0) {
				return item;
			};
		})
	},
	/**
	 * 是否在一个中
	 * @param  {[type]} value [description]
	 * @param  {[type]} arr   [description]
	 * @return {[type]}       [description]
	 */
	in: function(value, arr){
		if (!is_array(arr)) {
			arr = [arr];
		};
		return arr.indexOf(value) > -1;
	}
}
/**
 * 调用一个过滤器
 * @param  {[type]} data [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
Filter.filter = function(value, type){
	var fn = Filter[type];
	if (typeof fn == 'function') {
		var args = [].slice.call(arguments, 2);
		return Filter[type].apply(Filter, args);
	};
	return false;
}