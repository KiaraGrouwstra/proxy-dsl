let { pathProxy } = require('./path-proxy.js');
let { cloneFn } = require('./helpers.js');

let pathHandler = {};

pathHandler.apply = (target, that, args) => {
  return target.apply(that, [target.path, ...args]);
}

pathHandler.get = (target, prop) => {
  if (prop in target) {
    // potentially legitimate property access, forward (leave Proxy)
    return target[prop];
  } else {
    // proxied property access
    let val = cloneFn(target);
    val.path = target.path.concat(prop);
    return new Proxy(val, pathHandler);
  }
};

module.exports.pathProxy = (fn) => {
  let target = cloneFn(fn);
  target.path = [];
  return new Proxy(target, pathHandler);
}
