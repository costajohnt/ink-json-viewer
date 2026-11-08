import type {JsonValueType} from '../types.js';

/**
 Render C0, DEL and C1 control characters (ESC included) as visible `\uXXXX`
 escapes so untrusted data cannot emit terminal control sequences (OSC 52
 clipboard writes, OSC 8 links, SGR styling, cursor moves), whatever Ink
 version renders it.
 */
export function escapeControlChars(value: string): string {
	// eslint-disable-next-line no-control-regex, regexp/no-control-character
	return value.replaceAll(/[\u{0}-\u{1F}\u{7F}-\u{9F}]/gu, char => `\\u${char.codePointAt(0)!.toString(16).padStart(4, '0')}`);
}

function escapeString(value: string): string {
	return escapeControlChars(value
		.replaceAll('\\', '\\\\')
		.replaceAll('"', '\\"')
		.replaceAll('\n', '\\n')
		.replaceAll('\r', '\\r')
		.replaceAll('\t', '\\t'));
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
			const d = value as Date;
			return Number.isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString();
		}

		case 'regexp': {
			return escapeControlChars((value as RegExp).toString());
		}

		case 'bigint': {
			return `${String(value)}n`;
		}

		case 'symbol': {
			return escapeControlChars((value as symbol).toString());
		}

		case 'function': {
			// Anonymous functions have an empty-string name, so fall back to
			// 'anonymous' for both a missing and an empty name.
			const {name} = value as {name?: string};
			return `[Function: ${name === undefined || name === '' ? 'anonymous' : escapeControlChars(name)}]`;
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

	if (/^[$a-z_][\w$]*$/i.test(key)) {
		return key;
	}

	const escaped = escapeString(key);
	return `"${escaped}"`;
}
