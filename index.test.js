require('jest');
const mapWithKey = require('./');


test('loops over array returning hashed keys, length >= 24', () => {
    const mockCallback = jest.fn((item, key) => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(24);
        return {item, key};
    });
    const example = ['1', 2, '3'];
    const mappedCollection = mapWithKey(example, mockCallback);
    expect(mockCallback.mock.calls.length).toBe(example.length);
    expect(mappedCollection.length).toBe(example.length);
});

test('does not return duplicated keys on the same collection', () => {
    const example = ['1', '2', '2', '3', {a: 1}, {a: 1}];
    let keys = new Set();
    mapWithKey(example, (item, key) => {
        expect(keys.has(key)).toBe(false);
        keys.add(key);
    });
});

test('does return same key for same basic element', () => {
    const example = ['1', {a: 1, b: 2}];
    const first = mapWithKey(example, (item, key) => key);
    const exampleReversed = example.reverse();
    const second = mapWithKey(exampleReversed, (item, key) => key);
    expect(first[0]).toBe(second[1]);
    expect(first[1]).toBe(second[0]);
});


test('does return key for objects base on 1st level props (shallow)', () => {
    const example = [
        {a: 1, b: {b1: 2}, c: [1, 2, 3]},
        {a: 2, b: {b2: 9}, c: [5, 6, 7]}
    ];
    const first = mapWithKey(example, (item, key) => key);
    const exampleReversed = example.reverse();
    const second = mapWithKey(exampleReversed, (item, key) => key);
    expect(first[0]).toBe(second[1]);
    expect(first[1]).toBe(second[0]);
});

test('differences in deep levels are ignored (shallow)', () => {
    const example1 = [
        {a: 1, b: {b1: 2}, c: 3},

    ];
    const example2 = [
        {a: 1, b: {b2: 9}, c: 3}
    ];

    const first = mapWithKey(example1, (item, key) => key);
    const second = mapWithKey(example2, (item, key) => key);

    expect(first[0]).toBe(second[0]);
});


test('works with all data types', () => {
    const example = [
        {a: 1, b: {b1: 2}, c: '333', e: true, f: new Date(), g: undefined, h: null, i: NaN, j: Symbol("id")},
    ];

    const first = mapWithKey(example, (item, key) => key);
    const second = mapWithKey(example, (item, key) => key);

    expect(first[0]).toBe(second[0]);
});
