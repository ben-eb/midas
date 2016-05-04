import postcss from 'postcss';
import MidasStringifier from './stringifier';

const processor = opts => {
    const stringify = (node, builder) => {
        const str = new MidasStringifier(builder, opts);
        str.stringify(node);
    };

    return stringify;
};

const midas = (css, opts) => postcss().process(css, {stringifier: processor(opts)});
midas.stringify = processor();

export default midas;
