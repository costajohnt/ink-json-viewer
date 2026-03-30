import type {JsonNode} from '../types.js';
import {detectType} from './detect-type.js';

const MAX_DEPTH = 100;

export type FlattenOptions = {
	sortKeys?: boolean;
	rootLabel?: string;
};

function buildPath(parentId: string | undefined, key: string | number | undefined): string {
	if (parentId === undefined) {
		return '$';
	}

	if (typeof key === 'number') {
		return `${parentId}[${key}]`;
	}

	return `${parentId}.${key as string}`;
}

function getChildCount(value: unknown, type: string): number {
	switch (type) {
		case 'object': {
			return Object.keys(value as Record<string, unknown>).length;
		}

		case 'array': {
			return (value as unknown[]).length;
		}

		case 'map': {
			return (value as Map<unknown, unknown>).size;
		}

		case 'set': {
			return (value as Set<unknown>).size;
		}

		default: {
			return 0;
		}
	}
}

function getEntries(
	value: unknown,
	type: string,
	sortKeys: boolean,
): Array<[string | number, unknown]> {
	switch (type) {
		case 'object': {
			let entries = Object.entries(value as Record<string, unknown>);
			if (sortKeys) {
				entries = entries.sort(([a], [b]) => a.localeCompare(b));
			}

			return entries;
		}

		case 'array': {
			return (value as unknown[]).map((v, i) => [i, v]);
		}

		case 'map': {
			const mapEntries: Array<[string | number, unknown]> = [];
			let index = 0;
			for (const [k, v] of value as Map<unknown, unknown>) {
				mapEntries.push([String(k), v]);
				index++;
			}

			return mapEntries;
		}

		case 'set': {
			const setEntries: Array<[string | number, unknown]> = [];
			let index = 0;
			for (const v of value as Set<unknown>) {
				setEntries.push([index, v]);
				index++;
			}

			return setEntries;
		}

		default: {
			return [];
		}
	}
}

export function flattenTree(data: unknown, options: FlattenOptions = {}): JsonNode[] {
	const nodes: JsonNode[] = [];
	const seen = new WeakSet();
	const {sortKeys = false} = options;

	function traverse(
		value: unknown,
		key: string | number | undefined,
		depth: number,
		parentId: string | undefined,
	): void {
		const type = detectType(value);
		const id = buildPath(parentId, key);

		if (depth > MAX_DEPTH) {
			nodes.push({
				id,
				depth,
				type: 'unknown',
				key,
				value: '[Max depth exceeded]',
				isExpandable: false,
				childCount: 0,
				parentId,
				childIds: [],
				isCircular: false,
			});
			return;
		}

		// Circular reference detection for objects/arrays/maps/sets
		if (
			value !== null
			&& typeof value === 'object'
		) {
			if (seen.has(value)) {
				nodes.push({
					id,
					depth,
					type: 'circular',
					key,
					value,
					isExpandable: false,
					childCount: 0,
					parentId,
					childIds: [],
					isCircular: true,
				});
				return;
			}

			seen.add(value);
		}

		const expandableTypes = new Set(['object', 'array', 'map', 'set']);
		const childCount = expandableTypes.has(type) ? getChildCount(value, type) : 0;
		const isExpandable = expandableTypes.has(type) && childCount > 0;

		const node: JsonNode = {
			id,
			depth,
			type,
			key,
			value,
			isExpandable,
			childCount,
			parentId,
			childIds: [],
			isCircular: false,
		};

		nodes.push(node);

		if (isExpandable) {
			const entries = getEntries(value, type, sortKeys);
			for (const [childKey, childValue] of entries) {
				const childId = buildPath(id, childKey);
				node.childIds.push(childId);
				traverse(childValue, childKey, depth + 1, id);
			}

			// Remove from seen after processing children so that shared (non-circular)
			// references to the same object in sibling branches are not flagged as circular.
			if (value !== null && typeof value === 'object') {
				seen.delete(value as object);
			}
		}
	}

	traverse(data, options.rootLabel, 0, undefined);

	return nodes;
}
