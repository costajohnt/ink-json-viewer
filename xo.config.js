/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	{
		ignores: ['examples/**', 'tsup.config.ts', 'vitest.config.ts'],
	},
	{
		react: true,
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			// Disabled: XO's stylistic rules conflict with Ink JSX patterns
			'@stylistic/indent': 'off',
			'@stylistic/jsx-quotes': 'off',
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/function-paren-newline': 'off',
			'@stylistic/no-trailing-spaces': 'off',
			'@stylistic/eol-last': 'off',
			'@stylistic/key-spacing': 'off',
			'@stylistic/jsx-tag-spacing': 'off',
			'react/jsx-closing-tag-location': 'off',
			'react/jsx-sort-props': 'off',
			'react/no-array-index-key': 'off',
			'capitalized-comments': 'off',
			'require-unicode-regexp': 'off',
			'unicorn/prefer-at': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/strict-void-return': 'off',
			'react/jsx-indent': 'off',
			'react/jsx-indent-props': 'off',
			'react/jsx-tag-spacing': 'off',
			'react/prefer-read-only-props': 'off',
			'react/boolean-prop-naming': 'off',
			'unicorn/no-hex-escape': 'off',
			'new-cap': 'off',
			'no-promise-executor-return': 'off',
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
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
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
