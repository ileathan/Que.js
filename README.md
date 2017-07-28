# Que.js
Enable queing asynchronous functions one after the other.

```javascript
// USAGE EXAMPLE
const que = new Que();
var once = true;
que.add(function(data, next, done, index) {
  //return done(); // You can return early if you'd like
  setTimeout(()=>{
    data.msg += ' ONE';
    next({inject:1, promise: new Promise((s,e)=>{data.msg += " ONE AND A HALF"; s(data) }) });
  }, 9000)
});
que.add(function(data, next) {
  setTimeout(()=>{
    //throw "errors work too" // You can throw an error and reject the promise
    data.msg += ' TWO';
    next();
  }, 4000)
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

The above code when executed prints

```
ONE ONE AND A HALF TWO THREE FOUR TWO THREE FOUR FIVE
```
