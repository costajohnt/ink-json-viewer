import base from '@costajohnt/ink-config/xo';

/**
@type {import('xo').FlatXoConfig}
*/
const xoConfig = [
	...base,
	{
		rules: {
			// This component inspects arbitrary runtime values: after a runtime
			// type tag it asserts the matching concrete type from `unknown`, and
			// its switches fall back on a `default` rather than enumerating all
			// 16 value types in every consumer.
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			// `obj`/`prev` etc. are conventional here.
			'unicorn/prevent-abbreviations': 'off',
			// Escape-definition strings read clearer with explicit backslashes.
			'unicorn/prefer-string-raw': 'off',
			// The reducer and visible-row builders are flat switch/loop bodies;
			// splitting them purely to satisfy the metric hurts readability.
			complexity: 'off',
			// Sorting a locally-owned array in place is fine (toSorted is not in
			// the es2022 lib target).
			'unicorn/no-array-sort': 'off',
		},
	},
	{
		files: ['test/**'],
		rules: {
			// Test fixtures use SCREAMING_CASE key constants and arbitrary
			// property names (e.g. 'a.b', 'foo[0]') on purpose.
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'func-names': 'off',
			'func-name-matching': 'off',
			'symbol-description': 'off',
			'unicorn/prefer-bigint-literals': 'off',
			'prefer-regex-literals': 'off',
			'@stylistic/curly-newline': 'off',
		},
	},
];

export default xoConfig;
