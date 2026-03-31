import {Text} from 'ink';
import type {JsonNode, JsonViewerTheme} from '../../types.js';

type JsonCollapsedPreviewProps = {
	node: JsonNode;
	theme: JsonViewerTheme;
};

export function JsonCollapsedPreview({node, theme}: JsonCollapsedPreviewProps) {
	let preview: string;

	switch (node.type) {
		case 'array': {
			preview = node.childCount === 0 ? '[]' : `[${node.childCount} items]`;
			break;
		}

		case 'object': {
			preview = node.childCount === 0 ? '{}' : `{${node.childCount} keys}`;
			break;
		}

		case 'map': {
			preview = `Map(${node.childCount})`;
			break;
		}

		case 'set': {
			preview = `Set(${node.childCount})`;
			break;
		}

		default: {
			preview = '{}';
		}
	}

	return <Text color={theme.colors.preview} aria-label={`collapsed ${preview}`}>{preview}</Text>;
}
