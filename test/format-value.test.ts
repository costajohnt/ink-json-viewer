import {describe, it, expect} from 'vitest';
import {formatValue, formatKey} from '../src/lib/format-value.js';

describe('formatValue', () => {
	it('formats strings with quotes', () => {
		expect(formatValue('hello', 'string', 120)).toBe('"hello"');
	});

	it('escapes special characters in strings', () => {
		expect(formatValue('hello\nworld', 'string', 120)).toBe('"hello\\nworld"');
		expect(formatValue('tab\there', 'string', 120)).toBe('"tab\\there"');
		expect(formatValue('quote"here', 'string', 120)).toBe('"quote\\"here"');
	});

	it('truncates long strings', () => {
		const longString = 'a'.repeat(200);
		const result = formatValue(longString, 'string', 50);
		expect(result.length).toBe(50);
		// Result is "aaa...aaa..." wrapped in quotes, so ends with ..."
		expect(result.endsWith('..."')).toBe(true);
		expect(result.startsWith('"')).toBe(true);
	});

	it('formats numbers', () => {
		expect(formatValue(42, 'number', 120)).toBe('42');
		expect(formatValue(3.14, 'number', 120)).toBe('3.14');
		expect(formatValue(-1, 'number', 120)).toBe('-1');
	});

	it('formats booleans', () => {
		expect(formatValue(true, 'boolean', 120)).toBe('true');
		expect(formatValue(false, 'boolean', 120)).toBe('false');
	});

	it('formats null', () => {
		expect(formatValue(null, 'null', 120)).toBe('null');
	});

	it('formats undefined', () => {
		expect(formatValue(undefined, 'undefined', 120)).toBe('undefined');
	});

	it('formats dates as ISO strings', () => {
		const date = new Date('2024-01-15T10:30:00.000Z');
		expect(formatValue(date, 'date', 120)).toBe('2024-01-15T10:30:00.000Z');
	});

	it('formats regexp', () => {
		expect(formatValue(/test/gi, 'regexp', 120)).toBe('/test/gi');
	});

	it('formats bigint', () => {
		expect(formatValue(BigInt(42), 'bigint', 120)).toBe('42n');
	});

	it('formats symbol', () => {
		expect(formatValue(Symbol('test'), 'symbol', 120)).toBe('Symbol(test)');
		expect(formatValue(Symbol(), 'symbol', 120)).toBe('Symbol()');
	});

	it('formats functions', () => {
		function myFunc() {}
		expect(formatValue(myFunc, 'function', 120)).toBe('[Function: myFunc]');
		expect(formatValue(() => {}, 'function', 120)).toBe('[Function: anonymous]');
	});

	it('formats circular', () => {
		expect(formatValue(null, 'circular', 120)).toBe('[Circular]');
	});
});

describe('formatKey', () => {
	it('returns bare identifier for valid keys', () => {
		expect(formatKey('name')).toBe('name');
		expect(formatKey('_private')).toBe('_private');
		expect(formatKey('$special')).toBe('$special');
	});

	it('quotes keys with special characters', () => {
		expect(formatKey('has space')).toBe('"has space"');
		expect(formatKey('has-dash')).toBe('"has-dash"');
		expect(formatKey('123start')).toBe('"123start"');
	});

	it('returns stringified numbers', () => {
		expect(formatKey(0)).toBe('0');
		expect(formatKey(42)).toBe('42');
	});
});
