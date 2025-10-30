import { describe, expect, it } from 'vitest';
import { categoryPriority, scoreTool, selectTools } from '../sim/decision.js';

describe('decision engine heuristics', () => {
  it('ranks tools by weighted CVSS score', () => {
    const profile = { assetKind: 'webapp', cvss: 7.5 };
    const tools = [
      { id: 'nmap', category: 'network', weight: 1, bias: 0.1 },
      { id: 'nuclei', category: 'webapp', weight: 1.2, bias: 0.3 },
      { id: 'prowler', category: 'cloud', weight: 1, bias: 0.1 }
    ];
    const plan = selectTools(tools, profile);
    expect(plan[0].toolId).toBe('nuclei');
    expect(plan.some((step) => step.toolId === 'prowler')).toBe(false);
  });

  it('ignores tools already successful in history', () => {
    const profile = { assetKind: 'webapp', cvss: 5 };
    const tools = [
      { id: 'nmap', category: 'network', weight: 1, bias: 0 },
      { id: 'nuclei', category: 'webapp', weight: 1, bias: 0 }
    ];
    const history = [{ toolId: 'nuclei', success: true }];
    const plan = selectTools(tools, profile, history);
    expect(plan.map((p) => p.toolId)).toEqual(['nmap']);
  });
});
