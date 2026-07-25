import {describe, it, expect} from 'vitest';
import {useJsonViewerState, useJsonViewer, JsonViewer} from '../src/index.js';

describe('headless exports', () => {
	it('exports the headless hooks advertised in the README', () => {
		expect(typeof useJsonViewerState).toBe('function');
		expect(typeof useJsonViewer).toBe('function');
		expect(typeof JsonViewer).toBe('function');
	});
});
