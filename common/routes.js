import React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import Current from './containers/Current';
import History from './containers/History';

export default (
  <Route path="/" component={App}>
    <Route path="/history" component={RepoPage} />
    <Route path="/:login" component={UserPage} />
  </Route>
);
