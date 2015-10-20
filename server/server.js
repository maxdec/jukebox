import express from 'express';
import http from 'http';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';

import config from './config';
import api from './api';
import socket from './socket';

const app = express();
const httpServer = http.Server(app);

// Use this middleware to set up hot module reloading via webpack.
const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

api(app);
socket(http);

httpServer.listen(config.port, () => console.log('✔ App listening on port', config.port));
