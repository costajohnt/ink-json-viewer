import {useInput} from 'ink';
import type {JsonViewerState} from './use-json-viewer-state.js';

export function useJsonViewer({
	state,
	isActive = true,
	onSelect,
}: {
	state: JsonViewerState;
	isActive: boolean;
	onSelect?: (path: string, value: unknown) => void;
}): void {
	useInput(
		(input, key) => {
			// Navigation
			if (key.downArrow) {
				state.focusNext();
				return;
			}

			if (key.upArrow) {
				state.focusPrevious();
				return;
			}

			// Expand/collapse with arrow keys
			if (key.rightArrow) {
				const node = state.nodeIndex.get(state.focusedNodeId ?? '');
				if (node?.isExpandable) {
					if (!state.expandState.get(node.id)) {
						state.expandFocused();
					} else {
						state.moveToFirstChild();
					}
				}

				return;
			}

			if (key.leftArrow) {
				const node = state.nodeIndex.get(state.focusedNodeId ?? '');
				if (node?.isExpandable && state.expandState.get(node.id)) {
					state.collapseFocused();
				} else {
					state.moveToParent();
				}

				return;
			}

			// Toggle expand on Enter/Space
			if (key.return || input === ' ') {
				const node = state.nodeIndex.get(state.focusedNodeId ?? '');
				if (node?.isExpandable) {
					state.toggleExpand();
				} else if (key.return && onSelect) {
					onSelect(node?.id ?? '', node?.value);
				}

				return;
			}

			// Home/End (vim-style)
			if (input === 'g') {
				state.focusFirst();
				return;
			}

			if (input === 'G') {
				state.focusLast();
				return;
			}

			// Expand all / Collapse all
			if (input === '*' || input === 'e') {
				state.expandAll();
				return;
			}

			if (input === '-' || input === 'E') {
				state.collapseAll();
				return;
			}

		},
		{isActive},
	);
}
