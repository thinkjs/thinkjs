/**
 * 默认配置
 * @type {Object}
 */
module.exports = {
    port: 8360, //监听的端口
    encoding: 'utf-8', //编码
    action_name_black_list: ["init", /^\_/], //不能通过URL访问的action名单
    app_tags_on: true, //是否支持标签功能
};