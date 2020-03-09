"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var crypto = require('crypto');

module.exports = mapWithKey;

function getHash(str) {
    return crypto.createHash('sha1').update(str).digest('base64');
}

function mapWithKey(collection, cb) {
    if (!collection || !collection.length) return null;
    var mappedCollection = [];
    var set = new Set();

    for (var _iterator = collection, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var item = _ref;
        var key = getHash(getFingerprint(item)); // Avoid collisions with this uber-algorithm. 3 collisions summons the devil.

        while (set.has(key)) {
            key += '6';
        }

        set.add(key);
        mappedCollection.push(cb(item, key));
    }

    return mappedCollection;
}

function getFingerprint(item, recursive) {
    if (recursive === void 0) {
        recursive = false;
    }

    switch (_typeof(item)) {
        case 'string':
            return item;

        case 'object':
        {
            if (item === null) return 'null'; // Thanks JS

            if (recursive) return 'obj';
            var str = '';

            for (var _i2 = 0, _Object$entries = Object.entries(item); _i2 < _Object$entries.length; _i2++) {
                var _Object$entries$_i = _Object$entries[_i2],
                    key = _Object$entries$_i[0],
                    val = _Object$entries$_i[1];
                str += key + getFingerprint(val, true);
            }

            return str;
        }

        case 'function':
            return item.name + '()';

        case 'undefined':
            return 'undef';

        case 'number':
        case 'boolean':
        default:
            return item.toString();
    }
}
