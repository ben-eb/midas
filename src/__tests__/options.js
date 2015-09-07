'use strict';

import test from 'tape';
import midas from '..';

test('opts.wrap', t => {
    let input = 'h1{}';

    t.plan(1);

    midas(input, {wrap: false}).then(function (result) {
        t.equal(result.content, '<span class="midas__selector"><span class="midas__tag">h1</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span>');
    });
});
