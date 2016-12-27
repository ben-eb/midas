import test from 'ava';
import Midas from '..';

const tests = [{
    fixture: '/* comment parsing */',
    expected: '<code><span class="midas__comment">/* comment parsing */</span></code>',
}, {
    fixture: '*{}',
    expected: '<code><span class="midas__selector"><span class="midas__universal">*</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: '*+*{}',
    expected: '<code><span class="midas__selector"><span class="midas__universal">*</span><span class="midas__combinator">+</span><span class="midas__universal">*</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: '#marker{}',
    expected: '<code><span class="midas__selector"><span class="midas__id">#marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: '.marker{}',
    expected: '<code><span class="midas__selector"><span class="midas__class">.marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: '::marker{}',
    expected: '<code><span class="midas__selector"><span class="midas__pseudo">::marker</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: '[name*="marker"]{}',
    expected: '<code><span class="midas__selector"><span class="midas__attribute"><span class="midas__attribute-brace">[</span><span class="midas__attribute-name">name</span><span class="midas__attribute-operator">*=</span><span class="midas__attribute-value">"marker"</span><span class="midas__attribute-brace">]</span></span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'a{content:"Hello, world!"}',
    expected: '<code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">content</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__string">"Hello, world!"</span></span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'a{border:1px solid #ff0000!important}',
    expected: '<code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">border</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__number">1px</span> <span class="midas__word">solid</span> <span class="midas__hex-color">#<span class="midas__hex-value">ff0000</span></span></span><span class="midas__important">!important</span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'a{width:500px}',
    expected: '<code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">width</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__number">500px</span></span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'a{background:url("cat.gif")}',
    expected: '<code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">background</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__function"><span class="midas__function-name">url</span><span class="midas__parenthesis">(</span><span class="midas__string">"cat.gif"</span><span class="midas__parenthesis">)</span></span></span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'a{color:rgba(255, 255, 255, 0.5)}',
    expected: '<code><span class="midas__selector"><span class="midas__tag">a</span></span><span class="midas__brace">{</span><span class="midas__property">color</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__function"><span class="midas__function-name">rgba</span><span class="midas__parenthesis">(</span><span class="midas__number">255</span>, <span class="midas__number">255</span>, <span class="midas__number">255</span>, <span class="midas__number">0.5</span><span class="midas__parenthesis">)</span></span></span><span class="midas__brace">}</span></code>',
}, {
    fixture: '@keyframes fade { 0% { opacity: 1 } to { opacity: 0 } }',
    expected: '<code><span class="midas__at-rule"><span class="midas__at-rule-name">@keyframes</span> fade</span> <span class="midas__brace">{</span> <span class="midas__selector">0%</span> <span class="midas__brace">{</span> <span class="midas__property">opacity</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__number">1</span></span> <span class="midas__brace">}</span> <span class="midas__selector">to</span> <span class="midas__brace">{</span> <span class="midas__property">opacity</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__number">0</span></span> <span class="midas__brace">}</span> <span class="midas__brace">}</span></code>',
}, {
    fixture: '@media screen and (min-width: 500px) {}',
    expected: '<code><span class="midas__at-rule"><span class="midas__at-rule-name">@media</span> <span class="midas__at-rule-keyword">screen</span> and <span class="midas__function"><span class="midas__parenthesis">(</span><span class="midas__property">min-width</span><span class="midas__colon">: </span><span class="midas__number">500px</span><span class="midas__parenthesis">)</span></span></span> <span class="midas__brace">{</span><span class="midas__brace">}</span></code>',
}, {
    fixture: 'h1:not(.header) { color: red }',
    expected: '<code><span class="midas__selector"><span class="midas__tag">h1</span><span class="midas__pseudo">:not</span><span class="midas__parenthesis">(</span><span class="midas__class">.header</span><span class="midas__parenthesis">)</span></span> <span class="midas__brace">{</span> <span class="midas__property">color</span><span class="midas__colon">: </span><span class="midas__value"><span class="midas__word">red</span></span> <span class="midas__brace">}</span></code>',
}, {
    fixture: 'text{fill:black;text-decoration:underline}',
    expected: '<code><span class="midas__selector">text</span><span class="midas__brace">{</span><span class="midas__property">fill</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__word">black</span></span><span class="midas__semicolon">;</span><span class="midas__property">text-decoration</span><span class="midas__colon">:</span><span class="midas__value"><span class="midas__word">underline</span></span><span class="midas__brace">}</span></code>',
}, {
    fixture: '*{filter:blur( 5px )}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__universal\">*</span></span><span class=\"midas__brace\">{</span><span class=\"midas__property\">filter</span><span class=\"midas__colon\">:</span><span class=\"midas__value\"><span class=\"midas__function\"><span class=\"midas__function-name\">blur</span><span class=\"midas__parenthesis\">( </span><span class=\"midas__number\">5px</span><span class=\"midas__parenthesis\"> )</span></span></span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: '$small:  34em;\n\n@custom-media --small (width >= $small);',
    expected: '<code><span class=\"midas__property\">$small</span><span class=\"midas__colon\">:  </span><span class=\"midas__value\"><span class=\"midas__number\">34em</span></span><span class=\"midas__semicolon\">;</span>\n\n<span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@custom-media</span> --small <span class=\"midas__function\"><span class=\"midas__parenthesis\">(</span>width >= $small<span class=\"midas__parenthesis\">)</span></span><span class=\"midas__semicolon\">;</span></span></code>',
}, {
    fixture: 'h1{-webkit-border-radius: 5px}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">h1</span></span><span class=\"midas__brace\">{</span><span class=\"midas__property\"><span class=\"midas__vendor-prefix\">-webkit-</span>border-radius</span><span class=\"midas__colon\">: </span><span class=\"midas__value\"><span class=\"midas__number\">5px</span></span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: 'h1  ,  h2{}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">h1</span>  ,  <span class=\"midas__tag\">h2</span></span><span class=\"midas__brace\">{</span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: 'h1 { color: red !important }',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">h1</span></span> <span class=\"midas__brace\">{</span> <span class=\"midas__property\">color</span><span class=\"midas__colon\">: </span><span class=\"midas__value\"><span class=\"midas__word\">red</span></span><span class=\"midas__important\"> !important</span> <span class=\"midas__brace\">}</span></code>',
}, {
    fixture: 'a {\n background: blue;\n /* comment */\n}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">a</span></span> <span class=\"midas__brace\">{</span>\n <span class=\"midas__property\">background</span><span class=\"midas__colon\">: </span><span class=\"midas__value\"><span class=\"midas__word\">blue</span></span><span class=\"midas__semicolon\">;</span>\n <span class=\"midas__comment\">/* comment */</span>\n<span class=\"midas__brace\">}</span></code>',
}, {
    fixture: '@import "foo";',
    expected: '<code><span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@import</span> <span class=\"midas__string\">\"foo\"</span><span class=\"midas__semicolon\">;</span></span></code>',
}, {
    fixture: '@font-face {\n font-family: Unicorn;\n}',
    expected: '<code><span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@font-face</span></span> <span class=\"midas__brace\">{</span>\n <span class=\"midas__property\">font-family</span><span class=\"midas__colon\">: </span><span class=\"midas__value\"><span class=\"midas__word\">Unicorn</span></span><span class=\"midas__semicolon\">;</span>\n<span class=\"midas__brace\">}</span></code>',
}, {
    fixture: 'a[href=foo  i ] {}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">a</span><span class=\"midas__attribute\"><span class=\"midas__attribute-brace\">[</span><span class=\"midas__attribute-name\">href</span><span class=\"midas__attribute-operator\">=</span><span class=\"midas__attribute-value\">foo</span><span class=\"midas__attribute-insensitive\">  i </span><span class=\"midas__attribute-brace\">]</span></span></span> <span class=\"midas__brace\">{</span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: 'a[href=foo i] {}',
    expected: '<code><span class=\"midas__selector\"><span class=\"midas__tag\">a</span><span class=\"midas__attribute\"><span class=\"midas__attribute-brace\">[</span><span class=\"midas__attribute-name\">href</span><span class=\"midas__attribute-operator\">=</span><span class=\"midas__attribute-value\">foo</span><span class=\"midas__attribute-insensitive\"> i</span><span class=\"midas__attribute-brace\">]</span></span></span> <span class=\"midas__brace\">{</span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: '@media print, screen{}',
    expected: '<code><span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@media</span> <span class=\"midas__at-rule-keyword\">print</span>, <span class=\"midas__at-rule-keyword\">screen</span></span><span class=\"midas__brace\">{</span><span class=\"midas__brace\">}</span></code>',
}, {
    fixture: '@namespace islands url("http://bar.yandex.ru/ui/islands");',
    expected: '<code><span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@namespace</span> islands <span class=\"midas__function\"><span class=\"midas__function-name\">url</span><span class=\"midas__parenthesis\">(</span><span class=\"midas__string\">\"http://bar.yandex.ru/ui/islands\"</span><span class=\"midas__parenthesis\">)</span></span><span class=\"midas__semicolon\">;</span></span></code>',
}, {
    fixture: '@media ( min-aspect-ratio: 16 / 9 ) {}',
    expected: '<code><span class=\"midas__at-rule\"><span class=\"midas__at-rule-name\">@media</span> <span class=\"midas__function\"><span class=\"midas__parenthesis\">(</span> <span class=\"midas__property\">min-aspect-ratio</span><span class=\"midas__colon\">: </span><span class=\"midas__number\">16</span> / <span class=\"midas__number\">9</span> <span class=\"midas__parenthesis\">)</span></span></span> <span class=\"midas__brace\">{</span><span class=\"midas__brace\">}</span></code>',
}];

const wrapper = new Midas({wrap: true});
const unwrapped = new Midas({wrap: false});

tests.forEach(({fixture, expected}) => {
    test(fixture, t => {
        const wrapped = `<pre class="midas">${expected}</pre>`;
        t.deepEqual(wrapper.process(fixture), wrapped);
        t.deepEqual(unwrapped.process(fixture), expected);
    });
});
