let v = { foo: 1 }
let o = { c: v, d: v }
o.a = o
o.b = o

let cycled = {
  foo: {},
  bar: {}
}
cycled.foo.bar = cycled.foo
cycled.bar.foo = cycled.bar

module.exports = { o, cycled };
