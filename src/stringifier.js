'use strict';

import htmlTags from 'html-tags';
import Stringifier from 'postcss/lib/stringifier';
import selectorParser from 'postcss-selector-parser';
import valueParser, {unit, stringify} from 'postcss-value-parser';

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
    'tv'
];

const vendors = [
    '-webkit-',
    '-moz-',
    '-ms-',
    '-o-'
];

let span = (text, element) => `<span class="midas__${element}">${text}</span>`;

export default class MidasStringifier extends Stringifier {

    atrule (node, semicolon) {
        let name   = span('@' + node.name, 'at-rule-name');
        let params = node.params ? this.rawValue(node, 'params') : '';

        if (params) {
            let parsed = valueParser(this.rawValue(node, 'params'));
            parsed.nodes.forEach(child => {
                if (child.type === 'string') {
                    let quote = child.quote;
                    child.value = span(quote + child.value + quote, 'string');
                    child.quote = null;
                    return;
                }
                if (~mediaTypes.indexOf(child.value) && node.name === 'media') {
                    child.value = span(child.value, 'at-rule-keyword');
                    return;
                }
                if (child.type === 'function' && !child.value) {
                    child.nodes.forEach((n, i) => {
                        if (n.type === 'div' && n.value === ':') {
                            n.value = span(':', 'colon');
                        }
                        if (n.type === 'word') {
                            let number = unit(n.value);
                            if (number) {
                                n.value = span(n.value, 'number');
                                return;
                            }
                            if (child.nodes[i + 1].value === ':') {
                                n.value = span(n.value, 'property');
                            }
                        }
                    });
                    child.value = span('(', 'parenthesis') +
                                 stringify(child.nodes) +
                                 span(')', 'parenthesis');
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
            this.block(node, span(name + params, 'at-rule'));
        } else {
            let semi = semicolon ? span(';', 'semicolon') : '';
            let end = (node.raws.between || '') + semi;
            this.builder(span(name + params + end, 'at-rule'), node);
        }
    }

    block (node, start) {
        let between = this.raw(node, 'between', 'beforeOpen');
        this.builder(`${start}${between}${span('{', 'brace')}`, node, 'start');

        let after;
        if (node.nodes && node.nodes.length) {
            this.body(node);
            after = this.raw(node, 'after');
        } else {
            after = this.raw(node, 'after', 'emptyBody');
        }

        if (after) { this.builder(after); }
        this.builder(span('}', 'brace'), node, 'end');
    }

    comment (node) {
        let left  = this.raw(node, 'left',  'commentLeft');
        let right = this.raw(node, 'right', 'commentRight');
        this.builder(span(`/*${left}${node.text}${right}*/`, 'comment'), node);
    }

    decl (node, semicolon) {
        let between = span(this.raw(node, 'between', 'colon'), 'colon');
        let parsed = valueParser(this.rawValue(node, 'value'));
        let transform = node => {
            if (node.type === 'string') {
                let quote = node.quote;
                node.value = span(quote + node.value + quote, 'string');
                node.quote = null;
                return;
            }
            if (node.type === 'word') {
                let number = unit(node.value);
                if (number) {
                    node.value = span(node.value, 'number');
                    return;
                }
                if (!node.value.indexOf('#')) {
                    let value = span(node.value.slice(1), 'hex-value');
                    node.value = span('#' + value, 'hex-color');
                    return;
                }
                node.value = span(node.value, 'word');
                return;
            }
            if (node.type === 'function') {
                node.nodes.forEach(transform);
                node.value = span(
                    span(node.value, 'function-name') +
                    span('(', 'parenthesis') +
                    stringify(node.nodes) +
                    span(')', 'parenthesis'),
                    'function');
                node.nodes = null;
            }
        };
        parsed.nodes.forEach(transform);
        vendors.some(vendor => {
            if (~node.prop.indexOf(vendor)) {
                let prefix = span(vendor, 'vendor-prefix');
                node.prop = node.prop.replace(vendor, prefix);
            }
        });

        let prop = span(node.prop, 'property');
        let string = prop + between + span(String(parsed), 'value');

        if (node.important) {
            string += span(node.raws.important || ' !important', 'important');
        }

        if (semicolon) { string += span(';', 'semicolon'); }
        this.builder(string, node);
    }

    root (node) {
        this.builder('<pre class="midas"><code>');
        super.root(node);
        this.builder('</code></pre>');
    }

    rule (node) {
        if (node.selector) { this.selector(node); }
        this.block(node, span(this.rawValue(node, 'selector'), 'selector'));
    }

    selector (node) {
        let transform = selectors => {
            selectors.eachInside(sel => {
                if (sel.type === 'tag' && ~htmlTags.indexOf(sel.value)) {
                    sel.value = span(sel.value, 'tag');
                }
                if (sel.type === 'attribute') {
                    sel.toString = function () {
                        let selector = [
                            this.spaces.before,
                            span('[', 'attribute-brace'),
                            this.ns,
                            span(this.attribute, 'attribute-name')
                        ];

                        if (this.operator) {
                            let op = span(this.operator, 'attribute-operator');
                            selector.push(op);
                        }
                        if (this.value) {
                            selector.push(span(this.value, 'attribute-value'));
                        }
                        let ai = 'attribute-insensitive';
                        if (this.raw.insensitive) {
                            let ci = span(this.raw.insensitive, ai);
                            selector.push(ci);
                        } else if (this.insensitive) {
                            selector.push(span(' i'), ai);
                        }
                        selector.push(span(']', 'attribute-brace'));
                        let str = selector.concat(this.spaces.after).join('');
                        return span(str, 'attribute');
                    };
                }
                if (sel.type === 'pseudo') {
                    sel.toString = function () {
                        let params = this.length ?
                            span('(', 'parenthesis') +
                            this.map(String).join(',') +
                            span(')', 'parenthesis') : '';

                        return [
                            this.spaces.before,
                            span(String(this.value), 'pseudo'),
                            params,
                            this.spaces.after
                        ].join('');
                    };
                }
                if (sel.type === 'class') {
                    sel.toString = function () {
                        return [
                            this.spaces.before,
                            this.ns,
                            span(String('.' + this.value), 'class'),
                            this.spaces.after
                        ].join('');
                    };
                }
                if (sel.type === 'id') {
                    sel.toString = function () {
                        return [
                            this.spaces.before,
                            this.ns,
                            span(String('#' + this.value), 'id'),
                            this.spaces.after
                        ].join('');
                    };
                }
                if (sel.type === 'universal') {
                    sel.value = span(sel.value, 'universal');
                }
                if (sel.type === 'combinator') {
                    sel.value = span(sel.value, 'combinator');
                }
            });
        };

        node.selector = selectorParser(transform).process(node.selector).result;
    }

}
