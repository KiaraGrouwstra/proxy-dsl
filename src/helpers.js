// clone a function, including its properties
// http://stackoverflow.com/a/11230005/1502035
module.exports.cloneFn = (fn) => {
  let cloneObj = fn;
  if (fn.__isClone) {
    cloneObj = fn.__clonedFrom;
  }
  let tmp = function() {
      return cloneObj.apply(fn, arguments);
  };
  for (let key in fn) {
    tmp[key] = fn[key];
  }
  tmp.__isClone = true;
  tmp.__clonedFrom = cloneObj;
  return tmp;
};
