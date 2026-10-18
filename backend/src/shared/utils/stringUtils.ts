import { randomInt } from 'node:crypto';

export function sanitizeContent(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#0*(13|10);?/g, '\n')
    .trim();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function extractEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

export function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += randomInt(0, 10).toString();
  }
  return result;
}

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Duración inválida: "${duration}" (usa formatos como 30s, 10m, 1h, 7d)`);
  }

  const value = Number(match[1]);
  const unit = match[2] as 'ms' | 's' | 'm' | 'h' | 'd';
  const multipliers: Record<typeof unit, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[unit];
}
