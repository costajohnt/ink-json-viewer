import type {JsonValueType} from '../types.js';

export function detectType(value: unknown): JsonValueType {
	if (value === null) {
		return 'null';
	}

	if (value === undefined) {
		return 'undefined';
	}

	if (typeof value === 'string') {
		return 'string';
	}

	if (typeof value === 'number') {
		return 'number';
	}

	if (typeof value === 'boolean') {
		return 'boolean';
	}

	if (typeof value === 'bigint') {
		return 'bigint';
	}

	if (typeof value === 'symbol') {
		return 'symbol';
	}

	if (typeof value === 'function') {
		return 'function';
	}

	if (value instanceof Date) {
		return 'date';
	}

	if (value instanceof RegExp) {
		return 'regexp';
	}

	if (value instanceof Map) {
		return 'map';
	}

	if (value instanceof Set) {
		return 'set';
	}

	if (Array.isArray(value)) {
		return 'array';
	}

	if (typeof value === 'object') {
		return 'object';
	}

	return 'unknown';
}
