import type {JsonNode} from '../types.js';
import {detectType} from './detect-type.js';
import {formatValue} from './format-value.js';

const maxDepth = 100;

const expandableTypes = new Set(['object', 'array', 'map', 'set']);

export type FlattenOptions = {
	sortKeys?: boolean;
	rootLabel?: string;
};

/**
 * Percent-encode the delimiter characters used to build node ids so that
 * object keys containing '.', '[', ']' (or '%' itself) cannot collide with
 * the structural separators. '%' is escaped first to keep the encoding
 * injective. Object keys are prefixed with '.', array indices with '[n]',
 * so the two spaces never overlap.
 */
function encodeKeySegment(key: string): string {
	return key
		.replaceAll('%', '%25')
		.replaceAll('.', '%2E')
		.replaceAll('[', '%5B')
		.replaceAll(']', '%5D');
}

function buildPath(parentId: string | undefined, key: string | number | undefined): string {
	if (parentId === undefined) {
		return '$';
	}

	if (typeof key === 'number') {
		return `${parentId}[${key}]`;
	}

	return `${parentId}.${encodeKeySegment(key!)}`;
}

const keyPreviewMaxLength = 40;
const keyPreviewMaxEntries = 3;

/**
 * Short single-line preview of a non-string Map key, used as its display
 * label (for example `1`, `true`, `{a: 1}`, `[1, 2]`). String keys are not
 * previewed: they keep their plain key so formatKey quotes them as needed,
 * which also keeps the string "1" visibly distinct from the number 1.
 */
function previewKey(key: unknown, depth = 0): string {
	const type = detectType(key);
	switch (type) {
		case 'object': {
			const entries = Object.entries(key as Record<string, unknown>);
			if (entries.length === 0) {
				return '{}';
			}

			if (depth > 0) {
				return '{…}';
			}

			const shown = entries
				.slice(0, keyPreviewMaxEntries)
				.map(([k, v]) => `${k}: ${previewKey(v, depth + 1)}`);
			const more = entries.length > keyPreviewMaxEntries ? ', …' : '';
			return truncateLabel(`{${shown.join(', ')}${more}}`);
		}

		case 'array': {
			const items = key as unknown[];
			if (items.length === 0) {
				return '[]';
			}

			if (depth > 0) {
				return '[…]';
			}

			const shown = items
				.slice(0, keyPreviewMaxEntries)
				.map(v => previewKey(v, depth + 1));
			const more = items.length > keyPreviewMaxEntries ? ', …' : '';
			return truncateLabel(`[${shown.join(', ')}${more}]`);
		}

		default: {
			return truncateLabel(formatValue(key, type, keyPreviewMaxLength));
		}
	}
}

function truncateLabel(label: string): string {
	return label.length > keyPreviewMaxLength
		? `${label.slice(0, keyPreviewMaxLength - 1)}…`
		: label;
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

type ChildEntry = [
	key: string | number,
	value: unknown,
	/** Id override: Map children are identified by position, not by key. */
	id?: string,
	/** Display label for keys that are not plain strings or indices. */
	keyLabel?: string,
];

function getEntries(
	value: unknown,
	type: string,
	sortKeys: boolean,
	parentId: string,
): ChildEntry[] {
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
			// Map keys can be any value, and distinct keys can stringify the
			// same (two object keys, the number 1 and the string "1"). Ids are
			// therefore built from the entry position. They cannot collide with
			// other ids: '.' and '[' are always structural (encodeKeySegment
			// escapes them in keys), so an id like `P.<map>[0]` can only come
			// from a Map at P, and a node at P is never both a Map and an
			// object with a `<map>` key.
			const mapEntries: ChildEntry[] = [];
			let index = 0;
			for (const [k, v] of value as Map<unknown, unknown>) {
				const id = `${parentId}.<map>[${index}]`;
				if (typeof k === 'string') {
					mapEntries.push([k, v, id]);
				} else {
					const label = previewKey(k);
					mapEntries.push([label, v, id, label]);
				}

				index++;
			}

			return mapEntries;
		}

		case 'set': {
			const setEntries: ChildEntry[] = [];
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
		placement: {parentId: string | undefined; id: string; keyLabel?: string},
	): void {
		const {parentId, id, keyLabel} = placement;
		const type = detectType(value);
		const labelField = keyLabel === undefined ? {} : {keyLabel};

		if (depth > maxDepth) {
			nodes.push({
				id,
				depth,
				type: 'unknown',
				key,
				...labelField,
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
					...labelField,
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

		const childCount = expandableTypes.has(type) ? getChildCount(value, type) : 0;
		const isExpandable = expandableTypes.has(type) && childCount > 0;

		const node: JsonNode = {
			id,
			depth,
			type,
			key,
			...labelField,
			value,
			isExpandable,
			childCount,
			parentId,
			childIds: [],
			isCircular: false,
		};

		nodes.push(node);

		if (isExpandable) {
			const entries = getEntries(value, type, sortKeys, id);
			for (const [childKey, childValue, childIdOverride, childKeyLabel] of entries) {
				const childId = childIdOverride ?? buildPath(id, childKey);
				node.childIds.push(childId);
				traverse(childValue, childKey, depth + 1, {parentId: id, id: childId, keyLabel: childKeyLabel});
			}
		}

		// Remove from seen after processing so that shared (non-circular)
		// references to the same object in sibling branches are not flagged as circular.
		// This must run for ALL object-typed values, not just expandable ones,
		// otherwise shared non-expandable objects (Date, RegExp, empty objects/arrays)
		// would be incorrectly marked as circular.
		if (value !== null && typeof value === 'object') {
			seen.delete(value);
		}
	}

	traverse(data, options.rootLabel, 0, {parentId: undefined, id: buildPath(undefined, undefined)});

	return nodes;
}
