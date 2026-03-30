import {describe, it, expect} from 'vitest';
import {buildNodeIndex} from '../src/lib/node-map.js';
import {flattenTree} from '../src/lib/flatten-tree.js';

describe('buildNodeIndex', () => {
	it('builds a map from node id to node', () => {
		const nodes = flattenTree({name: 'John', age: 30});
		const index = buildNodeIndex(nodes);

		expect(index.size).toBe(3);
		expect(index.get('$')).toBeDefined();
		expect(index.get('$.name')).toBeDefined();
		expect(index.get('$.age')).toBeDefined();
	});

	it('enables O(1) parent lookup', () => {
		const nodes = flattenTree({user: {name: 'John'}});
		const index = buildNodeIndex(nodes);

		const nameNode = index.get('$.user.name')!;
		expect(nameNode.parentId).toBe('$.user');

		const parentNode = index.get(nameNode.parentId!)!;
		expect(parentNode.key).toBe('user');
	});

	it('enables O(1) child lookup', () => {
		const nodes = flattenTree({a: 1, b: 2});
		const index = buildNodeIndex(nodes);

		const root = index.get('$')!;
		expect(root.childIds).toHaveLength(2);

		const firstChild = index.get(root.childIds[0]!)!;
		expect(firstChild.key).toBe('a');
	});

	it('handles sibling navigation via parent childIds', () => {
		const nodes = flattenTree({a: 1, b: 2, c: 3});
		const index = buildNodeIndex(nodes);

		const root = index.get('$')!;
		const siblingIds = root.childIds;

		expect(siblingIds).toHaveLength(3);
		expect(index.get(siblingIds[0]!)!.key).toBe('a');
		expect(index.get(siblingIds[1]!)!.key).toBe('b');
		expect(index.get(siblingIds[2]!)!.key).toBe('c');
	});
});
