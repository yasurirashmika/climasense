import { describe, it, expect } from 'vitest';
import { computeComfortIndex, getComfortLevel, getComfortColor, kelvinToCelsius } from './comfort-index';

describe('Comfort Index Algorithm', () => {
  it('should calculate a high score for ideal conditions', () => {
    const idealParams = {
      temperature: 23,
      humidity: 45,
      windSpeed: 3,
      cloudiness: 40
    };
    
    const score = computeComfortIndex(idealParams);
    expect(score).toBe(100);
  });

  it('should calculate a lower score for extreme heat and high humidity', () => {
    const harshParams = {
      temperature: 38,
      humidity: 90,
      windSpeed: 0,
      cloudiness: 10
    };
    
    const score = computeComfortIndex(harshParams);
    expect(score).toBeLessThan(50);
  });

  it('should calculate a lower score for freezing temperatures', () => {
    const freezingParams = {
      temperature: -10,
      humidity: 40,
      windSpeed: 15, // strong wind chill
      cloudiness: 80
    };
    
    const score = computeComfortIndex(freezingParams);
    expect(score).toBeLessThan(40);
  });

  it('should clamp scores between 0 and 100', () => {
    const impossibleParams = {
      temperature: 1000,
      humidity: 1000,
      windSpeed: 1000,
      cloudiness: 1000
    };
    
    const score = computeComfortIndex(impossibleParams);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('Helper Functions', () => {
  it('should return correct comfort levels', () => {
    expect(getComfortLevel(95)).toBe('Excellent');
    expect(getComfortLevel(75)).toBe('Good');
    expect(getComfortLevel(55)).toBe('Moderate');
    expect(getComfortLevel(35)).toBe('Poor');
    expect(getComfortLevel(10)).toBe('Harsh');
  });

  it('should return correct comfort colors', () => {
    expect(getComfortColor(95)).toBe('#22c55e');
    expect(getComfortColor(75)).toBe('#84cc16');
    expect(getComfortColor(55)).toBe('#eab308');
    expect(getComfortColor(35)).toBe('#f97316');
    expect(getComfortColor(10)).toBe('#ef4444');
  });

  it('should correctly convert Kelvin to Celsius', () => {
    expect(kelvinToCelsius(273.15)).toBe(0);
    expect(kelvinToCelsius(300)).toBe(26.9);
    expect(kelvinToCelsius(0)).toBe(-273.1);
  });
});
