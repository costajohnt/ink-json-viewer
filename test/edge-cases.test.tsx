import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {JsonViewer} from '../src/components/json-viewer/json-viewer.js';

describe('edge cases', () => {
	it('renders null data', () => {
		const {lastFrame} = render(
			<JsonViewer data={null} enableKeyboard={false} />,
		);
		expect(lastFrame()!).toContain('null');
	});

	it('renders undefined data', () => {
		const {lastFrame} = render(
			<JsonViewer data={undefined} enableKeyboard={false} />,
		);
		expect(lastFrame()!).toContain('undefined');
	});

	it('renders boolean data', () => {
		const {lastFrame} = render(
			<JsonViewer data enableKeyboard={false} />,
		);
		expect(lastFrame()!).toContain('true');
	});

	it('renders number data', () => {
		const {lastFrame} = render(
			<JsonViewer data={42} enableKeyboard={false} />,
		);
		expect(lastFrame()!).toContain('42');
	});

	it('renders circular references', () => {
		const object: Record<string, unknown> = {a: 1};
		object.self = object;

		const {lastFrame} = render(
			<JsonViewer data={object} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('[Circular]');
	});

	it('renders Date objects', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{date: new Date('2024-01-15T00:00:00.000Z')}}
				defaultExpandDepth={1}
				enableKeyboard={false}
			/>,
		);
		expect(lastFrame()!).toContain('2024-01-15');
	});

	it('renders RegExp objects', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{regex: /test/gi}}
				defaultExpandDepth={1}
				enableKeyboard={false}
			/>,
		);
		expect(lastFrame()!).toContain('/test/gi');
	});

	it('renders with objects containing special-character keys', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{'has space': 1, normal: 2}}
				defaultExpandDepth={1}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		expect(output).toContain('"has space"');
		expect(output).toContain('normal');
	});

	it('handles deeply nested structures within max depth', () => {
		const data = {a: {b: {c: {d: {e: 'deep'}}}}};
		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={10} enableKeyboard={false} />,
		);
		expect(lastFrame()!).toContain('"deep"');
	});

	it('renders objects with mixed value types', () => {
		const data = {
			str: 'hello',
			num: 42,
			bool: false,
			nil: null,
			arr: [1, 2],
			obj: {nested: true},
		};

		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('"hello"');
		expect(output).toContain('42');
		expect(output).toContain('false');
		expect(output).toContain('null');
		expect(output).toContain('[2 items]');
		expect(output).toContain('{1 keys}');
	});

	it('renders with custom indent width', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{a: 1}}
				defaultExpandDepth={1}
				indentWidth={4}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		expect(output).toBeDefined();
	});

	it('renders with defaultExpandDepth Infinity', () => {
		const data = {a: {b: {c: 1}}};
		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={Infinity} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('1');
		expect(output).toContain('c');
	});

	it('renders Map and Set types', () => {
		const data = {
			myMap: new Map([['key1', 'val1']]),
			mySet: new Set([1, 2, 3]),
		};
		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('Map(1)');
		expect(output).toContain('Set(3)');
	});

	it('renders Map entries whose keys stringify the same as distinct rows', () => {
		const data = new Map<unknown, unknown>([
			[1, 'num'],
			['1', 'str'],
			[{a: 1}, 'first'],
			[{b: 2}, 'second'],
		]);
		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('"num"');
		expect(output).toContain('"str"');
		expect(output).toContain('"1"');
		expect(output).toContain('{a: 1}');
		expect(output).toContain('{b: 2}');
		expect(output).toContain('"first"');
		expect(output).toContain('"second"');
		expect(output).not.toContain('[object Object]');
	});

	it('never writes control characters from keys or values to the terminal', () => {
		const osc52 = '\u{1B}]52;c;aGk=\u{7}';
		const osc8 = '\u{1B}]8;;https://evil.example\u{7}click\u{1B}]8;;\u{7}';
		const data = {
			[`k${osc52}`]: `v${osc52}`,
			sgr: '\u{1B}[31mred\u{1B}[0m',
			link: osc8,
			c1: 'a\u{9B}2Jb\u{85}c',
			map: new Map([[{[`m${osc52}`]: 1}, 'x']]),
		};
		const {lastFrame} = render(
			<JsonViewer data={data} enableKeyboard={false} defaultExpandDepth={3} />,
		);
		const frame = lastFrame()!;
		// The frame may carry the theme's own SGR colors, so check for the
		// payload sequences specifically rather than any ESC.
		for (const raw of ['\u{1B}]', '\u{7}', '\u{1B}[31mred', '\u{9B}', '\u{85}']) {
			expect(frame).not.toContain(raw);
		}

		expect(frame).toContain('\\u001b]52;c;aGk=\\u0007');
		expect(frame).toContain('\\u001b[31mred');
		expect(frame).toContain('\\u001b]8;;https://evil.example');
		expect(frame).toContain('a\\u009b2Jb\\u0085c');
	});
});

