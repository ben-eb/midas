'use strict';

import postcss from 'postcss';
import MidasStringifier from './stringifier';

let stringify = (node, builder) => {
    let str = new MidasStringifier(builder);
    str.stringify(node);
};

export default css => postcss().process(css, {stringifier: stringify});
