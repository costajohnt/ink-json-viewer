import {useMemo} from 'react';
import {Box, Text, useIsScreenReaderEnabled} from 'ink';
import type {JsonViewerProps} from '../../types.js';
import {defaultTheme, mergeTheme} from '../../theme.js';
import {useJsonViewerState} from './use-json-viewer-state.js';
import {useJsonViewer} from './use-json-viewer.js';
import {JsonNodeRow} from './json-node-row.js';

export function JsonViewer({
	data,
	defaultExpandDepth = 1,
	maxHeight = 20,
	showRootBraces = true,
	sortKeys = false,
	enableKeyboard = true,
	onSelect,
	theme: themeOverrides,
	indentWidth = 2,
	maxStringLength = 120,
	isActive = true,
	rootLabel,
}: JsonViewerProps) {
	const theme = useMemo(
		() => mergeTheme(defaultTheme, themeOverrides),
		[themeOverrides],
	);

	const state = useJsonViewerState({
		data,
		defaultExpandDepth,
		maxHeight,
		sortKeys,
		showRootBraces,
		rootLabel,
		maxStringLength,
	});

	useJsonViewer({state, isActive: enableKeyboard && isActive, onSelect});

	const isScreenReaderEnabled = useIsScreenReaderEnabled();

	const visibleSlice = state.visibleRows.slice(
		state.visibleFromIndex,
		state.visibleToIndex,
	);

	const totalNodes = useMemo(
		() => state.visibleRows.filter(r => r.kind === 'node').length,
		[state.visibleRows],
	);
	const containerLabel = rootLabel
		? `${rootLabel} JSON viewer, ${totalNodes} items`
		: `JSON viewer, ${totalNodes} items`;

	return (
		<Box flexDirection="column" aria-role="list" aria-label={containerLabel}>
			{state.visibleFromIndex > 0 && (
				<Text dimColor aria-hidden>{'  '}\u2191 {state.visibleFromIndex} more</Text>
			)}
			{visibleSlice.map(row => (
				<JsonNodeRow
					key={`${row.nodeId}-${row.kind}-${row.index}`}
					row={row}
					node={state.nodeIndex.get(row.nodeId)!}
					isExpanded={state.expandState.get(row.nodeId) ?? false}
					isFocused={
						row.kind === 'node' && row.nodeId === state.focusedNodeId
					}
					theme={theme}
					indentWidth={indentWidth}
					maxStringLength={maxStringLength}
					isScreenReaderEnabled={isScreenReaderEnabled}
				/>
			))}
			{state.visibleToIndex < state.visibleRows.length && (
				<Text dimColor aria-hidden>{'  '}\u2193 {state.visibleRows.length - state.visibleToIndex} more</Text>
			)}
		</Box>
	);
}
