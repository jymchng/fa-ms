import { addOne } from '../src/core';
import { describe, it, expect } from '@jest/globals';

describe('addOne function', () => {
  it('should add one to the given number', () => {
    const result = addOne(1);
    expect(result).toBe(2);
  });

  it('should return a number incremented by one', () => {
    const randomNum = Math.floor(Math.random() * 100);
    const result = addOne(randomNum);
    expect(result).toBe(randomNum + 1);
  });

  it('should handle negative numbers correctly', () => {
    const result = addOne(-5);
    expect(result).toBe(-4);
  });

  it('should handle zero correctly', () => {
    const result = addOne(0);
    expect(result).toBe(1);
  });
});
