# Que.js
Enable queing asynchronous functions one after the other.

```javascript
// USAGE EXAMPLE
const que = new Que();
var once = true;
que.add(function(data, next, done, index) {
   console.log("My position in the Que stack is " + index + ".")
  //return done(); // You can return early if you'd like
  setTimeout(()=>{
    data.msg += ' ONE';
    next({test:1, promise: new Promise((s,e)=>{data.msg += " WORKED "; s(data) }) });
  }, 50)
});
que.add(function(data, next) {
  setTimeout(()=>{
    //throw "errors work too" // You can throw an error and reject the promise
    data.msg += ' TWO';
    next();
  }, 10)
});
que.add(function(data, next) {
  data.msg += ' THREE';
  next()
});
que.add(function(data, next) {
  data.msg += ' FOUR';
   if(once) { once = false; next(-2); }
   else next(1);
});
que.add(function(data, next) {
  data.msg += ' FIVE';
  next();
});
que.run({msg: 'ZERO'})
  .then(res => console.log(res.msg))
  .catch(err => console.log('Woopsie! ' + err))
```
