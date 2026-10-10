import {describe, it, expect} from 'vitest';
import {flattenTree} from '../src/lib/flatten-tree.js';

describe('flattenTree', () => {
	it('flattens a primitive value into a single node', () => {
		const nodes = flattenTree('hello');
		expect(nodes).toHaveLength(1);
		expect(nodes[0]!.type).toBe('string');
		expect(nodes[0]!.value).toBe('hello');
		expect(nodes[0]!.depth).toBe(0);
		expect(nodes[0]!.isExpandable).toBe(false);
	});

	it('flattens a simple object', () => {
		const nodes = flattenTree({name: 'John', age: 30});
		expect(nodes).toHaveLength(3);

		// Root node
		expect(nodes[0]!.type).toBe('object');
		expect(nodes[0]!.depth).toBe(0);
		expect(nodes[0]!.isExpandable).toBe(true);
		expect(nodes[0]!.childCount).toBe(2);

		// Children
		expect(nodes[1]!.key).toBe('name');
		expect(nodes[1]!.value).toBe('John');
		expect(nodes[1]!.depth).toBe(1);
		expect(nodes[1]!.parentId).toBe('$');

		expect(nodes[2]!.key).toBe('age');
		expect(nodes[2]!.value).toBe(30);
		expect(nodes[2]!.depth).toBe(1);
	});

	it('flattens an array', () => {
		const nodes = flattenTree([1, 2, 3]);
		expect(nodes).toHaveLength(4);
		expect(nodes[0]!.type).toBe('array');
		expect(nodes[0]!.childCount).toBe(3);
		expect(nodes[1]!.key).toBe(0);
		expect(nodes[2]!.key).toBe(1);
		expect(nodes[3]!.key).toBe(2);
	});

	it('flattens nested objects', () => {
		const nodes = flattenTree({user: {name: 'John'}});
		expect(nodes).toHaveLength(3);
		expect(nodes[0]!.id).toBe('$');
		expect(nodes[1]!.id).toBe('$.user');
		expect(nodes[1]!.isExpandable).toBe(true);
		expect(nodes[2]!.id).toBe('$.user.name');
		expect(nodes[2]!.depth).toBe(2);
	});

	it('detects circular references', () => {
		const object: Record<string, unknown> = {a: 1};
		object.self = object;

		const nodes = flattenTree(object);
		expect(nodes).toHaveLength(3);
		const circularNode = nodes.find(n => n.isCircular);
		expect(circularNode).toBeDefined();
		expect(circularNode!.type).toBe('circular');
		expect(circularNode!.isExpandable).toBe(false);
	});

	it('handles special types', () => {
		const data = {
			date: new Date('2024-01-15T00:00:00.000Z'),
			regex: /test/gi,
			bigint: BigInt(42),
			sym: Symbol('test'),
			fn: function myFunc() {},
			undef: undefined,
		};

		const nodes = flattenTree(data);
		const types = nodes.slice(1).map(n => n.type);
		expect(types).toContain('date');
		expect(types).toContain('regexp');
		expect(types).toContain('bigint');
		expect(types).toContain('symbol');
		expect(types).toContain('function');
		expect(types).toContain('undefined');
	});

	it('handles Map values', () => {
		const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
		const nodes = flattenTree(map);
		expect(nodes[0]!.type).toBe('map');
		expect(nodes[0]!.isExpandable).toBe(true);
		expect(nodes[0]!.childCount).toBe(2);
	});

	it('handles Set values', () => {
		const set = new Set([1, 2, 3]);
		const nodes = flattenTree(set);
		expect(nodes[0]!.type).toBe('set');
		expect(nodes[0]!.isExpandable).toBe(true);
		expect(nodes[0]!.childCount).toBe(3);
	});

	it('handles empty objects', () => {
		const nodes = flattenTree({});
		expect(nodes).toHaveLength(1);
		expect(nodes[0]!.type).toBe('object');
		expect(nodes[0]!.isExpandable).toBe(false);
		expect(nodes[0]!.childCount).toBe(0);
	});

	it('handles empty arrays', () => {
		const nodes = flattenTree([]);
		expect(nodes).toHaveLength(1);
		expect(nodes[0]!.type).toBe('array');
		expect(nodes[0]!.isExpandable).toBe(false);
		expect(nodes[0]!.childCount).toBe(0);
	});

	it('sorts keys when sortKeys is true', () => {
		const nodes = flattenTree({c: 3, a: 1, b: 2}, {sortKeys: true});
		expect(nodes[1]!.key).toBe('a');
		expect(nodes[2]!.key).toBe('b');
		expect(nodes[3]!.key).toBe('c');
	});

	it('builds correct path ids', () => {
		const nodes = flattenTree({users: [{name: 'John'}]});
		expect(nodes[0]!.id).toBe('$');
		expect(nodes[1]!.id).toBe('$.users');
		expect(nodes[2]!.id).toBe('$.users[0]');
		expect(nodes[3]!.id).toBe('$.users[0].name');
	});

	it('sets parentId and childIds correctly', () => {
		const nodes = flattenTree({a: 1, b: 2});
		expect(nodes[0]!.childIds).toEqual(['$.a', '$.b']);
		expect(nodes[1]!.parentId).toBe('$');
		expect(nodes[2]!.parentId).toBe('$');
	});

	it('enforces max depth', () => {
		// Build deeply nested object
		let object: Record<string, unknown> = {value: 'leaf'};
		for (let i = 0; i < 105; i++) {
			object = {nested: object};
		}

		const nodes = flattenTree(object);
		const deepest = nodes[nodes.length - 1]!;
		// Should hit max depth and stop
		expect(deepest.type).toBe('unknown');
		expect(deepest.value).toBe('[Max depth exceeded]');
	});

	it('uses rootLabel when provided', () => {
		const nodes = flattenTree({a: 1}, {rootLabel: 'data'});
		expect(nodes[0]!.key).toBe('data');
	});

	it('does not flag shared non-expandable objects as circular', () => {
		const sharedDate = new Date('2024-01-01');
		const nodes = flattenTree({a: sharedDate, b: sharedDate});
		const circularNodes = nodes.filter(n => n.isCircular);
		expect(circularNodes).toHaveLength(0);
		expect(nodes.find(n => n.key === 'a')!.type).toBe('date');
		expect(nodes.find(n => n.key === 'b')!.type).toBe('date');
	});

	it('does not flag shared empty objects as circular', () => {
		const empty = {};
		const nodes = flattenTree({a: empty, b: empty});
		const circularNodes = nodes.filter(n => n.isCircular);
		expect(circularNodes).toHaveLength(0);
		expect(nodes.find(n => n.key === 'a')!.type).toBe('object');
		expect(nodes.find(n => n.key === 'b')!.type).toBe('object');
	});

	it('does not flag shared RegExp as circular', () => {
		const re = /test/gi;
		const nodes = flattenTree({a: re, b: re});
		const circularNodes = nodes.filter(n => n.isCircular);
		expect(circularNodes).toHaveLength(0);
	});

	it('still detects actual circular references', () => {
		const object: Record<string, unknown> = {a: 1};
		object.self = object;
		const nodes = flattenTree(object);
		expect(nodes.filter(n => n.isCircular)).toHaveLength(1);
	});

	it('gives unambiguous ids when a dotted key collides with a nested path', () => {
		const nodes = flattenTree({'a.b': 1, a: {b: 2}});
		const ids = nodes.map(n => n.id);
		// All ids are unique (no collision between "a.b" leaf and a -> b)
		expect(new Set(ids).size).toBe(ids.length);

		const dotted = nodes.find(n => n.key === 'a.b')!;
		const aChildB = nodes.find(n => n.parentId !== '$' && n.key === 'b')!;
		expect(dotted.value).toBe(1);
		expect(aChildB.value).toBe(2);
		expect(dotted.id).not.toBe(aChildB.id);
	});

	it('gives unambiguous ids when a bracketed key collides with an array index', () => {
		const nodes = flattenTree({foo: ['x'], 'foo[0]': 'y'});
		const ids = nodes.map(n => n.id);
		expect(new Set(ids).size).toBe(ids.length);

		const arrayItem = nodes.find(n => n.parentId === '$.foo' && n.key === 0)!;
		const bracketKey = nodes.find(n => n.key === 'foo[0]')!;
		expect(arrayItem.value).toBe('x');
		expect(bracketKey.value).toBe('y');
		expect(arrayItem.id).not.toBe(bracketKey.id);
	});

	it('escapes % before the delimiters so a key that looks pre-encoded stays distinct', () => {
		// Guards the escape ORDER in encodeKeySegment: 'a.b' encodes to
		// "a%2Eb", and the literal key "a%2Eb" must NOT encode to the same
		// thing. If '%' were escaped after '.', both would become "a%252Eb".
		const nodes = flattenTree({'a.b': 1, 'a%2Eb': 2});
		const ids = nodes.map(n => n.id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(nodes.find(n => n.key === 'a.b')!.id).not.toBe(
			nodes.find(n => n.key === 'a%2Eb')!.id,
		);
	});

	it('keeps ids distinct for keys that collide only on the % escape', () => {
		const nodes = flattenTree({'50%': 1, '50%25': 2});
		const ids = nodes.map(n => n.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('gives unambiguous ids for a deeply-nested dotted-key collision', () => {
		const nodes = flattenTree({'a.b.c': 1, a: {b: {c: 2}}});
		const ids = nodes.map(n => n.id);
		expect(new Set(ids).size).toBe(ids.length);

		const dotted = nodes.find(n => n.key === 'a.b.c')!;
		const deepLeaf = nodes.find(n => n.parentId === '$.a.b' && n.key === 'c')!;
		expect(dotted.value).toBe(1);
		expect(deepLeaf.value).toBe(2);
		expect(dotted.id).not.toBe(deepLeaf.id);
	});

	it('gives Map entries unique ids even when keys stringify the same', () => {
		const nodes = flattenTree({
			m: new Map<unknown, unknown>([
				[{a: 1}, {x: 1}],
				[{b: 2}, {y: 2}],
				[1, 'num'],
				['1', 'str'],
			]),
		});
		const ids = nodes.map(n => n.id);
		expect(new Set(ids).size).toBe(ids.length);

		const map = nodes.find(n => n.id === '$.m')!;
		expect(map.childIds).toHaveLength(4);
		const children = map.childIds.map(id => nodes.find(n => n.id === id)!);
		expect(children.map(n => n.value)).toEqual([{x: 1}, {y: 2}, 'num', 'str']);
	});

	it('labels non-string Map keys with a preview and leaves string keys plain', () => {
		const nodes = flattenTree(new Map<unknown, unknown>([
			[{a: 1}, 'obj'],
			[[1, 2], 'arr'],
			[1, 'num'],
			['1', 'str'],
			[true, 'bool'],
		]));
		const children = nodes[0]!.childIds.map(id => nodes.find(n => n.id === id)!);
		expect(children.map(n => n.keyLabel)).toEqual(['{a: 1}', '[1, 2]', '1', undefined, 'true']);
		expect(children[3]!.key).toBe('1');
	});

	it('keeps object-keyed Map entries independent for children lookup', () => {
		const nodes = flattenTree(new Map<unknown, unknown>([
			[{a: 1}, {x: 1}],
			[{b: 2}, {y: 2}],
		]));
		const [first, second] = nodes[0]!.childIds.map(id => nodes.find(n => n.id === id)!);
		expect(first!.childIds).toHaveLength(1);
		expect(second!.childIds).toHaveLength(1);
		expect(first!.childIds[0]).not.toBe(second!.childIds[0]);
	});
});
