'use strict';

import midas from '..';
import postcss from 'postcss';
import test from 'tape';

test('should be consumed as a postcss stringifier', t => {
    t.plan(1);
    postcss().process('h1{}', {stringifier: midas}).then(result => {
        t.equal('<pre class="midas"><code><span class="midas__selector"><span class="midas__tag">h1</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span></code></pre>', result.content);
    });
});
