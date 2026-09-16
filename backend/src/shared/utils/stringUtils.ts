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
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}
