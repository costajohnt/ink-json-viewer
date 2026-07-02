import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import delay from 'delay';
import {JsonViewer} from '../src/components/json-viewer/json-viewer.js';

const arrowDown = '[B';
const arrowRight = '[C';

describe('node-id collisions', () => {
	it('renders both a dotted key and a colliding nested path correctly', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{'a.b': 1, a: {b: 2}}}
				defaultExpandDepth={Infinity}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		// The dotted key renders with its own quoted key and value 1...
		expect(output).toContain('"a.b"');
		expect(output).toContain('1');
		// ...and the nested a -> b renders with value 2. Before the fix both
		// nodes shared the id "$.a.b" and the last one clobbered the first.
		expect(output).toContain('2');
	});

	it('renders both a bracketed key and a colliding array index correctly', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{foo: ['x'], 'foo[0]': 'y'}}
				defaultExpandDepth={Infinity}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		expect(output).toContain('"foo[0]"');
		expect(output).toContain('"x"');
		expect(output).toContain('"y"');
	});

	it('toggles colliding container nodes independently', async () => {
		const {lastFrame, stdin} = render(
			<JsonViewer
				data={{'a.b': {marker1: 1}, a: {b: {marker2: 2}}}}
				defaultExpandDepth={1}
				maxHeight={20}
			/>,
		);

		await delay(50);
		// Root is expanded; both "a.b" and "a" are collapsed containers.
		expect(lastFrame()!).not.toContain('marker1');
		expect(lastFrame()!).not.toContain('marker2');

		// Focus the first child ("a.b") and expand only it.
		stdin.write(arrowDown);
		await delay(50);
		stdin.write(arrowRight);
		await delay(50);

		const output = lastFrame()!;
		// Only "a.b" expanded -> marker1 visible, the colliding a -> b stays collapsed.
		expect(output).toContain('marker1');
		expect(output).not.toContain('marker2');
	});
});
