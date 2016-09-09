// import { asyncProxy } from './async-proxy.js';
let { asyncProxy } = require('./async-proxy.js');

let later = (v) => new Promise((resolve, reject) => setTimeout(() => resolve(v), 1000));
let obj = { greet: (name) => console.log('Hey ' + name) };
let prom = later(obj);
let greeter = asyncProxy(prom);
// this is a Proxy'd Promise...
// yet we can call its methods using traditional syntax.
greeter.greet('you');
// ^ look mom, no `then`!
let res = greeter.then(() => console.log('sup'));
// un-Proxy by calling Promise methods like `then` (which `await` transpiles to AFAIK).
// This works similarly for Observables.
console.log('res', res);
// value: Promise<{ greet }>
