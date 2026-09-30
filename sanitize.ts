/**
 * Input sanitization and validation utilities to protect against XSS and injection attacks.
 */

/**
 * Strips HTML tags and dangerous characters from user input strings.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>'"`;]/g, '') // Remove dangerous characters that could be used for HTML/script injection
    .trim();
}

/**
 * Validates and sanitizes URLs. Rejects javascript:, vbscript:, data: protocols.
 * Only allows valid http:// and https:// URLs.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Reject javascript:, vbscript:, data: protocols
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return '';
  }

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Standard RFC-compliant email validation.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates reasonable phone number length and format.
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s().\-+]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}
