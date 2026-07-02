# Changelog

## 0.2.1 (2026-07-01)

### Bug Fixes
- Scroll indicators now render the real `↑`/`↓` arrow glyphs instead of the
  literal `↑`/`↓` escape text (the escapes were in JSX text nodes).
- Node ids are now collision-proof: object keys containing `.`, `[`, or `]`
  (e.g. `{'a.b': 1, a: {b: 2}}`) no longer alias other nodes, so the viewer
  renders the correct key/value and expand state no longer cross-contaminates.

### Other
- Removed the unused `focusedRowPrefix` and `truncation` theme keys.
- Corrected the README (peer deps, Node engine, version strings, honest
  "Large Data" description) and dropped the stray `import React` from examples.
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
