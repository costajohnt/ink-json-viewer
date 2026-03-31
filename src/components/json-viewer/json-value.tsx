import {Text} from 'ink';
import type {JsonValueType, JsonViewerTheme} from '../../types.js';
import {formatValue} from '../../lib/format-value.js';

type JsonValueProps = {
	value: unknown;
	type: JsonValueType;
	theme: JsonViewerTheme;
	maxStringLength: number;
};

export function JsonValue({value, type, theme, maxStringLength}: JsonValueProps) {
	const formatted = formatValue(value, type, maxStringLength);

	switch (type) {
		case 'string': {
			return <Text color={theme.colors.string}>{formatted}</Text>;
		}

		case 'number': {
			return <Text color={theme.colors.number}>{formatted}</Text>;
		}

		case 'boolean': {
			return <Text color={theme.colors.boolean}>{formatted}</Text>;
		}

		case 'null': {
			return <Text color={theme.colors.null} dimColor>{formatted}</Text>;
		}

		case 'undefined': {
			return <Text color={theme.colors.null} dimColor>{formatted}</Text>;
		}

		case 'date': {
			return <Text color={theme.colors.string}>{formatted}</Text>;
		}

		case 'regexp': {
			return <Text color={theme.colors.string}>{formatted}</Text>;
		}

		case 'bigint': {
			return <Text color={theme.colors.number}>{formatted}</Text>;
		}

		case 'symbol': {
			return <Text color={theme.colors.string} dimColor>{formatted}</Text>;
		}

		case 'function': {
			return <Text color={theme.colors.null} dimColor italic>{formatted}</Text>;
		}

		case 'circular': {
			return <Text color={theme.colors.circular} bold>{formatted}</Text>;
		}

		case 'object':
		case 'array':
		case 'map':
		case 'set': {
			return <Text color={theme.colors.preview}>{formatted}</Text>;
		}

		default: {
			return <Text>{formatted}</Text>;
		}
	}
}
