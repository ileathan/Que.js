# enQue.js
Chain asynchronous functions in succession, consuming the same data stream.

```javascript
const enQue = new require('enQue')
const myQue = enQue([fn1, fn2, fn3, fn4, fn5])
myQue.run(data)
```
For full documentation see the [enQue source code](https://ileathan.github.io/enQue).

# Features

**1.)** Skip ahead in the que `next(4)` would skip to position 4.

**2.)** Go backwards in the que `next(-4)` would go back 4.

**3.)** Inject a `Promise` at a particular que index `next({inject:4,promise:Promise})`.

**4.)** Quit after at specified index `next({quit:4}` quits after 4 more iterations.

**5.)** Allows removing functions by index, variable name, or raw text.

**6.)** A fill method for convenience.

The above code snippet illustrates how simple it would be to execute 5 asynchronous functions in succession that all operate on the same data. Just make sure each function calls `next()` to proceed or `next(0)` to quit early.

Since a promise is returned it is always best to attach a `.then()` and `.catch()` so the above code would become.

```javascript
myQue.run()
  .then(sucessCallback)
  .catch(errorCallback)
```

# Instalation

```npm install enque```

# Dependencies

None.

# Usage example

```javascript
// USAGE EXAMPLE
const Que = require('enQue');
const que = new Que();

// Used to only go backwards once, otherwise you end up in an infinite cycle.
// IF YOU GO FORWARD IN THE QUE YOU CANNOT GO BACKWARDS TO A PLACE NOT ON THE NEW QUE
// It will throw a error if you attempt to go forward then backwards.
var once = true;

que.add((data, next, done, index) => {
  // index is the position of your function in the que, 0 right now.
  //return done(); // You can return early if you'd like
  setTimeout(()=>{
    data.msg += ' ONE';
    // You can inject a promise at a specified relative position.
    next({inject:1, promise: new Promise(s=>{data.msg += " ONE AND A HALF"; s(data)})});
  }, 9000)
});
que.add((data, next) => {
  setTimeout(()=>{
    //throw "errors work too" // You can throw an error and reject the promise
    data.msg += ' TWO';
    next();
  }, 4000)
});
que.add((data, next) => {
  data.msg += ' THREE';
  next()
});

function myFn1(data, next) {
  data.msg += ' FOUR';
  // You can go backwards in the que.
  if(once) { once = false; next(-2); }
  // You can go forwards in the que.
  else next(1);
}

function myFn2(data, next) {
  data.msg += ' FIVE';
  next();
}

// You can add multiple functions at a time.
que.add([myFn1, myFn2]) 

que.run({msg: 'ZERO'})
  .then(res => console.log(res.msg))
  .catch(err => console.log('Woopsie! ' + err))
```

The above code when executed prints

```
ONE ONE AND A HALF TWO THREE FOUR TWO THREE FOUR FIVE
```
