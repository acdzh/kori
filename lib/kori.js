var qs = require('qs');
var parse = require('url-parse');
var Trie = require('./trie');

const methods = [
  'get', 'post', 'put', 'head', 'delete',
  'options', 'trace', 'copy', 'lock', 'mkcol',
  'move', 'purge', 'propfind', 'proppatch', 'unlock',
  'report', 'mkactivity', 'checkout', 'merge', 'm-search',
  'notify', 'subscribe', 'unsubscribe', 'patch', 'search', 'connect',
];

/**
*
* @constructor
*/
function Kori(base) {
  this.methods = Object.create(null);
}

/**
* set a route, support chain call.
*
* @param {String} path
* @param {String} method case insensitive。
* @param {Function} callback callback function.
*/
Kori.prototype._setRouter = function(path, method, callback) {
  if(!this.methods[method]) this.methods[method] = new Trie();
  this.methods[method].addRouter(path, callback);
  return this;
};

/**
* handle a function request
*
* @param {String} path
* @param {String} method case insensitive.
* @param {Object[]} ...args transparent transmission parameters.
*/
Kori.prototype.handle = function(url, method, ...args) {
  const parsedUrl = parse(url);
  const {pathname: path, query} = parsedUrl;
  method = method.toLowerCase();

  const trie = this.methods[method];
  if (!trie) { 
    throw new Error('not match');
    return;
  }

  const result = trie.getRouter(path);
  if (!result.node) {
    throw new Error('not match');
    return;
  }

  const { node, keys, splat }= result;
  const callback = node.callback;
  return callback({
    url,
    path,
    match: node.getUrl(),
    keys, 
    splat, 
    query: qs.parse(query.slice(1)),
    method,
  }, ...args);
};

methods.forEach(method => {
  Kori.prototype[method] = function(path, callback) {
    return this._setRouter(path, method, callback);
  }
});

module.exports = Kori;