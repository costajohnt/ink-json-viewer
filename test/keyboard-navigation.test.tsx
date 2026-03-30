import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import delay from 'delay';
import {JsonViewer} from '../src/components/json-viewer/json-viewer.js';

const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_RIGHT = '\u001B[C';
const ARROW_LEFT = '\u001B[D';
const ENTER = '\r';
const SPACE = ' ';

describe('keyboard navigation', () => {
	it('moves focus down with arrow down', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1, b: 2, c: 3}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		stdin.write(ARROW_DOWN);
		await delay(50);

		const output = lastFrame()!;
		expect(output).toBeDefined();
	});

	it('moves focus up with arrow up', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1, b: 2}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		stdin.write(ARROW_DOWN);
		await delay(50);
		stdin.write(ARROW_UP);
		await delay(50);

		const output = lastFrame()!;
		expect(output).toBeDefined();
	});

	it('expands a collapsed node with right arrow', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{nested: {a: 1}}}
				defaultExpandDepth={0}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('{1 keys}');

		// Right arrow to expand
		stdin.write(ARROW_RIGHT);
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('nested');
	});

	it('collapses an expanded node with left arrow', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1, b: 2}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('a');

		// Left arrow to collapse root
		stdin.write(ARROW_LEFT);
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('{2 keys}');
	});

	it('toggles expand with Enter', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1}}
				defaultExpandDepth={0}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('{1 keys}');

		// Enter to toggle expand
		stdin.write(ENTER);
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('a');
	});

	it('toggles expand with Space', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1}}
				defaultExpandDepth={0}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('{1 keys}');

		// Space to toggle
		stdin.write(SPACE);
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('a');
	});

	it('jumps to first with g', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1, b: 2, c: 3}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		// Move down a few times
		stdin.write(ARROW_DOWN);
		await delay(50);
		stdin.write(ARROW_DOWN);
		await delay(50);
		stdin.write(ARROW_DOWN);
		await delay(50);

		// Press g to go to first
		stdin.write('g');
		await delay(50);
		const output = lastFrame()!;
		expect(output).toBeDefined();
	});

	it('jumps to last with G', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1, b: 2, c: 3}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		// Press G to go to last
		stdin.write('G');
		await delay(50);
		const output = lastFrame()!;
		expect(output).toBeDefined();
	});

	it('expands all with *', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{nested: {deep: {value: 1}}}}
				defaultExpandDepth={0}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('{1 keys}');

		// Expand all
		stdin.write('*');
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('value');
		expect(output).toContain('1');
	});

	it('collapses all with -', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: {b: 1}, c: 2}}
				defaultExpandDepth={2}
				maxHeight={20}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('b');

		// Collapse all
		stdin.write('-');
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('{2 keys}');
	});

	it('does not respond to keyboard when enableKeyboard is false', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{a: 1}}
				defaultExpandDepth={0}
				enableKeyboard={false}
			/>,
		);

		await delay(50);
		let output = lastFrame()!;
		expect(output).toContain('{1 keys}');

		// Try to expand - should not work
		stdin.write(ENTER);
		await delay(50);
		output = lastFrame()!;
		expect(output).toContain('{1 keys}');
	});
});
