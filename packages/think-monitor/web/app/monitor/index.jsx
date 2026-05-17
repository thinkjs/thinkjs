import React from 'react';
global.React = React;
import {render} from 'react-dom';
import {Router} from 'react-router';
import RBAuthRoute from 'components/auth-route';

import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';

const browserHistory = useRouterHistory(createHistory)({
  basename: "/monitor"
});

const rootRoute = RBAuthRoute({
  path: '/',
  indexRoute: { onEnter: (nextState, replace) => replace('/dashboard') },
  chunkLoader(cb) {
    cb(
      require('./home'),
      require('./routes/dashboard/index')
    );
  }
});

render(
  <Router history={browserHistory} routes={rootRoute}/>,
  document.getElementById('app')
);
