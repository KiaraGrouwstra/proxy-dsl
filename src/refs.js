var R = require('ramda');

// $[1]['abc']
var JSONPath = {
  init: '$',
  fromKey: k => `[${JSON.stringify(k)}]`,
  // toKeys: (path) => path.slice(2).slice(0,-1).split('][').map(s => JSON.parse(s)),
  // fromKeys: (keys) => ser.init + keys.map(ser.fromKey).join(''),
  resolve: ($ref) => ($) => eval($ref),
  rx: /^\$(?:\[(?:\d+|\'(?:[^\\\'\u0000-\u001f]|\\([\\\'\/bfnrt]|u[0-9a-zA-Z]{4}))*\')\])*$/,
};

// /1/abc
var pointer2keys = ($ref) => {
  let s = $ref.slice(1);
  return !R.length(s) ? [] : s.split('/').map(k => k.replace(/~1/g, '/').replace(/~0/g, '~'));
}
var JSONPointer = {
  init: '',
  fromKey: y => '/' + y.toString().replace(/~/g, '~0').replace(/\//g, '~1'),  // '/' +
  // toKeys: pointer2keys,
  // fromKeys: (keys) => '/' + keys.map(ser.fromKey).join('/'),
  resolve: R.pipe(pointer2keys, R.path),
};

var ser = JSONPointer;
ser.fromKeys = (keys) => ser.init + keys.map(ser.fromKey).join('');

module.exports = { JSONPath, JSONPointer };
