let R = require('ramda');
let isObject = (v) => v && typeof v == 'object';
let ser = require('./refs').JSONPointer;
let { defWriteCb } = require('./constants');
// var mapIndexed = R.addIndex(R.map);

// ref-deduplicated deep-copy
function decycle(object) {  // , replacer
	let paths = new WeakMap();
	function deepcopy(val, path = ser.init) { // keys = []
		//if (replacer !== undefined) val = replacer(val);
		if(!isObject(val)) return val;
		// seen: ref-externalize.
		if (paths.has(val)) return { $ref: paths.get(val) };
		// new object: store and recurse
		paths.set(val, path || '/');  // ser.fromKeys(keys)
		return R.mapObjIndexed((v, k) => deepcopy(v, path + ser.fromKey(k)))(val);  // keys.concat(k)
	}
	return deepcopy(object);
};

// resolve refs
function retrocycle($) {
  function rez(o) {
    // R.map((v) => {
    R.keys(o).forEach((k) => {
      let v = o[k];
      if(!isObject(v)) return;
      let { $ref } = v;
      // return res = $ref ? ser.resolve($ref)($) : derez(v);  // ser.rx.test($ref)
      if ($ref) {
        o[k] = ser.resolve($ref)($);
      } else {
        rez(v);
      }
    });
  }
  rez($);
  return $;
};

// externalize all variables to allow document-based serialization
function externalize(object, writeCb = defWriteCb) {
	let map = new Map();	//Weak
  let obj = {};
	let path2id = {};
	function deepcopy(val, path = ser.init) {
		if(!isObject(val)) return val;
    let id;
    if(map.has(val)) {
      // seen, skip
      id = map.get(val);
      // return obj[id];
    } else {
      id = Math.random().toString(36).replace(/[^a-z]+/g, '') //.slice(0,1);
  		map.set(val, id);
			let fn = (v,k) => deepcopy(v, path + ser.fromKey(k));
      let ret = Array.isArray(val) ? val.map(fn) : R.mapObjIndexed(fn)(val);
      obj[id] = ret; // val
			writeCb(id, ret);
    }
		path2id[path] = id;
    return { $ref: id };
	}
	let res = {
    root: deepcopy(object),
    map,
    obj,
		path2id,
  };
  return res;
};

// internalize all variables again
function internalize(value, obj, path = ser.init, intCache = {}) {
  let locs = new Map();
  function flw(v, path) {
    let { $ref } = v;
    locs.set($ref, { $ref: path || '/' });
    return obj[$ref];
  };
  let process = (val, path = ser.init) => {
		function processItem(v, k) {
	    let path_ = path + ser.fromKey(k);
			if(intCache[path_]) return intCache[path_];
	    let { $ref } = v;
			let res;
	    if(locs.has($ref)) {
	      res = locs.get($ref);
	    } else {
	      let x = $ref ? flw(v, path_) : v;
	      res = isObject(x) ? process(x, path_) : x;
	    }
			intCache[path_] = res;
			return res;
	  };
		return Array.isArray(val) ? val.map(processItem) : R.mapObjIndexed(processItem)(val);
	}
	let v = value.$ref ? flw(value) : value;
  return process(v, path);
}

let follow = (o) => (v) => o[v.$ref];
let followPath = (o) => {
  let flw = follow(o);
  return (path) => (val) => path.reduce((v, k) => flw(v[k]), flw(val));
};

module.exports = { isObject, decycle, retrocycle, externalize, internalize, follow, followPath };
