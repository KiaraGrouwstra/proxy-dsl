// import { pathProxy } from './path-proxy.js';
let { pathProxy } = require('./path-proxy.js');
// import { makeFetcher } from './fetcher.js';
let { makeFetcher } = require('./fetcher.js');
let fetch = require('node-fetch');  //fetch ||

// make our fetcher -- uses a function taking a URL and options object to return a Promise<Response>|Observable<Response>. can use e.g. Fetch API, ng2's `http.get()`.
let fetchInit = {
  redirect: 'follow',
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
  mode: 'cors',
  cache: 'default',
};
// const baseUrl = 'http://pokeapi.co/api/v2/';
const baseUrl = 'http://www.foaas.com/';
// http://www.foaas.com/operations
let fetcher = makeFetcher(fetch, baseUrl, fetchInit);

// local data (cache). use thru `api` proxy for free auto-fetch
let store = {};

// structure with the endpoints of the API and their meta-data
// alt.: structure like OpenAPI/Swagger's `{ '/foos': {}, '/foos/{id}': {} }`?
// fetch only as required (no more such child paths)
let pathStruct = {
  properties: {
    // 'pokemon': {
    // 'operations': {
    'cool': {
      fetchMeta: {
        headers: {
          foo: 'bar',
        },
      },
      // this represents the id: /pokemon/1
      additionalProperties: {},
    },
  },
};
// meta-data per endpoint:
//   fetchMeta: an overriding options object passed as second argument to the fetcher to say specify headers.
//   pageType: explicitly indicate the endpoint as 'INDEX' or 'DETAIL' (default: `additionalProperties` -> DETAIL, otherwise INDEX); use-cases:
//     - caching: INDEX pages will only be deemed in the cache when the index has been fetched, rather than one or more of its child DETAIL endpoints.
//   fullyRequested: added internally during runtime for INDEX pages to mark when they have been requested (to ensure the cache won't just yield separately requested child data)
// TODO:
//   paging: page? if offset, step size?
//   sort: key, order
//   filter: keys

const log = console.log.bind(console);
// construct the API
let api = pathProxy({ meta: pathStruct, fetcher, store });
// console.log('api', api);
api
    // path proxy: construct and fetch endpoint `/pokemon/1` if not cached
    // .pokemon[1]
    .cool.Tycho
    // .operations
    // async proxy: map the asynchronously Promise'd result to a deep property
    // .forms[0].name
    // [0].name
    .message
    // exit Proxy by directly invoking the Promise/Observable
    .then(log)
    .catch(log)
    // logs: bulbasaur
