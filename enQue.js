// enQue class
// Author leathan
// License MIT
'use strict'

// Construct a new enQue object
function enQue(init) {
  // Default to an empty array
  this.que = [];
  // **if** passed a parameter assume its an array
  // and add use the add method to add all elements.
  if(init) this.add(init);
}

// Fill an enQue object with n functions.
enQue.prototype.fill = function(fn, n) {
  for(let i = 0; i < n; i++) {
    this.que.push(fn);
  }
  // assume no problems and return n.
  return n;
}

enQue.prototype.add = function(fn) {
  // If argument is array loop through it
  // adding every item to our que.
  if(fn.constructor.name === 'Array') {
    let l = fn.length
    for(let i = 0; i < l; i++) {
      this.que.push(fn)
    }
    return l;
  }
  // returns the amount of added fns.
  return this.que.push(fn) ? 1 : 0;
}

// clears all function elements fromt he array.
enQue.prototype.clear = function(fn) {
  return this.que = [];
}

// `item` can be a `String`, `Function ref`, or `Number`.
// `amount` is the amount of found `item`'s to remove
// if its not specified **all** `item`s found are removed.
enQue.prototype.remove = function(item, amount) {
  type = item.constructor.name;
  // If item is a number just remove that element and return.
  if(type === 'Number') {
    return this.que.splice(item, 1);
  }
  else {
    // Otherwise check if its a `Function` or an `String`
    // and loop through the que checking each element
    type === 'Function' ? check = item : check = item.toString();
    total = amount || Infinity;
    result = [];
    removed = 0;
    for(i=0; i<this.que.length; i++) {
      // Make sure we dont remove more than amount!
      if(total > amount) break;
      if(check === item) {
        result.push(this.que.splice(i, 1));
        removed++;
      }
    }
    // returns the array of removed elements
    return result;
  }
}

enQue.prototype.executeQue = function(data, done) {
  // Allow ques that dont need to consume data.
  if(!data) data = {};
  // preserve the original callback for potential que rebuilding.
  var orig = done;
  // `i` is our iterator, quit/inject check if we need to quit/inject `Promise`.
  var i = 0, quit = false, inject = false;

  // Perform nesting.
  this.que.reduceRight((done, next) =>
    // Options can be any operation to perform while nesting callbacks.
    // Currently options must be a specific `JSON Object`, or a `Number`, if its JSON
    // then it needs a `quit` or `inject` property. Otherwise **0** terminates que,
    // exposing the data immitiadtly. A negative Number sends the data
    // to backwards in the que (to a new que **techincally**), Positive Numbers
    // send the data forward, bellow var i is current callback index being nested.
    options => {
      // check if options is object, the first iteration is always data obj, so skip it.
      if(options !== data && options === Object(options)) {
        if((!options.promise && !options.inject) && !options.quit)
          throw `${options} is not supported, valid fomat could be +n, -n, 0, or, {quit:+n}, {inject:+n,promise:Promise}`
        else if(options.quit)
          quit = i + options.quit;
        else if(options.inject)
          inject = i + options.inject;
      }
      else if(options !== data && options) {
        // create temp que to hold our new que.
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
        // set new que.
        this.que = tmpQue;
        // Apend the original data exposure callback.
        this.que.push(orig)
        this.executeQue(data);
        // Make sure the current execution goes nowhere.
        done = ()=>{}
        next = ()=>{}
      }
      // if quit is specified, check if we need to quit
      // and if so set next to resolve data, else increment checker.
      if(quit) {
        if(quit > i) { next = orig; quit = false }
        else quit++
      }
      // if inject is specified, check if we need to inject
      // a promise if so set wait for resolve then call next,
      // otherwise increment checker and call next.
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
        // no special object options were specified just proceed.
        next(data, done, orig, i++)
      }
    }
  // set our initial accumulator to function done.
  // which merely resolves the data, exposing it.
  // Meaning the result will be a function
  // so call it instantly with data.
  , done)(data);
}

enQue.prototype.run = function(data) {
  // Returns a promise that resolves if the
  // exection of the que yeilded no errors.
  return new Promise((resolve, reject) => {
    try {
      this.executeQue(data, () => resolve(data));
    } catch(error) {
      reject(error);
    }
  })
}

module.exports = enQue;
