/**
 * 系统标签配置
 * 可以在App/Conf/tag.js里进行修改
 * @type {Object}
 */
module.exports = {
    app_init: ["DenyIp"],
    app_begin: [],
    route_check: ['CheckRoute'],
    url_dispatch: [],
    app_end: [],
    path_info: [],
    action_begin: [],
    action_end: [],
    view_begin: [],
    view_template: ["LocationTemplate"],
    view_parse: ["ParseTemplate"],
    view_filter: [],
    view_end: [],
    before_res_end: []
}