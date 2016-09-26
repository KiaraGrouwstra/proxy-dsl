let R = require('ramda');
let { INTERNAL_METHODS, INTERNALIZE_METHODS } = require('./constants');
let { isObject, externalize, internalize, follow, followPath } = require('../src/cycle');
let { bindFn } = require('../src/async-proxy');
let ser = require('./refs').JSONPointer;
let { defWriteCb } = require('./constants');

// caches used:
// externalize:
// - map: Map (ref: Object|Array => id: string)
// - obj: {} (id: string => ref: Object|Array)
// - path2id: {} (path: string => id: string)
// extern-proxy:
// - intCache: {} (path: string => ref: Object|Array)
// - pathCache: WeakMap (ref: Object|Array => path: string)

// the proxy's trap handler
function externProxy(ext, writeCb = defWriteCb) {
  // TODO: use writeCb?
  let intCache = {};
  let pathCache = new WeakMap();
  let { root, map, obj, path2id } = ext;
  console.log({ root, map, obj, path2id });
  let flw = follow(obj);
  let makeProxy = (v, path = ser.init) => { //[]
    let proxy = new Proxy(v, externHandler); // { path }  //() =>
    pathCache.set(v, path); // || '/'
    return proxy;
  }

  let externHandler = {
    // function invocation
    apply: (target, that, args) => {
    // apply: (targetFn, that, args) => {
    //   let target = targetFn();
      // must wrap Proxy target in functions for this `apply` trap :(
      if(typeof target == 'function') {
        // actual function: no-op, ditch proxy
        return target.apply(that, args);
      } else {
        // regular value; release from proxy
        return target;
      }
    },
    // property access
    get: (target, prop) => {
    // get: (targetFn, prop) => {
    //   let target = targetFn();
      // console.log('get', prop); //, target
      let isSymbol = typeof prop == 'symbol';
      if(!pathCache.has(target)) throw `Error, path for object ${JSON.stringify(target)} not found in cache!}`;
      let path = pathCache.get(target);
      let path_ = isSymbol ? path : path + ser.fromKey(prop); // path.concat(prop);
      let v = isSymbol ? target : bindFn(target[prop], target);
      let isObj = isObject(v);
      if(isObj) pathCache.set(v, path_); // || '/'
      let doInternalize = INTERNALIZE_METHODS.includes(prop);
      let primary = !isObj && !isSymbol && !doInternalize;
      let release = isSymbol || doInternalize;
      if(primary) { // && false
        return v;
      } else {
        let val = v.$ref ? flw(v) : v;  //isObject(v) &&
        if(release) {
          let res1 = intCache[path_] || internalize(val, obj, path_);
          let res2 = res1;
          if([Symbol.iterator].includes(prop)) res2 = res1[prop];
          if(prop == Symbol.toPrimitive) res2 = (() => JSON.stringify(res1));
          intCache[path_] = res2;
          return res2;
        } else {
          return makeProxy(val, path_);
        }
      }
    },
    // key enumeration: for (let x in obj)
    ownKeys: (target) => {
    // ownKeys: (targetFn) => {
    //   let target = targetFn();
      return Object.getOwnPropertyNames(target);
    },
    // property assignment
    // for `obj.name = 'jen'`, if obj is not a proxy, and has no own property .name, but has a proxy on its prototype chain, then `receiver` is obj.
    set: (target, prop, val, receiver) => {
    // set: (targetFn, prop, val, receiver) => {
    //   let target = targetFn();
      if(!pathCache.has(target)) throw `Error, path for object ${JSON.stringify(target)} not found in cache!}`;
      let path = pathCache.get(target);
      let path_ = path + ser.fromKey(prop); // path.concat(prop);
      if(isObject(val)) pathCache.set(val, path_);
      let pathParts = path.slice(1).split('/');
      let indices = R.range(0, pathParts.length); // path
      indices.forEach(i => {
        let iPath = pathParts.splice(0, i+1); // path
        let strPath = ser.fromKeys(iPath);
        intCache[strPath] = null;
      });
      // TODO: handle WeakMap garbage collection (GC) subscribing to delete keys
      targ_prop = target[prop];
      let id = path2id[path_];
      if(id) writeCb(id, val);
      target[prop] = val;
      if(!id) {
        let id = path2id[path];
        writeCb(id, target);
      }
      return true;
    },
  };

  let init = flw(root);
  return makeProxy(init);
}

let makeExtern = (o, writeCb = defWriteCb) => externProxy(externalize(o, writeCb), writeCb);

module.exports = { externProxy, makeExtern };
