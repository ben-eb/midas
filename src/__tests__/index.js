import test from 'ava';
import midas from '..';

let tests = [{
    fixture: '/* comment parsing */',
    expected: '<pre class="midas"><code><span class="midas__comment">/* comment parsing */</span></code></pre>',
}, {
    fixture: '*{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__universal">*</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '*+*{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__universal">*</span><span class="midas__combinator">+</span><span class="midas__universal">*</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '#marker{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__id">#marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '.marker{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__class">.marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '::marker{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__pseudo">::marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '[name*="marker"]{}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__attribute"><span class="midas__attribute-brace">[</span><span class="midas__attribute-name">name</span><span class="midas__attribute-operator">*=</span><span class="midas__attribute-value">"marker"</span><span class="midas__attribute-brace">]</span></span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'a{content:"Hello, world!"}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">content</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__string">"Hello, world!"</span></span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'a{border:1px solid #ff0000!important}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">border</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__number">1px</span> <span class="midas__word">solid</span> <span class="midas__hex-color">#<span class="midas__hex-value">ff0000</span></span></span><span class="midas__important">!important</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'a{width:500px}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">width</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__number">500px</span></span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'a{background:url("cat.gif")}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">background</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__function"><span class="midas__function-name">url</span><span class="midas__parenthesis">(</span><span class="midas__string">"cat.gif"</span><span class="midas__parenthesis">)</span></span></span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'a{color:rgba(255, 255, 255, 0.5)}',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">color</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__function"><span class="midas__function-name">rgba</span><span class="midas__parenthesis">(</span><span class="midas__number">255</span>, <span class="midas__number">255</span>, <span class="midas__number">255</span>, <span class="midas__number">0.5</span><span class="midas__parenthesis">)</span></span></span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '@keyframes fade { 0% { opacity: 1 } to { opacity: 0 } }',
    expected: '<pre class="midas"><code><span class="midas__at-rule"><span class="midas__at-rule-name">@keyframes</span> fade</span> <span class="midas__brace">{</span> <span class="midas__selector">0%</span> <span class="midas__brace">{</span> <span class="midas__property">opacity</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__number">1</span></span> <span class="midas__brace">}</span> <span class="midas__selector">to</span> <span class="midas__brace">{</span> <span class="midas__property">opacity</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__number">0</span></span> <span class="midas__brace">}</span> <span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '@media screen and (min-width: 500px) {}',
    expected: '<pre class="midas"><code><span class="midas__at-rule"><span class="midas__at-rule-name">@media</span> <span class="midas__at-rule-keyword">screen</span> and <span class="midas__parenthesis">(</span><span class="midas__property">min-width</span><span class="midas__colon">:</span> <span class="midas__number">500px</span><span class="midas__parenthesis">)</span></span> <span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'h1:not(.header) { color: red }',
    expected: '<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">h1</span><span class="midas__pseudo">:not</span><span class="midas__parenthesis">(</span><span class="midas__class">.header</span><span class="midas__parenthesis">)</span></span> <span class="midas__brace">{</span> <span class="midas__property">color</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__word">red</span></span> <span class="midas__brace">}</span></code></pre>',
}, {
    fixture: 'text{fill:black;text-decoration:underline}',
    expected: '<pre class="midas"><code><span class="midas__selector">text</span><span class="midas__brace">{</span><span class="midas__property">fill</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__word">black</span></span><span class="midas__semicolon">;</span><span class="midas__property">text-decoration</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__word">underline</span></span><span class="midas__brace">}</span></code></pre>',
}, {
    fixture: '*{filter:blur( 5px )}',
    expected: '<pre class=\"midas\"><code><span class=\"midas__selector\"><span class=\"midas__universal\">*</span></span><span class=\"midas__brace\">{</span><span class=\"midas__property\">filter</span><span class=\"midas__colon\">:</span><span class=\"midas__value\"><span class=\"midas__function\"><span class=\"midas__function-name\">blur</span><span class=\"midas__parenthesis\">( </span><span class=\"midas__number\">5px</span><span class=\"midas__parenthesis\"> )</span></span></span><span class=\"midas__brace\">}</span></code></pre>',
}, {
    fixture: '$small:  34em;\n\n@custom-media --small (width >= $small);',
    expected: '<pre class=\"midas\"><code><span class=\"midas__property\">$small</span><span class=\"midas__colon\">:  </span><span class=\"midas__value\"><span class=\"midas__number\">34em</span></span><span class=\"midas__semicolon\">;</span>\n\n<span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@custom-media</span> --small <span class=\"midas__parenthesis\">(</span>width >= $small<span class=\"midas__parenthesis\">)</span><span class=\"midas__semicolon\">;</span></span></code></pre>',
}];

test('midas stringifier', t => {
    t.plan(tests.length);

    tests.forEach(spec => {
        let result = midas(spec.fixture).content;
        t.deepEqual(result, spec.expected);
    });
});
