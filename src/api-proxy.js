let R = require('ramda');
let { asyncProxy } = require('./async-proxy.js');
let { INDEX, DETAIL } = require('./constants.js');

let apiHandler = {};

// use apply trap to cancel Proxy? need fn wrap though.

apiHandler.get = (target, prop) => {
  if (prop in target && isNaN(prop)) {
    // potentially legitimate property access, forward (leave Proxy)
    return target[prop];
  } else {
    // proxied property access - check if this is still leading to valid endpoints
    //console.log('get', target, prop);
    if (!isNaN(prop)) {
      // fix numbers
      prop = Number(prop);
    }
    let { meta, path, fetcher, store } = target;
    let childMeta = R.path(['properties', prop])(meta) || R.path(['additionalProperties'])(meta);
    if (childMeta) {
      // api path exists -- update info, stay in this apiProxy FSM state
      console.log('target', target);
      let val = R.pipe(
        R.assoc('meta', childMeta),
        R.evolve({
          path: p=>p.concat(prop),
        })
      )(target);
      return new Proxy(val, apiHandler);
    } else {
      // no deeper child endpoints. get cached/fetched.
      let { fetchMeta, pageType, fullyRequested } = meta;
      pageType = pageType || (meta.properties && meta.properties[prop]) ? DETAIL : INDEX;
      // checked if cached (fully so for collection)
      let cache = R.path([...path])(store);
      let isCached = cache && (pageType == DETAIL || fullyRequested);
      if (isCached) {
        // use cached -- leave Proxy
        return cache[prop];
      } else {
        // fetch -- switches FSM state to asyncProxy
        let prom = fetcher(path, meta)
        // .then(str => { console.log(str); return str; });
        // wrap in async proxy to skip then/switchMap until manually invoking Promise/Observable method
        return asyncProxy(prom).json()[prop];
      }
    }
  }
};

// expected input object:
//   meta: the path structure (JSON Schema with extensions, see api-proxy.spec.js) representing the API endpoints.
//   fetcher: (url: string, opts: {}): Promise<Response>|Observable<Response>
//   store: {}; the cache to store items in and retrieve them from
//   // path: string[]; leave unspecified; API path to start from after the baseUrl
module.exports.apiProxy = (obj) => {
  let target = R.assoc('path', [])(obj);
  return new Proxy(target, apiHandler);
}
