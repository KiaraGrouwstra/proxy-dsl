let assert = require('assert');
let { externProxy, makeExtern } = require('../src/extern-proxy');

describe('externProxy', () => {
  it('lets externalized objects pretend they are normal', () => {
    let obj = { foo: { a: 1, b: { c: 2 } }, bar: ['a', 'b', 'c'], baz: 123 };
    let proxy = makeExtern(obj);

    console.log('baz', proxy.baz);
    console.log('bar', proxy.bar);
    // console.log('foo', proxy.foo);    // BROKEN, can't get it to return an internalized version by manipulating return results of `inspect`, `valueOf` or `Symbol.toStringTag`...
    console.log('foo: ' + proxy.foo);   // relies on `Symbol.toPrimitive`; works!
    console.log('array');
    for (let x of proxy.bar) {
      console.log(x);
    }
    console.log('object');
    let { foo } = proxy;
    for (let x in foo) {
      // BREAKS ON FUNCTION WRAPPING
      console.log(x, foo[x]);
    }

    proxy.bar[1] = 'd';
    console.log('bar: ' + proxy.bar);

    // expect(proxy.foo).toEqual({ a: 1, b: { c: 2 } });
  });
});
