let _ = require('lodash/fp');
let { INDEX, DETAIL } = require('./constants.js');

// fetch an endpoint, return deserialized JSON results as Promise
module.exports.makeFetcher = _.curry((fetchFn, baseUrl, baseInit, path, meta) => {
  // TODO: deal with further fetches if paginated
  let { fetchMeta, pageType, fullyRequested } = meta;
  let url = baseUrl + path.join('/'); //.replace('//','/');
  let merged = _.assign(baseInit, fetchMeta);
  let baseHeaders = _.get(['headers'])(fetchMeta) || {};
  let init = _.update(['headers'], h => _.assign(baseHeaders, h))(merged);  // browser: `h => new Headers(...)`
  if (pageType == INDEX) {
    // when fetching an index endpoint mark is as fully requested (-> can get from cache)
    meta.fullyRequested = true;
  }
  let prom = fetchFn(url, init);
  return prom.catch(e => console.log(e));
});
