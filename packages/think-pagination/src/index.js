'use strict';

/**
 * get page url
 * @param  {Object} options []
 * @param  {Object} http    []
 * @return {String}         []
 */
let getPageUrl = (options, http) => {
  let pageUrl = options.url;
  if(!pageUrl){
    let prefix = (options.prefix||'') + '?';
    let querys = [];
    for(let name in http.query){
      if(name === 'page'){
        continue;
      }
      querys.push(think.escapeHtml(name) + '=' + think.escapeHtml(http.query[name]));
    }
    prefix += querys.join('&');
    if(querys.length){
      prefix += '&';
    }
    pageUrl = prefix + 'page=${page}';
  }
  return pageUrl;
};

/**
 * get page index
 * @param  {Object} pagerData []
 * @param  {Object} options   []
 * @return {Array}           []
 */
let getPageIndex = (pagerData, options) => {
  let num = options.pageNum || 2;
  let page = pagerData.currentPage | 0 || 1;
  let totalPages = pagerData.totalPages;
  let pageIndex = [];
  let start = page - num;
  let stop = page + num;

  if(start <= 1) {
    start = 1;
    stop = start + num * 2 + 1;
  }

  if(stop >= totalPages) {
    stop = totalPages;
    start = totalPages - num * 2 - 1;
  }

  for (let i = start; i <= stop; i++) {
    if (i >= 1 && i <= totalPages) {
      pageIndex.push(i);
    }
  }
  return pageIndex;
};

/**
 * thinkjs pagenation for ejs
 * @param  {Object} pagerData [pagerData by countSelect]
 * @param  {Object} http      []
 * @param  {Object} options   []
 * @return {String}           []
 */
module.exports = (pagerData, http, options) => {

  if(pagerData.totalPages <= 1){
    return '';
  }

  options = think.extend({
    desc: false, //show desc
    pageNum: 2,
    url: '',
    class: '',
    text: {
      next: 'Next',
      prev: 'Prev',
      total: 'count: ${count} , pages: ${pages}'
    }
  }, options);

  let pageUrl = getPageUrl(options, http);
  let currentPage = pagerData.currentPage | 0 || 1;

  let html = `<ul class="pagination">`;
  if(options.class){
    html = `<ul class="pagination ${options.class}">`;
  }
  if(options.desc){
    let total = options.text.total.replace('${count}', pagerData.count).replace('${pages}', pagerData.totalPages);
    html += `<li class="disabled"><span>${total}</span></li>`;
  }
  if(currentPage > 1){
    html += `<li class="prev"><a href="${pageUrl.replace('${page}', currentPage - 1)}">${options.text.prev}</a></li>`;
  }

  let pageIndex = getPageIndex(pagerData, options);
  if(pageIndex[0] > 1){
    html += `<li><a href="${pageUrl.replace('${page}', 1)}">1</a></li>`;
  }
  if(pageIndex[0] > 2){
    html += `<li class="disabled"><span>...</span></li>`;
  }

  for (let i = 0, length = pageIndex.length; i < length; i++) {
    let p = pageIndex[i];
    if (p === currentPage) {
      html += `<li class="active"><a href="${pageUrl.replace('${page}', p)}">${p}</a></li>`;
    } else { 
      html += `<li><a href="${pageUrl.replace('${page}', p)}">${p}</a></li>`;
    }
  }
  if (pageIndex.length > 1) {
    let last = pageIndex[pageIndex.length - 1];
    if (last < (pagerData.totalPages - 1)) { 
      html += `<li class="disabled"><span>...</span></li>`;
    }
    if (last < pagerData.totalPages) { 
      html += `<li><a href="${pageUrl.replace('${page}', pagerData.totalPages)}">${pagerData.totalPages}</a></li>`;
    }
  }
  if (currentPage < pagerData.totalPages) {
    html += `<li class="next"><a href="${pageUrl.replace('${page}', currentPage + 1)}">${options.text.next}</a></li>`;
  }
  return html;
};
