'use strict';

import postcss from 'postcss';
import MidasStringifier from './stringifier';

let processor = opts => {
    let stringify = (node, builder) => {
        let str = new MidasStringifier(builder, opts);
        str.stringify(node);
    };

    return stringify;
};

let midas = (css, opts) => postcss().process(css, {stringifier: processor(opts)});
midas.stringify = processor();

export default midas;
