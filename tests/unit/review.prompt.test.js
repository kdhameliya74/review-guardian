import { expect, describe, it } from '@jest/globals';
import { diffAnalyzerPrompt } from '../../src/prompts/review.prompt.js';

describe('Review Prompt', () => {
  it('should successfully incorporate code diff into the prompt payload', () => {
    const dummyDiff = '- old code\n+ new code';
    const output = diffAnalyzerPrompt(dummyDiff);

    expect(output).toContain('OUTPUT STRUCTURE');
    expect(output).toContain('STRICT RULES');
    expect(output).toContain(dummyDiff);
  });

  it('should demand structured JSON', () => {
    const dummyDiff = '';
    const output = diffAnalyzerPrompt(dummyDiff);

    expect(output).toContain('You MUST return ONLY a valid JSON object.');
    expect(output).toContain('"severity": "high" | "medium" | "low"');
  });
});
