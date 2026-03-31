import {type ReactNode} from 'react';
import {Box, Text} from 'ink';
import type {JsonNode, JsonViewerTheme, VisibleRow} from '../../types.js';
import {formatKey, formatValue} from '../../lib/format-value.js';
import {JsonValue} from './json-value.js';
import {JsonCollapsedPreview} from './json-collapsed-preview.js';

type JsonNodeRowProps = {
	row: VisibleRow;
	node: JsonNode;
	isExpanded: boolean;
	isFocused: boolean;
	theme: JsonViewerTheme;
	indentWidth: number;
	maxStringLength: number;
	isScreenReaderEnabled: boolean;
};

function buildAriaLabel(node: JsonNode, isExpanded: boolean, row: VisibleRow, maxStringLength: number): string {
	if (row.kind === 'closing-bracket') {
		const closingType = node.type === 'array' ? 'array' : node.type === 'set' ? 'set' : node.type === 'map' ? 'map' : 'object';
		return `end of ${closingType}`;
	}

	const parts: string[] = [];

	if (node.key !== undefined) {
		parts.push(typeof node.key === 'number' ? `index ${node.key}` : node.key);
	}

	if (node.isExpandable) {
		const typeLabel = node.type === 'array' ? 'array' : node.type === 'set' ? 'set' : node.type === 'map' ? 'map' : 'object';
		parts.push(`${typeLabel} with ${node.childCount} ${node.childCount === 1 ? 'item' : 'items'}`);
		parts.push(isExpanded ? 'expanded' : 'collapsed');
	} else {
		parts.push(`${node.type}: ${formatValue(node.value, node.type, maxStringLength)}`);
	}

	return parts.join(', ');
}

export function JsonNodeRow({
	row,
	node,
	isExpanded,
	isFocused,
	theme,
	indentWidth,
	maxStringLength,
	isScreenReaderEnabled,
}: JsonNodeRowProps) {
	const focusPrefix = isFocused ? '\u276F ' : '  ';

	// Closing bracket row
	if (row.kind === 'closing-bracket') {
		const indent = ' '.repeat(row.depth * indentWidth);
		const ariaLabel = isScreenReaderEnabled
			? buildAriaLabel(node, false, row, maxStringLength)
			: undefined;
		return (
			<Box aria-role="listitem" aria-label={ariaLabel}>
				<Text>
					<Text color={theme.colors.focusIndicator} aria-hidden>{focusPrefix}</Text>
					<Text aria-hidden>{indent}</Text>
					<Text color={theme.colors.bracket}>{row.closingBracket}</Text>
				</Text>
			</Box>
		);
	}

	// Normal node row
	const indent = ' '.repeat(row.depth * indentWidth);

	// Expand/collapse icon
	let expandIcon = '  ';
	if (node.isExpandable) {
		expandIcon = isExpanded ? '\u25BE ' : '\u25B8 ';
	}

	// Key label
	let keyLabel: ReactNode = null;
	if (node.key !== undefined) {
		keyLabel = (
			<>
				<Text color={theme.colors.key}>{formatKey(node.key)}</Text>
				<Text dimColor>: </Text>
			</>
		);
	}

	// Value display
	let valueDisplay: ReactNode;

	if (node.isExpandable) {
		if (isExpanded) {
			const bracket = (node.type === 'array' || node.type === 'set') ? '[' : '{';
			valueDisplay = <Text color={theme.colors.bracket}>{bracket}</Text>;
		} else {
			valueDisplay = <JsonCollapsedPreview node={node} theme={theme} />;
		}
	} else {
		valueDisplay = (
			<JsonValue
				value={node.value}
				type={node.type}
				theme={theme}
				maxStringLength={maxStringLength}
			/>
		);
	}

	const ariaLabel = isScreenReaderEnabled
		? buildAriaLabel(node, isExpanded, row, maxStringLength)
		: undefined;

	const ariaState = node.isExpandable
		? {expanded: isExpanded, selected: isFocused}
		: {selected: isFocused};

	return (
		<Box aria-role="listitem" aria-label={ariaLabel} aria-state={ariaState}>
			<Text>
				<Text color={theme.colors.focusIndicator} aria-hidden>{focusPrefix}</Text>
				<Text aria-hidden>{indent}</Text>
				<Text color={theme.colors.expandIcon} aria-hidden>{expandIcon}</Text>
				{keyLabel}
				{valueDisplay}
			</Text>
		</Box>
	);
}
