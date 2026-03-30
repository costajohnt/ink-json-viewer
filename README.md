# ink-json-viewer

[![npm version](https://img.shields.io/npm/v/ink-json-viewer.svg)](https://www.npmjs.com/package/ink-json-viewer)
[![CI](https://github.com/costajohnt/ink-json-viewer/actions/workflows/ci.yml/badge.svg)](https://github.com/costajohnt/ink-json-viewer/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/ink-json-viewer.svg)](https://github.com/costajohnt/ink-json-viewer/blob/master/LICENSE)

<p align="center">
  <img src="media/demo.gif" alt="ink-json-viewer demo" width="600">
</p>

Interactive, collapsible JSON tree viewer component for [Ink](https://github.com/vadimdemedes/ink). Renders any JavaScript value as a navigable, syntax-colored tree in the terminal.

## Features

- Collapsible/expandable tree nodes with expand/collapse all
- Syntax coloring for 16 value types
- Full keyboard navigation (arrows, vim-style home/end, expand all, collapse all)
- Virtual scrolling for large data sets (10K+ nodes)
- Circular reference detection
- Customizable color themes
- TypeScript-first with full type exports
- Headless hooks for custom UI

## Install

```
npm install ink-json-viewer
```

Peer dependencies: `ink >= 5.0.0` and `react >= 18.0.0`.

## Quick Start

```tsx
import React from 'react';
import {render} from 'ink';
import {JsonViewer} from 'ink-json-viewer';

const data = {
  name: 'ink-json-viewer',
  version: '0.1.0',
  features: ['collapsible', 'keyboard nav', 'syntax coloring'],
  config: {maxHeight: 20, theme: 'default'},
  active: true,
  tags: null,
};

render(<JsonViewer data={data} defaultExpandDepth={1} />);
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `unknown` | *required* | The value to render. Accepts any JS value: objects, arrays, primitives, Date, RegExp, Map, Set, BigInt, Symbol, functions, etc. |
| `defaultExpandDepth` | `number` | `1` | Number of depth levels to expand on initial render. `0` = fully collapsed, `Infinity` = fully expanded. |
| `maxHeight` | `number` | `20` | Maximum number of visible rows before virtual scrolling kicks in. |
| `showRootBraces` | `boolean` | `true` | Whether to show the outermost brackets for the root value. When `false`, the root `{}`/`[]` rows are omitted and children render at depth 0 (unindented). |
| `sortKeys` | `boolean` | `false` | Alphabetically sort object keys. |
| `enableKeyboard` | `boolean` | `true` | Enable keyboard navigation and interaction. |
| `indentWidth` | `number` | `2` | Number of spaces per indentation level. |
| `maxStringLength` | `number` | `120` | Maximum display length for string values before truncation (includes quotes). |
| `onSelect` | `(path: string, value: unknown) => void` | `undefined` | Called when Enter is pressed on a leaf node. Receives the JSON path and raw value. |
| `theme` | `Partial<JsonViewerTheme>` | `undefined` | Partial theme overrides merged with the default theme. |
| `isActive` | `boolean` | `true` | Whether the component is focused/active for keyboard input. Useful when embedding alongside other interactive components. |
| `rootLabel` | `string` | `undefined` | Label to display for the root node (e.g., the variable name). |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Down Arrow` | Move focus to the next node |
| `Up Arrow` | Move focus to the previous node |
| `Right Arrow` | Expand focused node, or move to first child if already expanded |
| `Left Arrow` | Collapse focused node, or move to parent if already collapsed |
| `Enter` | Toggle expand/collapse on containers; triggers `onSelect` on leaf nodes |
| `Space` | Toggle expand/collapse on containers |
| `g` | Jump to the first node |
| `G` | Jump to the last node |
| `*` or `e` | Expand all nodes |
| `-` or `E` | Collapse all nodes |

> **Note:** Search is planned for a future release.

## Syntax Coloring

Each value type renders in a distinct color by default:

| Type | Color |
|------|-------|
| `string` | green |
| `number` | yellow |
| `boolean` | magenta |
| `null` | red (dim) |
| `undefined` | red (dim) |
| `date` | green |
| `regexp` | green |
| `bigint` | yellow |
| `symbol` | green (dim) |
| `function` | red (dim, italic) |
| `circular` | red (bold) |
| `object` | gray (preview) |
| `array` | gray (preview) |
| `map` | gray (preview) |
| `set` | gray (preview) |
| keys | white |
| brackets | gray |
| focus indicator | blue |

## Supported Value Types

The viewer detects and renders 16 value types:

| Type | Rendered As |
|------|------------|
| `string` | `"hello"` (with escaping for `\n`, `\t`, `\\`, `\"`) |
| `number` | `42`, `3.14`, `-1` |
| `boolean` | `true`, `false` |
| `null` | `null` |
| `undefined` | `undefined` |
| `date` | ISO string, e.g. `2024-01-15T00:00:00.000Z`. Invalid dates render as `Invalid Date`. |
| `regexp` | `/pattern/flags` |
| `bigint` | `42n` |
| `symbol` | `Symbol(description)` |
| `function` | `[Function: name]` |
| `object` | Expandable tree with `{N keys}` collapsed preview |
| `array` | Expandable tree with `[N items]` collapsed preview |
| `map` | Expandable tree with `Map(N)` preview |
| `set` | Expandable tree with `Set(N)` preview |
| `circular` | `[Circular]` (bold red) |
| `unknown` | `[Max depth exceeded]` when nesting exceeds 100 levels |

## Virtual Scrolling

When the visible row count exceeds `maxHeight`, the viewer enables virtual scrolling. Only `maxHeight` rows are rendered at a time. Scroll indicators appear at the top and bottom to show how many rows are hidden:

```
  ^ 3 more
  ...visible rows...
  v 12 more
```

The scroll window automatically follows the focused row as you navigate.

## Theme Customization

Override any color by passing a partial `theme` prop:

```tsx
<JsonViewer
  data={myData}
  theme={{
    colors: {
      string: 'cyan',
      number: 'blueBright',
      focusIndicator: 'greenBright',
    },
  }}
/>
```

All color values are Ink/Chalk color names (e.g., `'red'`, `'greenBright'`, `'gray'`).

Available theme keys: `string`, `number`, `boolean`, `null`, `key`, `bracket`, `expandIcon`, `focusIndicator`, `focusedRowPrefix`, `circular`, `truncation`, `preview`.

## Large Data

The component handles large data sets efficiently through:

- **Flat node list**: The tree is flattened into a single array during the initial pass, avoiding recursive rendering.
- **Virtual scrolling**: Only `maxHeight` rows are rendered at any time, keeping DOM size constant regardless of data size.
- **Lazy visibility**: Collapsed subtrees are skipped entirely when computing visible rows.
- **Immutable state updates**: The reducer produces new state objects without mutating previous state.

For data with 10,000+ nodes, set `defaultExpandDepth` to `0` or `1` and rely on `maxHeight` (default 20) to keep the initial render fast. Users can expand sections on demand.

## Headless Usage

For custom UI, import the hooks and utilities directly:

```tsx
import {
  flattenTree,
  buildNodeIndex,
  detectType,
  formatValue,
  formatKey,
  truncate,
  defaultTheme,
  mergeTheme,
} from 'ink-json-viewer';

import type {JsonViewerState} from 'ink-json-viewer';
```

- `flattenTree(data, options?)` converts any value into a flat `JsonNode[]` array
- `buildNodeIndex(nodes)` creates a `Map<string, JsonNode>` for O(1) lookups
- `detectType(value)` returns the `JsonValueType` for any value
- `formatValue(value, type, maxStringLength)` formats a value for display
- `formatKey(key)` formats a property key (quoting if needed)
- `truncate(string, maxLength)` truncates with ellipsis
- `defaultTheme` / `mergeTheme(base, overrides)` for theme management
- `JsonViewerState` is the full state object returned by the internal `useJsonViewerState` hook, including navigation methods like `focusNext()`, `expandAll()`, etc.

## TypeScript

All types are exported for use in your own components:

```ts
import type {
  JsonValueType,     // Union of all 16 type strings
  JsonNode,          // A node in the flattened tree
  VisibleRow,        // A row in the visible output
  JsonViewerTheme,   // Color theme shape
  JsonViewerProps,   // Component props
  JsonViewerState,   // Full viewer state with navigation methods
  ExpandState,       // ReadonlyMap<string, boolean> of expanded nodes
  TreeState,         // Internal reducer state
} from 'ink-json-viewer';
```

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes and add tests
4. Run `npm test` and `npx tsc --noEmit` to verify
5. Commit and open a pull request

## Changelog

See [GitHub Releases](https://github.com/costajohnt/ink-json-viewer/releases).

## License

MIT
