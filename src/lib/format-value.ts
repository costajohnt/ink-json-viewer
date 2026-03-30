import type {JsonValueType} from '../types.js';

function escapeString(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll('"', '\\"')
		.replaceAll('\n', '\\n')
		.replaceAll('\r', '\\r')
		.replaceAll('\t', '\\t');
}

export function formatValue(
	value: unknown,
	type: JsonValueType,
	maxStringLength: number,
): string {
	switch (type) {
		case 'string': {
			const raw = value as string;
			// Truncate the raw string BEFORE escaping to avoid splitting escape sequences.
			// Account for the surrounding quotes (2 chars) and ellipsis (3 chars).
			const maxRawLength = maxStringLength - 2;
			if (raw.length > maxRawLength) {
				const truncatedRaw = maxRawLength <= 3
					? raw.slice(0, maxRawLength)
					: raw.slice(0, maxRawLength - 3) + '...';
				return `"${escapeString(truncatedRaw)}"`;
			}

			return `"${escapeString(raw)}"`;
		}

		case 'number': {
			return String(value);
		}

		case 'boolean': {
			return String(value);
		}

		case 'null': {
			return 'null';
		}

		case 'undefined': {
			return 'undefined';
		}

		case 'date': {
			return (value as Date).toISOString();
		}

		case 'regexp': {
			return (value as RegExp).toString();
		}

		case 'bigint': {
			return `${String(value)}n`;
		}

		case 'symbol': {
			return (value as symbol).toString();
		}

		case 'function': {
			const name = (value as Function).name || 'anonymous'; // eslint-disable-line @typescript-eslint/ban-types
			return `[Function: ${name}]`;
		}

		case 'circular': {
			return '[Circular]';
		}

		case 'object': {
			return '{}';
		}

		case 'array': {
			return '[]';
		}

		case 'map': {
			return `Map(${(value as Map<unknown, unknown>).size})`;
		}

		case 'set': {
			return `Set(${(value as Set<unknown>).size})`;
		}

		default: {
			return String(value);
		}
	}
}

export function formatKey(key: string | number): string {
	if (typeof key === 'number') {
		return String(key);
	}

	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
		return key;
	}

	return `"${key}"`;
}
