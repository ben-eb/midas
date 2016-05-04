import midas from '..';
import postcss from 'postcss';
import test from 'ava';

test('should be consumed as a postcss stringifier', t => {
    return postcss().process('h1{}', {stringifier: midas}).then(result => {
        t.deepEqual('<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">h1</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>', result.content);
    });
});
