import test from 'ava';
import postcss from 'postcss';
import Midas from '..';

test('should expose a virtual dom', t => {
    const midas = new Midas({
        stringify: false,
        wrap: false,
    });
    const ast = midas.process('\n');
    t.deepEqual(ast, {
        type: 'element',
        tagName: 'code',
        properties: {},
        children: [{
            type: 'text',
            value: '\n',
        }],
    });
});

test('should support stringify options', t => {
    const midas = new Midas();
    const str = midas.process('h1 {}', {quote: `'`});
    t.is(str, "<pre class='midas'><code><span class='midas__selector'><span class='midas__tag'>h1</span></span> <span class='midas__brace'>{</span><span class='midas__brace'>}</span></code></pre>");
});

test('should be consumed as a postcss stringifier', t => {
    const midas = new Midas();
    return postcss().process('h1{}', {stringifier: midas.stringifier}).then(result => {
        t.deepEqual('<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">h1</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>', result.content);
    });
});
