import {prototype as proto} from 'postcss/lib/stringifier';

/*
 * Borrows raw value handling methods from PostCSS' stringifier.
 */

export function raw () {
    return proto.raw.apply(proto, arguments);
}

export function rawValue () {
    return proto.rawValue.apply(proto, arguments);
}
