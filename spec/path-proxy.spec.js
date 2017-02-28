let assert = require('assert');
let { pathProxy } = require('../src');

describe('path proxy', () => {
  it('allows passing a path to a function', () => {
    let myPathProxy = pathProxy((path) => console.log(path));
    myPathProxy.a.foo.b();
  });
});
