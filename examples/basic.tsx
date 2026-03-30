import React from 'react';
import {render, Box, Text} from 'ink';
import {JsonViewer} from 'ink-json-viewer';

const sampleData = {
	name: 'ink-json-viewer',
	version: '0.1.0',
	description: 'Interactive JSON tree viewer for Ink',
	features: ['collapsible', 'keyboard navigation', 'syntax coloring', 'virtual scrolling'],
	config: {
		maxHeight: 20,
		indentWidth: 2,
		theme: 'default',
	},
	stats: {
		stars: 42,
		forks: 7,
		issues: 3,
		active: true,
	},
	tags: null,
	metadata: {
		created: '2024-01-15',
		updated: '2024-03-29',
	},
};

function App() {
	return (
		<Box flexDirection="column" padding={1}>
			<Text bold>ink-json-viewer demo</Text>
			<Text dimColor>Use arrow keys to navigate, Enter/Space to expand/collapse</Text>
			<Text dimColor>g/G = home/end, * = expand all, - = collapse all</Text>
			<Box marginTop={1}>
				<JsonViewer data={sampleData} defaultExpandDepth={1} maxHeight={15} />
			</Box>
		</Box>
	);
}

render(<App />);
