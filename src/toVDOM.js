// @flow

import htmlTags from 'html-tags';
import selectorParser from 'postcss-selector-parser';
import valueParser, {unit} from 'postcss-value-parser';
import h from 'hastscript';
import vendors from 'vendors';
import hspan from './hspan';
import mediaTypes from './mediaTypes';
import {raw, rawValue} from './raws';
import * as t from './types';

function walkDeclValues (values, container) {
    values.nodes.forEach(node => {
        const {type, value} = node;
        if (type === t.string) {
            const {quote} = node;
            container.push(hspan(t.string, `${quote}${value}${quote}`));
        }
        if (type === t.word) {
            const number = unit(value);
            if (number) {
                container.push(hspan(t.number, value));
                return;
            }
            if (!node.value.indexOf('#')) {
                container.push(
                    hspan(t.hexColor, [
                        '#',
                        hspan(t.hexValue, value.slice(1)),
                    ]),
                );
                return;
            }
            container.push(hspan(t.word, value));
            return;
        }
        if (type === t.func) {
            const funcValues = [
                hspan(t.funcName, value),
                hspan(t.parenthesis, '(' + node.before),
            ];

            walkDeclValues(node, funcValues);

            funcValues.push(
                hspan(t.parenthesis, node.after + ')'),
            );

            container.push(
                hspan(t.func, funcValues),
            );
        }
        if (type === 'div') {
            container.push(`${node.before}${value}${node.after}`);
        }
        if (type === 'space') {
            container.push(value);
        }
    });
}

function selectorValues (reference) {
    return function (selectors) {
        function loop (parent, container) {
            function push (node, ref) {
                if (node.spaces.before) {
                    container.push(node.spaces.before);
                }
                if (Array.isArray(ref)) {
                    container.push(...ref);
                } else {
                    container.push(ref);
                }
                if (node.spaces.after) {
                    container.push(node.spaces.after);
                }
            }

            parent.nodes.forEach(node => {
                const {type, value} = node;
                if (type === t.selector) {
                    loop(node, container);
                    if (node.next()) {
                        container.push(',');
                    }
                }
                if (type === t.attribute) {
                    const parts = [
                        hspan(t.attributeBrace, '['),
                        node.ns,
                        hspan(t.attributeName, node.attribute),
                    ];

                    if (node.operator) {
                        parts.push(hspan(t.attributeOperator, node.operator));
                    }

                    if (value) {
                        parts.push(hspan(t.attributeValue, value));
                    }

                    if (node.raws.insensitive) {
                        parts.push(hspan(t.attributeInsensitive, node.raws.insensitive));
                    }

                    push(node, hspan(t.attribute, [
                        ...parts,
                        hspan(t.attributeBrace, ']'),
                    ]));
                }
                if (type === t.pseudo) {
                    const name = hspan(t.pseudo, value);
                    if (node.length) {
                        const reference2 = [];
                        loop(node, reference2);

                        push(node, [
                            name,
                            hspan(t.parenthesis, '('),
                            ...reference2,
                            hspan(t.parenthesis, ')'),
                        ]);
                    } else {
                        push(node, name);
                    }
                }
                if (type === t.tag) {
                    if (~htmlTags.indexOf(value)) {
                        push(node, hspan(t.tag, value));
                    } else {
                        push(node, value);
                    }
                }
                if (type === t.className) {
                    push(node, [
                        node.ns,
                        hspan(t.className, `.${value}`),
                    ]);
                }
                if (type === t.id) {
                    push(node, [
                        node.ns,
                        hspan(t.id, `#${value}`),
                    ]);
                }
                if (type === t.combinator || type === t.universal) {
                    push(node, hspan(type, value));
                }
            });
        }

        loop(selectors, reference);
    };
}

export type ToVDOMOptions = {
    wrap?: boolean
};

/**
 * Convert a PostCSS AST into a virtual DOM tree, with hastscript.
 *
 * @constructor
 * @private
 * @param {Object} [opts] Options object.
 * @param {boolean} [opts.wrap=true] Wrap the output with `<pre class="midas"></pre>`.
 * By default, the CSS will also be wrapped with `<code></code>`.
 */

class ToVDOM {

    wrap: boolean;
    ast: Array<h|string>;

    constructor (opts?: ToVDOMOptions) {
        const {wrap} = {
            wrap: true,
            ...opts,
        };
        this.wrap = wrap;
    }

    getContent (node: Object) {
        this.ast = [];
        this.handle(node);
        const code = h('code', this.ast);

        if (this.wrap) {
            return h('pre.midas', code);
        }

        return code;
    }

    /**
     * Given a PostCSS node, call the method that corresponds to its
     * defined type. The "self" variable here is for Flow's benefit.
     *
     * @param node PostCSS node.
     * @param semicolon Should the method add a semicolon to the output?
     */

    handle (node: Object, semicolon?: boolean) {
        const self:Object = this;
        self[node.type](node, semicolon);
    }

    atrule (node: Object, semicolon: boolean) {
        const {ast} = this;
        const name = [hspan(t.atRuleName, `@${node.name}`)];

        const container = [];

        if (node.params) {
            let parsed = valueParser(rawValue(node, 'params'));
            parsed.nodes.forEach(child => {
                const {value, type} = child;
                if (type === t.string) {
                    const {quote} = child;
                    container.push(hspan(t.string, `${quote}${value}${quote}`));
                    return;
                }
                if (~mediaTypes.indexOf(value) && node.name === 'media') {
                    container.push(hspan(t.atRuleKeyword, value));
                    return;
                }
                if (type === t.func) {
                    const funcValues = [];

                    if (value) {
                        funcValues.push(hspan(t.funcName, value));
                    }

                    funcValues.push(
                        hspan(t.parenthesis, '('),
                        child.before
                    );

                    child.nodes.forEach((n, i) => {
                        if (n.type === 'div' && n.value === ':') {
                            funcValues.push(hspan(t.colon, `${n.before}${n.value}${n.after}`));
                            return;
                        }
                        if (n.type === 'div') {
                            funcValues.push(`${n.before}${n.value}${n.after}`);
                            return;
                        }
                        if (n.type === t.word) {
                            let number = unit(n.value);
                            if (number) {
                                funcValues.push(hspan(t.number, n.value));
                                return;
                            }
                            if (
                                child.nodes[i + 1] &&
                                child.nodes[i + 1].value === ':'
                            ) {
                                funcValues.push(hspan(t.property, n.value));
                                return;
                            }
                        }
                        if (n.type === t.string) {
                            const {quote} = n;
                            funcValues.push(hspan(t.string, `${quote}${n.value}${quote}`));
                            return;
                        }
                        funcValues.push(n.value);
                    });
                    funcValues.push(
                        child.after,
                        hspan(t.parenthesis, ')'),
                    );

                    container.push(
                        hspan(t.func, funcValues),
                    );
                    return;
                }
                if (type === 'div') {
                    container.push(`${child.before}${value}${child.after}`);
                    return;
                }
                container.push(value);
            });
        }

        if (typeof node.raws.afterName !== 'undefined') {
            name.push(node.raws.afterName);
        }

        if (node.nodes) {
            this.block(node, hspan(t.atRule, [...name, ...container]));
        } else {
            let end = node.raws.between || '';
            const atrule = [...name, ...container, end];
            if (semicolon) {
                atrule.push(hspan(t.semicolon, ';'));
            }
            ast.push(hspan(t.atRule, atrule));
        }
    }

    body (node: Object) {
        let last = node.nodes.length - 1;
        while (last > 0 ) {
            if (node.nodes[last].type !== t.comment) {
                break;
            }
            last --;
        }

        const semicolon = raw(node, 'semicolon');
        for (let i = 0; i < node.nodes.length; i++) {
            const child  = node.nodes[i];
            const before = raw(child, 'before');
            if (before) {
                this.ast.push(before);
            }
            this.handle(child, last !== i || semicolon);
        }
    }

    block (node: Object, start: h|Array<h|string>) {
        const {ast} = this;
        ast.push(
            start,
            raw(node, 'between', 'beforeOpen'),
            hspan(t.brace, '{'),
        );

        let after = raw(node, 'after', 'emptyBody');
        if (node.nodes && node.nodes.length) {
            this.body(node);
            after = raw(node, 'after');
        }

        ast.push(
            after,
            hspan(t.brace, '}'),
        );
    }

    comment (node: Object) {
        const left  = raw(node, 'left', 'commentLeft');
        const right = raw(node, 'right', 'commentRight');
        this.ast.push(hspan(t.comment, `/*${left}${node.text}${right}*/`));
    }

    decl (node: Object, semicolon: boolean) {
        const {ast} = this;

        const hasVendor = vendors.some(vendor => {
            const prefix = `-${vendor}-`;
            if (!node.prop.indexOf(prefix)) {
                ast.push(hspan(t.property, [
                    hspan(t.vendorPrefix, prefix),
                    node.prop.replace(prefix, ''),
                ]));
                return true;
            }
        });

        if (!hasVendor) {
            ast.push(hspan(t.property, node.prop));
        }

        ast.push(
            hspan(t.colon, raw(node, 'between', t.colon)),
        );

        const parsed = valueParser(rawValue(node, t.value));
        const declValues = [];
        walkDeclValues(parsed, declValues);
        ast.push(hspan(t.value, declValues));

        if (node.important) {
            ast.push(hspan(t.important, node.raws.important || ` !${t.important}`));
        }

        if (semicolon) {
            ast.push(hspan(t.semicolon, ';'));
        }
    }

    rule (node: Object) {
        const selectorVals = [];
        selectorParser(selectorValues(selectorVals)).process(rawValue(node, t.selector)).result;
        this.block(node, hspan(t.selector, selectorVals));
    }

    root (node: Object) {
        this.body(node);
        if (node.raws.after) {
            this.ast.push(node.raws.after);
        }
    }
}

export default ToVDOM;
