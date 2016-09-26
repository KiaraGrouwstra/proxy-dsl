Proxies used here are recursive; upon property access they either keep their return value wrapped in a similar Proxy, or don't, based on certain conditions.
From the perspective of an [FSM](https://en.wikipedia.org/wiki/Finite-state_machine) each Proxy type could be seen as representing one state. The result: an FSM-based custom DSLs based on ES6 Proxy.
~~This is similar to Tom van Cutsem's principle of [Membranes](http://soft.vub.ac.be/~tvcutsem/invokedynamic/js-membranes).~~

Notes: must inject Observable

Esp. great for cleaning ng2 classes with methods like this:

```
load() {
  if (this.data) {
    return Promise.resolve(this.data);
  }
  return new Promise(resolve => {
    this.http.get('data/data.json').subscribe(res => {
      this.data = this.processData(res.json());
      resolve(this.data);
    });
  });
}
```

Testing:
```
npm i -g jasmine-node
npm test
jasmine-node spec/extern-proxy.spec.js
```
