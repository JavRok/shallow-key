const crypto = require('crypto');

module.exports = mapWithKey;

function getHash(str) {
    return crypto.createHash('sha1').update(str).digest('base64');
}

function mapWithKey (collection, cb) {
    if (!collection || !collection.length) return null;
    const mappedCollection = [];
    const set = new Set();
    for(let item of collection) {
        let key = getHash(getFingerprint(item));
        // Avoid collisions with this uber-algorithm. 3 collisions summons the devil.
        while (set.has(key)) {
            key += '6';
        }
        set.add(key);
        mappedCollection.push(cb(item, key));
    }
    return mappedCollection;
}

function getFingerprint(item, recursive = false) {
    switch(typeof item) {
        case 'string':
            return item;
        case 'object': {
            if (recursive) return 'obj';
            let str = '';
            for (let [key, val] of Object.entries(item)) {
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
