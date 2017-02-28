let assert = require('assert');
let R = require('ramda');
let { o, cycled } = require('./fixtures');
let { decycle, retrocycle, externalize, internalize, follow, followPath } = require('../src/cycle');
let ser = require('../src/refs').JSONPointer;

describe('decycle', () => {
  it('cycled', () => {
    let res = decycle(cycled);
    let answer = { foo : { bar : { $ref : '/foo' } }, bar : { foo : { $ref : '/bar' } } };
    expect(res).toEqual(answer);
  });
  it('o', () => {
    let res = decycle(o);
    let answer = { c : { foo : 1 }, d : { $ref : '/c' }, a : { $ref : '/' }, b : { $ref : '/' } };
    expect(res).toEqual(answer);
  });
});

describe('retrocycle', () => {
  it('cycled', () => {
    let res = decycle(cycled);
    let back = retrocycle(res);
    expect(back.foo).toEqual(back.foo.bar);
  });
  it('o', () => {
    let res = retrocycle(decycle(o)).a.a;
    expect(res).not.toEqual({ $ref: '/' });
  });
});

describe('externalize', () => {
  it('should externalize all objects', () => {
    let res = externalize(cycled);
    expect(R.keys(res.obj).length).toEqual(3);
  });
  it('should allow navigating the decycled object', () => {
    let { root, obj } = externalize(cycled);
    let path = ['foo','bar','bar'];
    let answer = followPath(obj)(path)(root);
    expect(Object.keys(answer)).toEqual(['bar']);
  });
  it('should restore them again', () => {
    let { root, obj } = externalize(cycled);
    let res = internalize(root, obj);
    let back = retrocycle(res);
    expect(back.foo).toEqual(back.foo.bar);
  });
  // it('o', () => {
  //   let res = externalize(o);
  //   let answer = null;
  //   expect(res).toEqual(answer);
  // });
});
