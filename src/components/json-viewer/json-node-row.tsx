import {type ReactNode} from 'react';
import {Box, Text} from 'ink';
import type {JsonNode, JsonViewerTheme, VisibleRow} from '../../types.js';
import {formatKey} from '../../lib/format-value.js';
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
};

export function JsonNodeRow({
	row,
	node,
	isExpanded,
	isFocused,
	theme,
	indentWidth,
	maxStringLength,
}: JsonNodeRowProps) {
	const focusPrefix = isFocused ? '\u276F ' : '  ';

	// Closing bracket row
	if (row.kind === 'closing-bracket') {
		const indent = ' '.repeat(row.depth * indentWidth);
		return (
			<Box>
				<Text>
					<Text color={theme.colors.focusIndicator}>{focusPrefix}</Text>
					<Text>{indent}</Text>
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

	return (
		<Box>
			<Text>
				<Text color={theme.colors.focusIndicator}>{focusPrefix}</Text>
				<Text>{indent}</Text>
				<Text color={theme.colors.expandIcon}>{expandIcon}</Text>
				{keyLabel}
				{valueDisplay}
			</Text>
		</Box>
	);
}
