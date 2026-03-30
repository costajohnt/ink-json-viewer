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
			<JsonViewer data={true} enableKeyboard={false} />,
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
		const obj: Record<string, unknown> = {a: 1};
		obj.self = obj;

		const {lastFrame} = render(
			<JsonViewer data={obj} defaultExpandDepth={1} enableKeyboard={false} />,
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
				data={{'has space': 1, 'normal': 2}}
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
});
