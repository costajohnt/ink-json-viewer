import {describe, it, expect} from 'vitest';
import {detectType} from '../src/lib/detect-type.js';

describe('detectType', () => {
	it('detects string', () => {
		expect(detectType('hello')).toBe('string');
		expect(detectType('')).toBe('string');
	});

	it('detects number', () => {
		expect(detectType(42)).toBe('number');
		expect(detectType(0)).toBe('number');
		expect(detectType(-1.5)).toBe('number');
		expect(detectType(Number.NaN)).toBe('number');
		expect(detectType(Number.POSITIVE_INFINITY)).toBe('number');
	});

	it('detects boolean', () => {
		expect(detectType(true)).toBe('boolean');
		expect(detectType(false)).toBe('boolean');
	});

	it('detects null', () => {
		expect(detectType(null)).toBe('null');
	});

	it('detects undefined', () => {
		expect(detectType(undefined)).toBe('undefined');
	});

	it('detects object', () => {
		expect(detectType({})).toBe('object');
		expect(detectType({a: 1})).toBe('object');
	});

	it('detects array', () => {
		expect(detectType([])).toBe('array');
		expect(detectType([1, 2, 3])).toBe('array');
	});

	it('detects date', () => {
		expect(detectType(new Date())).toBe('date');
	});

	it('detects regexp', () => {
		expect(detectType(/test/gi)).toBe('regexp');
		expect(detectType(new RegExp('test'))).toBe('regexp');
	});

	it('detects bigint', () => {
		expect(detectType(BigInt(42))).toBe('bigint');
		expect(detectType(0n)).toBe('bigint');
	});

	it('detects map', () => {
		expect(detectType(new Map())).toBe('map');
		expect(detectType(new Map([['a', 1]]))).toBe('map');
	});

	it('detects set', () => {
		expect(detectType(new Set())).toBe('set');
		expect(detectType(new Set([1, 2, 3]))).toBe('set');
	});

	it('detects function', () => {
		expect(detectType(() => {})).toBe('function');
		expect(detectType(function named() {})).toBe('function');
		expect(detectType(Array.isArray)).toBe('function');
	});

	it('detects symbol', () => {
		expect(detectType(Symbol('test'))).toBe('symbol');
		expect(detectType(Symbol())).toBe('symbol');
	});
});
