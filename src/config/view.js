'use strict';

/**
 * view configs
 */
export default {
  type: 'ejs',
  content_type: 'text/html',//send content type when write view content
  file_ext: '.html', //file extension
  file_depr: '_', // file depr between controller and action
  root_path: '', //view root path
  
  adapter: {
    ejs: {

    }
  }
};