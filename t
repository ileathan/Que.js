q = require('./enQue.js')
que = new q()
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
    //next({inject:7, function: function(data) {data.msg += " ONE AND A HALF";}}); // This would run that function after 7 more que'd fn's are done.
    next(3);
  }, 9000)
});
que.add((data, next) => {
  setTimeout(()=>{
    //throw "errors work too" // You can throw an error and reject the promise
console.log(2)
    data.msg += ' TWO';
    next();
  }, 4000)
});
que.add((data, next) => {
 console.log(3)
 data.msg += ' THREE';
  next()
});

function myFn1(data, next) {
 console.log(4)
 data.msg += ' FOUR';
  // You can go backwards in the que.
  if(once) { once = false; next(-2); }
  // You can go forwards in the que.
  else next(1);
}

function myFn2(data, next) {
  console.log(5)
data.msg += ' FIVE';
  next();
}

// You can add multiple functions at a time.
que.add([myFn1, myFn2])

que.run({msg: 'ZERO'})
  .then(res => console.log(res.msg))
  .catch(err => console.log('Woopsie! ' + err))
