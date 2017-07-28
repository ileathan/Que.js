// enQue class
// Author leathan
// License MIT
'use strict'

// **Constructor** Creates a new enQue object.
// `que = new enQue([function1, function2, function3])`
// You can also create an empty object via `new enQue()`
function enQue(init) {
  this.que = [];
  if(init) this.add(init);
  // __returns itself for use in chaining__
  return this;
}

// **enQue.fill** Fills an enQue object with `fn` `n` times.
// `que.fill((_,n)=>{console.log('works');n()}, 7)`
// running that que will display 'works' 7 times.
enQue.prototype.fill = function(fn, n) {
  for(let i = 0; i < n; i++) {
    this.que.push(fn);
  }
  // __returns itself for use in chaining__
  return this;
}

// **enQue.add** Adds `fn` to the enQue object.
// `que.add((_,n,__,i)=>{console.log(i)})` or you can
// specify an array of functions `que.add([fn1, fn1])`
enQue.prototype.add = function(fn) {
  if(fn.constructor.name === 'Array') {
    for(let i = 0, l = fn.length; i < l; i++) {
      this.que.push(fn[i])
    }
  }
  // __returns itself for use in chaining__
  return this;
}

// **enQue.clear** Clears all functions from the que
// `que.clear()`
enQue.prototype.clear = function(fn) {
  return this;
  // __returns itself for use in chaining__
}

// **enQue.remove** Removes an item from the que.
// `que.remove("(_,n,__,i)=>{console.log(i)}")`
// `que.remove(fn1, 2)` or `que.remove(7)`
// `item` can be a `String`, `Function ref`, or `Number`.
// `amount` is the amount of found `item`'s to remove
// if its not specified **all** `item`s found are removed.
enQue.prototype.remove = function(item, amount) {
  // Here we extract the items type.
  type = item.constructor.name;
  if(type === 'Number') {
    return this.que.splice(item, 1);
  }
  else {
    let check = type === 'Function' ? item : item.toString();
    amount = amount || Infinity;
    let removed = 0;
    for(i=0; i<this.que.length; i++) {
      // Make sure we dont remove more than amount!
      if(removed === amount) break;
      if(check === item) {
        this.que.splice(i, 1);
        removed++;
      }
    }
    // __returns itself for use in chaining__
    return this;
  }
}

// **executeQue** Executes the que, you should not need to call
// this function directly, but on the offchance you need to
// bypass the promise system its avialable `que.executeQue()`
enQue.prototype.executeQue = function(data, done) {
  // Allow ques that dont need to consume data.
  if(!data) data = {};
  // preserve the original callback for potential que rebuilding.
  var orig = done;
  // `i` is our iterator, quit/inject check if we need to quit/inject `Promise`.
  var i = 0, quit = false, inject = false;
  // The reduceRight function allows us to itterate through the que while constantly
  // nesting callbacks using the accumulator, it has very reasonable performance.
  this.que.reduceRight((done, next) =>
    options => {
      // Options can be any operation to perform while nesting callbacks.
      // Currently options must be a specific `JSON Object`, or a `Number`, if its JSON
      // then it needs a `quit` or `inject` property. Otherwise **0** terminates que,
      // exposing the data immitiadtly. A negative Number sends the data
      // to backwards in the que (to a new que **techincally**), Positive Numbers
      // send the data forward, bellow var i is current callback index being nested.
      if(options !== data && options === Object(options)) {
        if((!options.promise && !options.inject) && !options.quit)
          throw new Error(`${options} is not supported, valid fomat could be +n, -n, 0, or, {quit:+n}, {inject:+n,promise:Promise}`)
        else if(options.quit)
          quit = i + options.quit;
        else if(options.inject)
          inject = i + options.inject;
      }
      else if(options !== data && options) {
        // creates a temp que to hold our new que.
        tmpQue = [];
        // let `j` be the position we are skipping to.
        // lets say `next(-3)` was passed, so `options = -3`.
        // `i` is the current que spot - 1 that called `next(-3)`.
        // lets say `i` was **5**, so we want to go back to **1**.
        // so `j = 5 + -3  - (options < 0) = 1`
        // so start at position 1, until the end.
        var j = i + options - (options < 0);
        if(!this.que[j-1]) throw `${options} out of bounds, no que position ${j} exists.`
        for(let l = this.que.length; j < l; j++) {
          tmpQue.push(this.que[j])
        }
        // sets the que to the one we just built.
        this.que = tmpQue;
        // Apends the original data exposure callback.
        this.que.push(orig)
        this.executeQue(data);
        // Makes sure the current execution goes nowhere.
        done = ()=>{}
        next = ()=>{}
      }
      // if quit is specified, checks if we need to quit
      // and if so sets `next` to resolve `data`, otherwise increments
      // the checker variable.
      if(quit) {
        if(quit > i) { next = orig; quit = false }
        else quit++
      }
      // if inject is specified, checks if we need to inject
      // the `Promise` if so waits for promsise resolution and then
      // calls `next`, otherwise increment checker and call next.
      if(inject) {
        if(inject > i) {
          options.promise.then(data => {
            next(done, data, orig, i++);
          })
        } else {
          inject++
          next(done, data, orig, i++)
        }
      } else {
        // no special object options were specified just proceeds.
        next(data, done, orig, i++)
      }
    }
  // this sets our initial accumulator to the function done each successive call
  // then creates another function callback nest where the old `done` becomes the callback
  // of the new `done` the original `done` passed in here does nothing more then resolve the
  // data. which is passed in immidiatle (our reduceRight returns the accumulator function)
  , done)(data);
}

// **enQue.run** Creates a promise which resolves when the que ends.
// `que.run(data)` or for ques that dont consume data `que.run()`
// Since a promise is returns you should then call `.then(data=>{})`
// and `.catch(error=>{})`
enQue.prototype.run = function(data) {
  return new Promise((resolve, reject) => {
    try {
      this.executeQue(data, () => resolve(data));
    } catch(error) {
      reject(error);
    }
  // __returns a promise which can be used for chaining__
  })
}

module.exports = enQue;
