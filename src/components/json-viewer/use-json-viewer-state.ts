import {useCallback, useEffect, useMemo, useReducer, useRef} from 'react';
import type {
	ExpandState,
	JsonNode,
	TreeAction,
	TreeState,
	VisibleRow,
} from '../../types.js';
import {flattenTree, type FlattenOptions} from '../../lib/flatten-tree.js';
import {buildNodeIndex} from '../../lib/node-map.js';

export function computeVisibleRows(
	nodes: readonly JsonNode[],
	expandState: ExpandState,
	nodeIndex: ReadonlyMap<string, JsonNode>,
	showRootBraces = true,
): VisibleRow[] {
	// Determine the root node id (first node, depth 0)
	const rootNodeId = nodes.length > 0 ? nodes[0]!.id : undefined;
	const rootNode = rootNodeId ? nodeIndex.get(rootNodeId) : undefined;
	// Only hide braces when showRootBraces is false AND the root is an expandable container
	const hideRootBraces = !showRootBraces && rootNode?.isExpandable === true;

	// Pass 1: collect visible node rows, skipping children of collapsed containers
	const nodeRows: VisibleRow[] = [];
	let skipUntilDepth = -1;

	for (const node of nodes) {
		if (skipUntilDepth >= 0) {
			if (node.depth > skipUntilDepth) {
				continue;
			}

			skipUntilDepth = -1;
		}

		// When hiding root braces, skip the root container row itself
		if (hideRootBraces && node.id === rootNodeId) {
			// If root is expanded, its children will appear; if collapsed, skip all
			if (!expandState.get(node.id)) {
				// Root is collapsed and we're hiding braces, so show nothing meaningful.
				// Still push the root row so there's something to focus on.
				nodeRows.push({
					nodeId: node.id,
					depth: 0,
					kind: 'node',
					index: 0,
				});
				skipUntilDepth = node.depth;
			}

			// If expanded, skip the root row but let children through
			continue;
		}

		// When hiding root braces, render root's children at depth - 1
		const depth = hideRootBraces ? Math.max(0, node.depth - 1) : node.depth;

		nodeRows.push({
			nodeId: node.id,
			depth,
			kind: 'node',
			index: 0, // Will be reassigned in pass 2
		});

		if (node.isExpandable) {
			if (expandState.get(node.id)) {
				// Expanded: children will naturally appear
			} else {
				// Collapsed: skip children
				skipUntilDepth = node.depth;
			}
		}
	}

	// Pass 2: insert closing brackets for expanded containers
	const finalRows: VisibleRow[] = [];
	const openContainers: Array<{nodeId: string; depth: number; type: string}> = [];

	for (const row of nodeRows) {
		// Close any containers that should close before this row
		while (
			openContainers.length > 0
			&& openContainers[openContainers.length - 1]!.depth >= row.depth
		) {
			const container = openContainers.pop()!;
			const node = nodeIndex.get(container.nodeId);
			const bracket = (node?.type === 'array' || node?.type === 'set') ? ']' : '}';
			finalRows.push({
				nodeId: container.nodeId,
				depth: container.depth,
				kind: 'closing-bracket',
				closingBracket: bracket as '}' | ']',
				index: finalRows.length,
			});
		}

		finalRows.push({...row, index: finalRows.length});

		// If this is an expanded container, push to stack
		const node = nodeIndex.get(row.nodeId);
		if (
			row.kind === 'node'
			&& node?.isExpandable
			&& expandState.get(node.id)
		) {
			// When hiding root braces, don't track the root as an open container
			if (!(hideRootBraces && node.id === rootNodeId)) {
				openContainers.push({
					nodeId: node.id,
					depth: row.depth,
					type: node.type,
				});
			}
		}
	}

	// Close any remaining open containers
	while (openContainers.length > 0) {
		const container = openContainers.pop()!;
		const node = nodeIndex.get(container.nodeId);
		const bracket = (node?.type === 'array' || node?.type === 'set') ? ']' : '}';
		finalRows.push({
			nodeId: container.nodeId,
			depth: container.depth,
			kind: 'closing-bracket',
			closingBracket: bracket as '}' | ']',
			index: finalRows.length,
		});
	}

	return finalRows;
}

export function createDefaultExpandState(
	nodes: readonly JsonNode[],
	defaultExpandDepth: number,
): Map<string, boolean> {
	const expandState = new Map<string, boolean>();
	for (const node of nodes) {
		if (node.isExpandable && node.depth < defaultExpandDepth) {
			expandState.set(node.id, true);
		}
	}

	return expandState;
}

type InitArgs = {
	nodes: readonly JsonNode[];
	defaultExpandDepth: number;
	maxHeight: number;
	showRootBraces: boolean;
};

function createInitialState(args: InitArgs): TreeState {
	const {nodes, defaultExpandDepth, maxHeight, showRootBraces} = args;
	const expandState = createDefaultExpandState(nodes, defaultExpandDepth);
	const nodeIndex = buildNodeIndex(nodes);
	const visibleRows = computeVisibleRows(nodes, expandState, nodeIndex, showRootBraces);

	return {
		nodes,
		nodeIndex,
		expandState,
		focusedNodeId: visibleRows[0]?.nodeId,
		focusedRowIndex: 0,
		visibleRows,
		visibleFromIndex: 0,
		visibleToIndex: Math.min(maxHeight, visibleRows.length),
		maxHeight,
		showRootBraces,
	};
}

function findRowIndexByNodeId(
	visibleRows: readonly VisibleRow[],
	nodeId: string | undefined,
): number {
	if (!nodeId) {
		return 0;
	}

	// Only match 'node' kind rows for focus, not closing brackets
	const index = visibleRows.findIndex(
		r => r.nodeId === nodeId && r.kind === 'node',
	);
	return index >= 0 ? index : 0;
}

function clampScrollWindow(
	focusedRowIndex: number,
	visibleRowCount: number,
	maxHeight: number,
	currentFrom: number,
): {visibleFromIndex: number; visibleToIndex: number} {
	let from = currentFrom;

	// Always try to show maxHeight rows (or all rows if fewer)
	let to = Math.min(visibleRowCount, from + maxHeight);

	// Clamp from to valid range
	from = Math.max(0, to - maxHeight);

	// Ensure focused row is visible
	if (focusedRowIndex >= to) {
		to = Math.min(visibleRowCount, focusedRowIndex + 1);
		from = Math.max(0, to - maxHeight);
	} else if (focusedRowIndex < from) {
		from = focusedRowIndex;
		to = Math.min(visibleRowCount, from + maxHeight);
	}

	return {visibleFromIndex: from, visibleToIndex: to};
}

function reducer(state: TreeState, action: TreeAction): TreeState {
	const {nodeIndex} = state;

	switch (action.type) {
		case 'focus-next': {
			let nextIndex = state.focusedRowIndex + 1;
			while (nextIndex < state.visibleRows.length && state.visibleRows[nextIndex]!.kind === 'closing-bracket') {
				nextIndex++;
			}

			if (nextIndex >= state.visibleRows.length) {
				return state;
			}

			const nextRow = state.visibleRows[nextIndex]!;
			const scroll = clampScrollWindow(
				nextIndex,
				state.visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				focusedNodeId: nextRow.nodeId,
				focusedRowIndex: nextIndex,
				...scroll,
			};
		}

		case 'focus-previous': {
			let prevIndex = state.focusedRowIndex - 1;
			while (prevIndex >= 0 && state.visibleRows[prevIndex]!.kind === 'closing-bracket') {
				prevIndex--;
			}

			if (prevIndex < 0) {
				return state;
			}

			const prevRow = state.visibleRows[prevIndex]!;
			const scroll = clampScrollWindow(
				prevIndex,
				state.visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				focusedNodeId: prevRow.nodeId,
				focusedRowIndex: prevIndex,
				...scroll,
			};
		}

		case 'focus-first': {
			if (state.visibleRows.length === 0) {
				return state;
			}

			const firstRow = state.visibleRows[0]!;
			return {
				...state,
				focusedNodeId: firstRow.nodeId,
				focusedRowIndex: 0,
				visibleFromIndex: 0,
				visibleToIndex: Math.min(state.maxHeight, state.visibleRows.length),
			};
		}

		case 'focus-last': {
			if (state.visibleRows.length === 0) {
				return state;
			}

			// Find the last non-closing-bracket row
			let lastIndex = state.visibleRows.length - 1;
			while (lastIndex >= 0 && state.visibleRows[lastIndex]!.kind === 'closing-bracket') {
				lastIndex--;
			}

			if (lastIndex < 0) {
				return state;
			}

			const lastRow = state.visibleRows[lastIndex]!;
			const from = Math.max(0, state.visibleRows.length - state.maxHeight);
			return {
				...state,
				focusedNodeId: lastRow.nodeId,
				focusedRowIndex: lastIndex,
				visibleFromIndex: from,
				visibleToIndex: state.visibleRows.length,
			};
		}

		case 'toggle-expand': {
			const node = nodeIndex.get(state.focusedNodeId ?? '');
			if (!node?.isExpandable) {
				return state;
			}

			const isExpanded = state.expandState.get(node.id) ?? false;
			const newExpandState = new Map(state.expandState);
			if (isExpanded) {
				newExpandState.delete(node.id);
			} else {
				newExpandState.set(node.id, true);
			}

			const visibleRows = computeVisibleRows(state.nodes, newExpandState, nodeIndex, state.showRootBraces);
			const focusedRowIndex = findRowIndexByNodeId(visibleRows, state.focusedNodeId);
			const scroll = clampScrollWindow(
				focusedRowIndex,
				visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				expandState: newExpandState,
				visibleRows,
				focusedRowIndex,
				...scroll,
			};
		}

		case 'expand-focused': {
			const node = nodeIndex.get(state.focusedNodeId ?? '');
			if (!node?.isExpandable || state.expandState.get(node.id)) {
				return state;
			}

			const newExpandState = new Map(state.expandState);
			newExpandState.set(node.id, true);

			const visibleRows = computeVisibleRows(state.nodes, newExpandState, nodeIndex, state.showRootBraces);
			const focusedRowIndex = findRowIndexByNodeId(visibleRows, state.focusedNodeId);
			const scroll = clampScrollWindow(
				focusedRowIndex,
				visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				expandState: newExpandState,
				visibleRows,
				focusedRowIndex,
				...scroll,
			};
		}

		case 'collapse-focused': {
			const node = nodeIndex.get(state.focusedNodeId ?? '');
			if (!node?.isExpandable || !state.expandState.get(node.id)) {
				return state;
			}

			const newExpandState = new Map(state.expandState);
			newExpandState.delete(node.id);

			const visibleRows = computeVisibleRows(state.nodes, newExpandState, nodeIndex, state.showRootBraces);
			const focusedRowIndex = findRowIndexByNodeId(visibleRows, state.focusedNodeId);
			const scroll = clampScrollWindow(
				focusedRowIndex,
				visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				expandState: newExpandState,
				visibleRows,
				focusedRowIndex,
				...scroll,
			};
		}

		case 'expand-all': {
			const newExpandState = new Map<string, boolean>();
			for (const node of state.nodes) {
				if (node.isExpandable && !node.isCircular) {
					newExpandState.set(node.id, true);
				}
			}

			const visibleRows = computeVisibleRows(state.nodes, newExpandState, nodeIndex, state.showRootBraces);
			const focusedRowIndex = findRowIndexByNodeId(visibleRows, state.focusedNodeId);
			const scroll = clampScrollWindow(
				focusedRowIndex,
				visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				expandState: newExpandState,
				visibleRows,
				focusedRowIndex,
				...scroll,
			};
		}

		case 'collapse-all': {
			const newExpandState = new Map<string, boolean>();
			const visibleRows = computeVisibleRows(state.nodes, newExpandState, nodeIndex, state.showRootBraces);

			// If focused node is no longer visible, find nearest ancestor that is
			let focusedNodeId = state.focusedNodeId;
			let focusedRowIndex = findRowIndexByNodeId(visibleRows, focusedNodeId);

			if (focusedNodeId && !visibleRows.some(r => r.nodeId === focusedNodeId && r.kind === 'node')) {
				// Walk up parents
				let current = nodeIndex.get(focusedNodeId);
				while (current?.parentId) {
					current = nodeIndex.get(current.parentId);
					if (current && visibleRows.some(r => r.nodeId === current!.id && r.kind === 'node')) {
						focusedNodeId = current.id;
						focusedRowIndex = findRowIndexByNodeId(visibleRows, focusedNodeId);
						break;
					}
				}
			}

			return {
				...state,
				expandState: newExpandState,
				visibleRows,
				focusedNodeId,
				focusedRowIndex,
				visibleFromIndex: 0,
				visibleToIndex: Math.min(state.maxHeight, visibleRows.length),
			};
		}

		case 'move-to-parent': {
			const node = nodeIndex.get(state.focusedNodeId ?? '');
			if (!node?.parentId) {
				return state;
			}

			const parentRowIndex = findRowIndexByNodeId(state.visibleRows, node.parentId);
			const scroll = clampScrollWindow(
				parentRowIndex,
				state.visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				focusedNodeId: node.parentId,
				focusedRowIndex: parentRowIndex,
				...scroll,
			};
		}

		case 'move-to-first-child': {
			const node = nodeIndex.get(state.focusedNodeId ?? '');
			if (!node?.isExpandable || !state.expandState.get(node.id) || node.childIds.length === 0) {
				return state;
			}

			const firstChildId = node.childIds[0]!;
			const childRowIndex = findRowIndexByNodeId(state.visibleRows, firstChildId);
			const scroll = clampScrollWindow(
				childRowIndex,
				state.visibleRows.length,
				state.maxHeight,
				state.visibleFromIndex,
			);

			return {
				...state,
				focusedNodeId: firstChildId,
				focusedRowIndex: childRowIndex,
				...scroll,
			};
		}

		case 'reset': {
			const newNodeIndex = buildNodeIndex(action.nodes);
			const visibleRows = computeVisibleRows(
				action.nodes,
				action.expandState,
				newNodeIndex,
				action.showRootBraces,
			);

			return {
				nodes: action.nodes,
				nodeIndex: newNodeIndex,
				expandState: action.expandState,
				focusedNodeId: visibleRows[0]?.nodeId,
				focusedRowIndex: 0,
				visibleRows,
				visibleFromIndex: 0,
				visibleToIndex: Math.min(action.maxHeight, visibleRows.length),
				maxHeight: action.maxHeight,
				showRootBraces: action.showRootBraces,
			};
		}

		default: {
			return state;
		}
	}
}

export type JsonViewerState = TreeState & {
	focusNext: () => void;
	focusPrevious: () => void;
	focusFirst: () => void;
	focusLast: () => void;
	toggleExpand: () => void;
	expandFocused: () => void;
	collapseFocused: () => void;
	expandAll: () => void;
	collapseAll: () => void;
	moveToParent: () => void;
	moveToFirstChild: () => void;
};

export function useJsonViewerState(props: {
	data: unknown;
	defaultExpandDepth: number;
	maxHeight: number;
	sortKeys: boolean;
	showRootBraces: boolean;
	rootLabel?: string;
	maxStringLength: number;
}): JsonViewerState {
	const flattenOptions: FlattenOptions = useMemo(
		() => ({
			sortKeys: props.sortKeys,
			rootLabel: props.rootLabel,
		}),
		[props.sortKeys, props.rootLabel],
	);

	const nodes = useMemo(
		() => flattenTree(props.data, flattenOptions),
		[props.data, flattenOptions],
	);

	const [state, dispatch] = useReducer(
		reducer,
		{nodes, defaultExpandDepth: props.defaultExpandDepth, maxHeight: props.maxHeight, showRootBraces: props.showRootBraces},
		createInitialState,
	);

	const isFirstRender = useRef(true);
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		dispatch({
			type: 'reset',
			nodes,
			expandState: createDefaultExpandState(nodes, props.defaultExpandDepth),
			maxHeight: props.maxHeight,
			showRootBraces: props.showRootBraces,
		});
	}, [nodes, props.defaultExpandDepth, props.maxHeight, props.showRootBraces]);

	return {
		...state,
		focusNext: useCallback(() => {
			dispatch({type: 'focus-next'});
		}, []),
		focusPrevious: useCallback(() => {
			dispatch({type: 'focus-previous'});
		}, []),
		focusFirst: useCallback(() => {
			dispatch({type: 'focus-first'});
		}, []),
		focusLast: useCallback(() => {
			dispatch({type: 'focus-last'});
		}, []),
		toggleExpand: useCallback(() => {
			dispatch({type: 'toggle-expand'});
		}, []),
		expandFocused: useCallback(() => {
			dispatch({type: 'expand-focused'});
		}, []),
		collapseFocused: useCallback(() => {
			dispatch({type: 'collapse-focused'});
		}, []),
		expandAll: useCallback(() => {
			dispatch({type: 'expand-all'});
		}, []),
		collapseAll: useCallback(() => {
			dispatch({type: 'collapse-all'});
		}, []),
		moveToParent: useCallback(() => {
			dispatch({type: 'move-to-parent'});
		}, []),
		moveToFirstChild: useCallback(() => {
			dispatch({type: 'move-to-first-child'});
		}, []),
	};
}
