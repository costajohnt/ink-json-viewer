import type {JsonViewerTheme} from './types.js';

export const defaultTheme: JsonViewerTheme = {
	colors: {
		string: 'green',
		number: 'yellow',
		boolean: 'magenta',
		null: 'red',
		key: 'white',
		bracket: 'gray',
		expandIcon: 'gray',
		focusIndicator: 'blue',
		focusedRowPrefix: 'blue',
		searchMatch: 'yellowBright',
		circular: 'red',
		truncation: 'gray',
		preview: 'gray',
	},
};

export function mergeTheme(
	base: JsonViewerTheme,
	overrides?: Partial<JsonViewerTheme>,
): JsonViewerTheme {
	if (!overrides) {
		return base;
	}

	return {
		colors: {
			...base.colors,
			...overrides.colors,
		},
	};
}
