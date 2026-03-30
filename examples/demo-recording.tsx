import React from 'react';
import {render, Box, Text} from 'ink';
import {JsonViewer} from 'ink-json-viewer';

const data = {
	users: [
		{
			id: 1,
			name: 'Alice Chen',
			email: 'alice@example.com',
			role: 'admin',
			active: true,
			lastLogin: '2026-03-28T14:30:00Z',
		},
		{
			id: 2,
			name: 'Bob Martinez',
			email: 'bob@example.com',
			role: 'editor',
			active: false,
			lastLogin: null,
		},
		{
			id: 3,
			name: 'Carol Wu',
			email: 'carol@example.com',
			role: 'viewer',
			active: true,
			lastLogin: '2026-03-30T09:15:00Z',
		},
	],
	config: {
		database: {
			host: 'db.example.com',
			port: 5432,
			ssl: true,
			poolSize: 10,
		},
		cache: {
			ttl: 3600,
			maxEntries: 1000,
			strategy: 'lru',
		},
		features: {
			darkMode: true,
			notifications: true,
			betaAccess: false,
		},
	},
	metadata: {
		version: '2.4.1',
		environment: 'production',
		region: 'us-east-1',
		deployedAt: '2026-03-29T18:00:00Z',
		buildNumber: 847,
		tags: ['stable', 'release', 'v2'],
	},
	stats: {
		requestsToday: 142_857,
		avgResponseMs: 23.7,
		errorRate: 0.002,
		uptime: 99.98,
	},
};

function App() {
	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">ink-json-viewer</Text>
			<Text dimColor>Arrow keys to navigate | Enter/Space to toggle | * expand all | - collapse all</Text>
			<Box marginTop={1}>
				<JsonViewer data={data} defaultExpandDepth={2} maxHeight={25} />
			</Box>
		</Box>
	);
}

render(<App />);
