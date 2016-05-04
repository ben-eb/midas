import test from 'ava';
import midas from '..';

test('opts.wrap', t => {
    return midas('h1{}', {wrap: false}).then(result => {
        t.deepEqual(result.content, '<span class="midas__selector"><span class="midas__tag">h1</span></span><span class="midas__brace">{</span><span class="midas__brace">}</span>');
    });
});
