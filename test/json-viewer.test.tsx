import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {JsonViewer} from '../src/components/json-viewer/json-viewer.js';

describe('JsonViewer', () => {
	it('renders a primitive value', () => {
		const {lastFrame} = render(
			<JsonViewer data="hello" enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('"hello"');
	});

	it('renders a simple object collapsed at depth 0', () => {
		const {lastFrame} = render(
			<JsonViewer data={{name: 'John', age: 30}} defaultExpandDepth={0} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('{2 keys}');
	});

	it('renders a simple object expanded at depth 1', () => {
		const {lastFrame} = render(
			<JsonViewer data={{name: 'John', age: 30}} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('name');
		expect(output).toContain('"John"');
		expect(output).toContain('age');
		expect(output).toContain('30');
	});

	it('renders an array', () => {
		const {lastFrame} = render(
			<JsonViewer data={[1, 2, 3]} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('1');
		expect(output).toContain('2');
		expect(output).toContain('3');
	});

	it('renders nested objects partially expanded', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{user: {name: 'John', address: {city: 'NYC'}}}}
				defaultExpandDepth={1}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		// Root is expanded, user should show as collapsed
		expect(output).toContain('user');
		expect(output).toContain('{2 keys}');
	});

	it('renders with syntax coloring indicators', () => {
		const {lastFrame} = render(
			<JsonViewer
				data={{str: 'hello', num: 42, bool: true, nil: null}}
				defaultExpandDepth={1}
				enableKeyboard={false}
			/>,
		);
		const output = lastFrame()!;
		expect(output).toContain('"hello"');
		expect(output).toContain('42');
		expect(output).toContain('true');
		expect(output).toContain('null');
	});

	it('renders closing brackets for expanded containers', () => {
		const {lastFrame} = render(
			<JsonViewer data={{a: 1}} defaultExpandDepth={1} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('{');
		expect(output).toContain('}');
	});

	it('renders empty objects', () => {
		const {lastFrame} = render(
			<JsonViewer data={{}} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('{}');
	});

	it('renders empty arrays', () => {
		const {lastFrame} = render(
			<JsonViewer data={[]} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		expect(output).toContain('[]');
	});

	it('renders with virtual scrolling indicators', () => {
		const data = Object.fromEntries(
			Array.from({length: 30}, (_, i) => [`key${i}`, i]),
		);
		const {lastFrame} = render(
			<JsonViewer data={data} defaultExpandDepth={1} maxHeight={5} enableKeyboard={false} />,
		);
		const output = lastFrame()!;
		// Should show "more" indicator
		expect(output).toContain('more');
	});

	it('renders the focus indicator on the first row', () => {
		const {lastFrame} = render(
			<JsonViewer data={{a: 1}} defaultExpandDepth={0} />,
		);
		const output = lastFrame()!;
		// The focus indicator character (U+276F)
		expect(output).toContain('\u276F');
	});
});
