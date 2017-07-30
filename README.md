# enQue.js
Chain asynchronous functions in succession, consuming the same data stream.

```javascript
const enQue = new require('enQue');
const myQue = enQue([fn1, fn2, fn3, fn4, fn5]); // Where each fn follows the format fn(data, next) { /*modification to data -> */ next() } 
myQue.run(data).then(data=>YOUR_CALLBACK(data));
```
For full documentation see the [enQue full docs](https://ileathan.github.io/enQue).

# Features

**1.)** Skip ahead in the que `next(4)` would skip to position 4.

**2.)** Go backwards in the que `next(-4)` would go back 4.

**3.)** Inject a `Function` at a particular que index `next({inject:4,function:Function})`. __(runs parallel to que not sync'd)__

**4.)** Quit after a specified amount of que spots `next({quit:4})` quits after 4 more iterations.

**5.)** Allows removing functions from the que by index, variable name, or raw text.

**6.)** A fill method for convenience.

The above code snippet illustrates how simple it would be to execute 5 asynchronous functions in succession that all operate on the same data. When you add a function to the que  **accept the second a parameter** (data is first) and call it **make sure to call it** for example `FUNCTION_NAME(data, next) { /* example: */ data.size + 1; /* MANDATORY */ next() }` to proceed or `next(0)` to quit early. The entire point of this package is that each spot in the que wont run untill the last spot has said ok im done via calling `next()`, or whatever you chose to name it.

Since a promise is returned it is always best to attach a `.then()` and `.catch()` so the above code would become.

```javascript
myQue.run();
  .then(sucessCallback); // Passed 1 argument, the data OBJECT.
  .catch(errorCallback); // Passed 1 argument, the error.
```

# Instalation

```npm install enque```

# Dependencies

None.

# Usage examples

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
    // You can inject a function at a specified relative position (it isnt added to the que, it runs parallel so careful here).
    //next({inject:1, function: function(data) {data.msg += " ONE AND A HALF";}});
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

Executing the above code as is gives:

```
ONE TWO THREE FOUR TWO THREE FOUR FIVE
```


# More examples

**NOTE** You can't actually call `que.run()` then `que.clear()` because the que may still be processing. You need to call. `que.run().then(()=>que.clear())` or to extract data from the processed que `que.run().then(data=>YOUR_CALLBACK(data))`

```javascript
// For the purpose of these examples, assume each function is asynchronous and you don't know when it will finish execution.
// When operating on the data it is important to remember that it must not be a primitive. If you must operate on just a primitive
// set it to an attribute on an object. for example if you need to operate on a `Number` you can do `que.run({data.number=17})`.

Que = require('enQue');
que = new Que();

function fn1(data, next) {
 console.log(1);
 next();
}
function fn2(data, next) {
 console.log(2);
 next();
}

que.add(fn1);
que.run(); // 1
que.clear();

que.add([fn1, fn1, fn1]);
que.run(); // 1 1 1
que.clear();

que.fill(fn1, 7);
que.run();
que.clear(); // 1 1 1 1 1 1 1 

que.add([fn1, fn1, fn1]);
que.remove(fn1);
que.run(); // ""

que.add([fn1, fn2, fn2, fn2]);
que.remove([fn1, fn2], 3); // for best preformance only pass in numbers i.e. `remove(0); remove(1); remove(2)`
que.run(); // 2
que.clear();

que.add([(d,n)=>n(5), fn1, fn1, fn1, fn1, fn1, fn1]);
que.run(); // 1
que.clear();

que.add([(d,n)=>n({quit:3}), fn1, fn1, fn1, fn2, fn2, fn2]);
que.run(); // 1 1 1
que.clear();

que.add((d,n,i)=>{console.log("hi"); n()});
que.remove('(d,n,i)=>{console.log("hi"); n()}');
que.run(); // ""

fn5 = (data, next, index, done) => {
  console.log(index);
  index === 2 ? next(0) : next();
  // instead of next(0) you can use done()
}

que.add([fn5, fn5, fn5, fn5, fn5]);
que.run(); // 0 1 2
que.clear();

fn3 = (data, next) => {
 data.data = "SEVEN";
 next();
}

que.add([(d,n)=>n({inject:5, function: function(d){d.data="7"}}), fn3, fn3, fn3, fn3, fn3]);
que.run().then(res=>console.log(res)); // d.data === 7
// To initialise the data use `run(data)` where data is an Object.
que.clear();

function fn6(data, next, index) {
  throw new Error("Woopsie!");
  next();
}

que.add([fn6, fn6, fn6, fn6, fn6]);
que.run().catch(e=>console.log(e)); // prints the thrown error.

```

Executing the above code as is gives:

```
1
1
1
1
1
1
1
1
1
1
1
2
1
1
1
1
0
1
2
{ data: '7' }
Error: Woopsie!
    at fn6 (...)
    at options (...)
    at enQue.executeQue (...)
    at ...
    ...
```
