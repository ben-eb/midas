// @flow

import postcss from 'postcss';
import toHTML from 'hast-util-to-html';
import ToVDOM from './toVDOM';

type StringifierType = {
    stringify: Function
};

type MidasOptions = {
    stringify?: Function,
    wrap?: boolean,
};

/**
 * Midas takes a CSS string, and compiles it into a HTML output that's complete
 * with styling hooks, for powerful syntax highlighting. It can yield either
 * a HTML string, or a virtual DOM tree for usage with React or other
 * virtual node consumers.
 *
 * #### Plugins
 *
 * * {@link https://github.com/facebook/react|react}: {@link https://github.com/ben-eb/react-midas|react-midas}
 * * {@link https://github.com/wooorm/remark|remark}: {@link https://github.com/ben-eb/remark-midas|remark-midas}
 *
 * @constructor
 * @param {Object} [opts] Options object.
 * @param {Function|boolean} [opts.stringify=toHTML] Pass in a function to convert HAST
 * into a string. This defaults to {@link https://github.com/wooorm/hast-util-to-html|hast-util-to-html}.
 * If `false`, processing a CSS string will yield HAST instead.
 * @param {boolean} [opts.wrap=true] Wrap the output with `<pre class="midas"></pre>`.
 * By default, the CSS will also be wrapped with `<code></code>`.
 */

class Midas {
    _stringify: Function|boolean;
    _vdom: ToVDOM;

    constructor (opts: MidasOptions) {
        const {wrap, stringify} = {
            stringify: toHTML,
            wrap: true,
            ...opts,
        };
        this._stringify = stringify;
        this._vdom = new ToVDOM({wrap});
        return this;
    }

    /**
     * Convert a CSS string to either a HTML string or a virtual DOM tree.
     *
     * @param css CSS string to process.
     * @param args The rest of the options are passed directly to the
     * `stringify` function defined by the constructor.
     * @return {*|Array} Returns either anything invoked by calling the
     * `stringify` function, or if no `stringify` method is supplied, it
     * returns HAST instead.
     * @example <caption>Default usage:</caption>
     *
     * import Midas from 'midas';
     *
     * const htmlOutput = new Midas();
     * const html = htmlOutput.process('h1 {}'); // <pre class="midas"><code>...
     *
     * const hastOutput = new Midas({stringify: false});
     * const hast = hastOutput.process('h1 {}') // {type: 'element', tagName: 'pre', properties: {className: ['midas']}, children: [...]}
     *
     * @example <caption>React compatibility:</caption>
     *
     * import React from 'react';
     * import Midas from 'midas';
     * import toH from 'hast-to-hyperscript';
     *
     * const midas = new Midas({stringify: false});
     *
     * const ShowCSSCode = ({css}) => (
     *     <div>
     *         {toH(React.createElement, midas.process(css))}
     *     </div>
     * );
     */

    process (css: string, ...args: any) {
        const ast = this._vdom.getContent(postcss().process(css).root);

        if (typeof this._stringify === 'function') {
            return this._stringify(ast, ...args);
        }

        return ast;
    }

    /**
     * Get a stringifier intended to be consumed by a PostCSS instance. Note
     * that because PostCSS casts anything returned by custom stringifiers to
     * strings, you cannot use this interface to yield a virtual DOM.
     *
     * @return {Object} PostCSS compatible stringifier.
     * @example
     *
     * import postcss from 'postcss';
     * import Midas from 'midas';
     *
     * const midas = new Midas();
     * const css = 'h1 {}';
     *
     * postcss().process(css, {stringifier: midas.stringifier}).then(result => {
     *     console.log(result.content); // <pre class="midas"><code>...
     * });
     */

    get stringifier (): StringifierType {
        const stringify = (root, builder) => {
            builder(toHTML(this._vdom.getContent(root)));
        };
        return {stringify};
    }
}

export default Midas;
