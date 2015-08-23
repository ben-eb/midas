'use strict';

import postcss from 'postcss';
import MidasStringifier from './stringifier';

let stringify = (node, builder) => {
    let str = new MidasStringifier(builder);
    str.stringify(node);
};

let midas = css => postcss().process(css, {stringifier: stringify});
midas.stringify = stringify;

export default midas;
