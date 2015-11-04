'use strict';

/**
 * websocket configs 
 */

export default {
  on: false,
  type: 'socket.io',
  allow_origin: '',
  path: '', //url path for websocket
  messages: {
    // open: 'home/websocket/open',
  },
  adapter: {
    'socket.io': {
      adapter: undefined
    }
  }
};