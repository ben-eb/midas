// @flow

import h from 'hastscript';

/**
 * Sugar for creating a virtual span node with a styling hook.
 *
 * @private
 * @param identifier The string used as part of the styling hook.
 * @param contents List of child nodes or a single child node.
 */

export default function hspan (identifier: string, contents: Array<h|string>|string): h {
    return h(`span.midas__${identifier}`, contents);
}
