# Changelog

## [0.4.0](https://github.com/costajohnt/ink-json-viewer/compare/v0.3.0...v0.4.0) (2026-07-25)


### Features

* export the headless hooks useJsonViewerState and useJsonViewer ([e44763e](https://github.com/costajohnt/ink-json-viewer/commit/e44763e5f9b3b45f31d8d79a73e00eabaff8f84e)), closes [#7](https://github.com/costajohnt/ink-json-viewer/issues/7)

## 0.3.0 (2026-07-01)

### Breaking Changes
- Removed the unused `focusedRowPrefix` and `truncation` theme keys from
  `JsonViewerTheme`. Because `theme` is `Partial<JsonViewerTheme>` (only
  `colors` is optional, not its keys), consumers that override the theme
  had to supply every key; dropping these two is a breaking type change,
  hence the minor bump. Remove them from any `theme.colors` override.
- `onSelect`'s path argument (the node id) now percent-encodes `.`, `[`,
  `]`, and `%` in each string key segment. A key like `a.b` that previously
  produced the ambiguous id `$.a.b` now yields `$.a%2Eb`. This only affects
  keys containing those characters; plain keys are unchanged.

### Bug Fixes
- Scroll indicators now render the real `↑`/`↓` arrow glyphs instead of the
  literal `↑`/`↓` escape text (the escapes were in JSX text nodes).
- Node ids are now collision-proof: object keys containing `.`, `[`, or `]`
  (e.g. `{'a.b': 1, a: {b: 2}}`) no longer alias other nodes, so the viewer
  renders the correct key/value and expand state no longer cross-contaminates.

### Other
- Corrected the README (peer deps, Node engine, version strings, honest
  "Large Data" description, `onSelect` id encoding) and dropped the stray
  `import React` from examples.
- Added an `xo` lint step (script + CI) and fixed the reported violations.

## 0.1.0 (2026-03-30)

### Features
- Interactive collapsible JSON tree viewer
- Syntax coloring for 16 value types
- Keyboard navigation with vim-style shortcuts
- Virtual scrolling for large datasets
- Circular reference detection
- `showRootBraces` prop
- Theme customization
- Headless hooks for custom UIs
