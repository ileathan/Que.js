<div id="container">

*   <div class="annotation">

    # enQue.js

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-1)</div>

    enQue class Author leathan License MIT

    </div>

    <div class="content">

    <div class="highlight">

    <pre><span class="hljs-meta">'use strict'</span>

    <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">enQue</span>(<span class="hljs-params">init</span>)</span> {
      <span class="hljs-keyword">this</span>.que = [];
      <span class="hljs-keyword">if</span>(init) <span class="hljs-keyword">this</span>.add(init);
    }

    enQue.prototype.fill = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">fn, times</span>)</span> {
      <span class="hljs-keyword">for</span>(<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i < times; i++) {
        <span class="hljs-keyword">this</span>.que.push(fn);
      }
      <span class="hljs-keyword">return</span> times;
    }

    enQue.prototype.add = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">fn</span>)</span> {
      <span class="hljs-keyword">if</span>(fn.constructor.name === <span class="hljs-string">'Array'</span>) {
        <span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>;
        <span class="hljs-keyword">for</span>(i = <span class="hljs-number">0</span>; i < fn.length; i++) {
          <span class="hljs-keyword">this</span>.que.push(fn)
        }
        <span class="hljs-keyword">return</span> i;
      }
      <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.que.push(fn);
    }

    enQue.prototype.clear = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">fn</span>)</span> {
      <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.que = [];
    }

    enQue.prototype.remove = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">item</span>)</span> {
      type = item.constructor.name;
      <span class="hljs-keyword">if</span>(type === <span class="hljs-string">'Number'</span>) {
        <span class="hljs-keyword">return</span> <span class="hljs-keyword">this</span>.que.splice(item, <span class="hljs-number">1</span>);
      }
      <span class="hljs-keyword">else</span> {
        type === <span class="hljs-string">'Function'</span> ? check = item : check = item.toString();
        total = amount || <span class="hljs-literal">Infinity</span>;
        result = [];
        removed = <span class="hljs-number">0</span>;
        <span class="hljs-keyword">for</span>(i=<span class="hljs-number">0</span>; i<<span class="hljs-keyword">this</span>.que.length; i++) {
          <span class="hljs-keyword">if</span>(total > amount) <span class="hljs-keyword">break</span>;
          <span class="hljs-keyword">if</span>(check === item) {
            result.push(<span class="hljs-keyword">this</span>.que.splice(i, <span class="hljs-number">1</span>));
            removed++;
          }
        }
        <span class="hljs-keyword">return</span> result;
      }
    }

    enQue.prototype.executeQue = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">data, done</span>)</span> {</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-2)</div>

    Allow ques that dont need to consume data.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  <span class="hljs-keyword">if</span>(!data) data = {};</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-3)</div>

    preserve the original callback for potential que rebuilding.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  <span class="hljs-keyword">var</span> orig = done;</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-4)</div>

    i is our iterator, quit/inject check if we need to quit/inject Promise.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  <span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>, quit = <span class="hljs-literal">false</span>, inject = <span class="hljs-literal">false</span>;</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-5)</div>

    Perform nesting.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  <span class="hljs-keyword">this</span>.que.reduceRight(<span class="hljs-function">(<span class="hljs-params">done, next</span>) =></span></pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-6)</div>

    Options can be any operation to perform while nesting callbacks. Currently options must be a specific Object, or a Number, if Object then it needs a quit or inject property. Otherwise 0 terminates que, exposing the data immitiadtly. A negative Number sends the data to backwards in the que (to a new que techincally), Positive Numbers send the data forward, bellow var i is current callback index being nested.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>    options => {</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-7)</div>

    check if options is object, the first iteration is always data obj, so skip it.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>      <span class="hljs-keyword">if</span>(options !== data && options === <span class="hljs-built_in">Object</span>(options)) {
            <span class="hljs-keyword">if</span>((!options.promise && !options.inject) && !options.quit)
              <span class="hljs-keyword">throw</span> <span class="hljs-string">`<span class="hljs-subst">${options}</span> is not supported, valid fomat could be +n, -n, 0, or, {quit:+n}, {inject:+n,promise:Promise}`</span>
            <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span>(options.quit)
              quit = i + options.quit;
            <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span>(options.inject)
              inject = i + options.inject;
          }
          <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span>(options !== data && options) {</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-8)</div>

    create temp que to hold our new que.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        tmpQue = [];</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-9)</div>

    let j be the position we are skipping to. lets say next(-3) was passed, so options = -3. i is the current que spot - 1 that called next(-3). lets say i was 5, so we want to go back to 1. so j = 5 + -3 - (options < 0) = 1 so start at position 1, until the end.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        <span class="hljs-keyword">var</span> j = i + options - (options < <span class="hljs-number">0</span>);
            <span class="hljs-keyword">if</span>(!<span class="hljs-keyword">this</span>.que[j<span class="hljs-number">-1</span>]) <span class="hljs-keyword">throw</span> <span class="hljs-string">`<span class="hljs-subst">${options}</span> out of bounds, no que position <span class="hljs-subst">${j}</span> exists.`</span>
            <span class="hljs-keyword">for</span>(<span class="hljs-keyword">let</span> l = <span class="hljs-keyword">this</span>.que.length; j < l; j++) {
              tmpQue.push(<span class="hljs-keyword">this</span>.que[j])
            }</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-10)</div>

    set new que.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        <span class="hljs-keyword">this</span>.que = tmpQue;</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-11)</div>

    Apend the original data exposure callback.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        <span class="hljs-keyword">this</span>.que.push(orig)
            <span class="hljs-keyword">this</span>.executeQue(data);</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-12)</div>

    Make sure the current execution goes nowhere.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        done = <span class="hljs-function"><span class="hljs-params">()</span>=></span>{}
            next = <span class="hljs-function"><span class="hljs-params">()</span>=></span>{}
          }</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-13)</div>

    if quit is specified, check if we need to quit and if so set next to resolve data, else increment checker.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>      <span class="hljs-keyword">if</span>(quit) {
            <span class="hljs-keyword">if</span>(quit > i) { next = orig; quit = <span class="hljs-literal">false</span> }
            <span class="hljs-keyword">else</span> quit++
          }</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-14)</div>

    if inject is specified, check if we need to inject a promise if so set wait for resolve then call next, otherwise increment checker and call next.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>      <span class="hljs-keyword">if</span>(inject) {
            <span class="hljs-keyword">if</span>(inject > i) {
              options.promise.then(<span class="hljs-function"><span class="hljs-params">data</span> =></span> {
                next(done, data, orig, i++);
              })
            } <span class="hljs-keyword">else</span> {
              inject++
              next(done, data, orig, i++)
            }
          } <span class="hljs-keyword">else</span> {</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-15)</div>

    no special object options were specified just proceed.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>        next(data, done, orig, i++)
          }
        }</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-16)</div>

    set our initial accumulator to function done. which merely resolves the data, exposing it. Meaning the result will be a function so call it instantly with data.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  , done)(data);
    }

    enQue.prototype.run = <span class="hljs-function"><span class="hljs-keyword">function</span>(<span class="hljs-params">data</span>)</span> {</pre>

    </div>

    </div>

*   <div class="annotation">

    <div class="pilwrap ">[¶](#section-17)</div>

    Returns a promise that resolves if the exection of the que yeilded no errors.

    </div>

    <div class="content">

    <div class="highlight">

    <pre>  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-built_in">Promise</span>(<span class="hljs-function">(<span class="hljs-params">resolve, reject</span>) =></span> {
        <span class="hljs-keyword">try</span> {
          <span class="hljs-keyword">this</span>.executeQue(data, () => resolve(data));
        } <span class="hljs-keyword">catch</span>(error) {
          reject(error);
        }
      })
    }

    <span class="hljs-built_in">module</span>.exports = enQue;</pre>

    </div>

    </div>

</div>
