import htmlTags from 'html-tags';
import Stringifier from 'postcss/lib/stringifier';
import selectorParser from 'postcss-selector-parser';
import valueParser, {unit, stringify} from 'postcss-value-parser';
import * as t from './types';

const mediaTypes = [
    'all',
    'aural',
    'braille',
    'embossed',
    'handheld',
    'print',
    'projection',
    'screen',
    'tty',
    'tv',
];

const vendors = [
    '-webkit-',
    '-moz-',
    '-ms-',
    '-o-',
];

let span = (text, element) => `<span class="midas__${element}">${text}</span>`;

export default class MidasStringifier extends Stringifier {

    atrule (node, semicolon) {
        let name   = span('@' + node.name, t.atRuleName);
        let params = node.params ? this.rawValue(node, 'params') : '';

        if (params) {
            let parsed = valueParser(this.rawValue(node, 'params'));
            parsed.nodes.forEach(child => {
                if (child.type === t.string) {
                    const {quote} = child;
                    child.value = span(quote + child.value + quote, t.string);
                    child.quote = null;
                    return;
                }
                if (~mediaTypes.indexOf(child.value) && node.name === 'media') {
                    child.value = span(child.value, t.atRuleKeyword);
                    return;
                }
                if (child.type === 'function' && !child.value) {
                    child.nodes.forEach((n, i) => {
                        if (n.type === 'div' && n.value === ':') {
                            n.value = span(':', t.colon);
                        }
                        if (n.type === t.word) {
                            let number = unit(n.value);
                            if (number) {
                                n.value = span(n.value, t.number);
                                return;
                            }
                            if (
                                child.nodes[i + 1] &&
                                child.nodes[i + 1].value === ':'
                            ) {
                                n.value = span(n.value, t.property);
                            }
                        }
                    });
                    child.value = span('(', t.parenthesis) +
                                 stringify(child.nodes) +
                                 span(')', t.parenthesis);
                    child.nodes = null;
                }
            });
            params = stringify(parsed);
        }

        if (typeof node.raws.afterName !== 'undefined') {
            name += node.raws.afterName;
        } else if (params) {
            name += ' ';
        }

        if (node.nodes) {
            this.block(node, span(name + params, t.atRule));
        } else {
            let semi = semicolon ? span(';', t.semicolon) : '';
            let end = (node.raws.between || '') + semi;
            this.builder(span(name + params + end, t.atRule), node);
        }
    }

    block (node, start) {
        let between = this.raw(node, 'between', 'beforeOpen');
        this.builder(`${start}${between}${span('{', t.brace)}`, node, 'start');

        let after;
        if (node.nodes && node.nodes.length) {
            this.body(node);
            after = this.raw(node, 'after');
        } else {
            after = this.raw(node, 'after', 'emptyBody');
        }

        if (after) {
            this.builder(after);
        }
        this.builder(span('}', t.brace), node, 'end');
    }

    constructor (builder, opts = {}) {
        super(builder);

        this.opts = {
            wrap: true,
            ...opts,
        };
    }

    comment (node) {
        const left  = this.raw(node, 'left',  'commentLeft');
        const right = this.raw(node, 'right', 'commentRight');
        this.builder(span(`/*${left}${node.text}${right}*/`, t.comment), node);
    }

    decl (node, semicolon) {
        let between = span(this.raw(node, 'between', t.colon), t.colon);
        let parsed = valueParser(this.rawValue(node, t.value));
        let transform = n => {
            if (n.type === t.string) {
                const {quote} = n;
                n.value = span(quote + n.value + quote, t.string);
                n.quote = null;
                return;
            }
            if (n.type === t.word) {
                let number = unit(n.value);
                if (number) {
                    n.value = span(n.value, 'number');
                    return;
                }
                if (!n.value.indexOf('#')) {
                    let val = span(n.value.slice(1), t.hexValue);
                    n.value = span('#' + val, t.hexColor);
                    return;
                }
                n.value = span(n.value, t.word);
                return;
            }
            if (n.type === t.func) {
                n.nodes.forEach(transform);
                n.value = span(
                    span(n.value, t.funcName) +
                    span('(' + n.before, t.parenthesis) +
                    stringify(n.nodes) +
                    span(n.after + ')', t.parenthesis),
                    t.func);
                n.nodes = null;
            }
        };
        parsed.nodes.forEach(transform);
        vendors.some(vendor => {
            if (~node.prop.indexOf(vendor)) {
                const prefix = span(vendor, t.vendorPrefix);
                node.prop = node.prop.replace(vendor, prefix);
            }
        });

        let prop = span(node.prop, t.property);
        let string = prop + between + span(String(parsed), t.value);

        if (node.important) {
            string += span(node.raws.important || ' !important', t.important);
        }

        if (semicolon) {
            string += span(';', t.semicolon);
        }
        this.builder(string, node);
    }

    root (node) {
        if (this.opts.wrap) {
            this.builder('<pre class="midas"><code>');
            super.root(node);
            this.builder('</code></pre>');
        } else {
            super.root(node);
        }
    }

    rule (node) {
        if (node.selector) {
            this.selector(node);
        }
        this.block(node, span(this.rawValue(node, t.selector), t.selector));
    }

    selector (node) {
        let transform = selectors => {
            selectors.walk(sel => {
                if (sel.type === t.tag && ~htmlTags.indexOf(sel.value)) {
                    sel.value = span(sel.value, t.tag);
                }
                if (sel.type === t.attribute) {
                    sel.toString = function () {
                        let selector = [
                            this.spaces.before,
                            span('[', t.attributeBrace),
                            this.ns,
                            span(this.attribute, t.attributeName),
                        ];

                        if (this.operator) {
                            let op = span(this.operator, t.attributeOperator);
                            selector.push(op);
                        }
                        if (this.value) {
                            selector.push(span(this.value, t.attributeValue));
                        }
                        let ai = t.attributeInsensitive;
                        if (this.raws.insensitive) {
                            let ci = span(this.raws.insensitive, ai);
                            selector.push(ci);
                        } else if (this.insensitive) {
                            selector.push(span(' i'), ai);
                        }
                        selector.push(span(']', t.attributeBrace));
                        let str = selector.concat(this.spaces.after).join('');
                        return span(str, t.attribute);
                    };
                }
                if (sel.type === t.pseudo) {
                    sel.toString = function () {
                        let params = this.length ?
                            span('(', t.parenthesis) +
                            this.map(String).join(',') +
                            span(')', t.parenthesis) : '';

                        return [
                            this.spaces.before,
                            span(String(this.value), t.pseudo),
                            params,
                            this.spaces.after,
                        ].join('');
                    };
                }
                if (sel.type === t.className) {
                    sel.toString = function () {
                        return [
                            this.spaces.before,
                            this.ns,
                            span(String('.' + this.value), t.className),
                            this.spaces.after,
                        ].join('');
                    };
                }
                if (sel.type === t.id) {
                    sel.toString = function () {
                        return [
                            this.spaces.before,
                            this.ns,
                            span(String('#' + this.value), t.id),
                            this.spaces.after,
                        ].join('');
                    };
                }
                if (sel.type === t.universal) {
                    sel.value = span(sel.value, t.universal);
                }
                if (sel.type === t.combinator) {
                    sel.value = span(sel.value, t.combinator);
                }
            });
        };

        node.selector = selectorParser(transform).process(node.selector).result;
    }

}
