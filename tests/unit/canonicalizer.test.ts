import { describe, it, expect } from 'vitest';
import { canonicalizeLinkedInUrl, isValidLinkedInUrl } from '../../src/core/canonicalizer.js';
import { InvalidUrlError } from '../../src/core/errors.js';

describe('LinkedIn URL Canonicalizer', () => {
  it('canonicalizes standard profile URLs', () => {
    const result = canonicalizeLinkedInUrl('https://www.linkedin.com/in/satyanadella');
    expect(result.canonicalUrl).toBe('https://www.linkedin.com/in/satyanadella');
    expect(result.slug).toBe('satyanadella');
  });

  it('handles trailing slashes, whitespace, and query parameters', () => {
    const result = canonicalizeLinkedInUrl(
      '   https://www.linkedin.com/in/williamhgates/?utm_source=share&utm_medium=member_desktop&miniProfileUrn=urn%3Ali%3Afs_miniProfile%3A123   '
    );
    expect(result.canonicalUrl).toBe('https://www.linkedin.com/in/williamhgates');
    expect(result.slug).toBe('williamhgates');
  });

  it('handles international regional subdomains', () => {
    const result = canonicalizeLinkedInUrl('https://in.linkedin.com/in/reidhoffman/');
    expect(result.canonicalUrl).toBe('https://www.linkedin.com/in/reidhoffman');
    expect(result.slug).toBe('reidhoffman');
  });

  it('normalizes uppercase letters in slugs', () => {
    const result = canonicalizeLinkedInUrl('https://www.linkedin.com/in/SatyaNadella');
    expect(result.canonicalUrl).toBe('https://www.linkedin.com/in/satyanadella');
    expect(result.slug).toBe('satyanadella');
  });

  it('accepts pure vanity slug inputs', () => {
    const result = canonicalizeLinkedInUrl('satyanadella');
    expect(result.canonicalUrl).toBe('https://www.linkedin.com/in/satyanadella');
    expect(result.slug).toBe('satyanadella');
  });

  it('rejects invalid non-LinkedIn domains', () => {
    expect(() => canonicalizeLinkedInUrl('https://google.com/in/satyanadella')).toThrow(InvalidUrlError);
  });

  it('rejects non-profile LinkedIn paths (e.g. company, jobs, feed)', () => {
    expect(() => canonicalizeLinkedInUrl('https://www.linkedin.com/company/microsoft')).toThrow(InvalidUrlError);
    expect(() => canonicalizeLinkedInUrl('https://www.linkedin.com/jobs/view/123')).toThrow(InvalidUrlError);
    expect(() => canonicalizeLinkedInUrl('https://www.linkedin.com/feed')).toThrow(InvalidUrlError);
  });

  it('isValidLinkedInUrl returns true for valid and false for invalid', () => {
    expect(isValidLinkedInUrl('https://www.linkedin.com/in/satyanadella')).toBe(true);
    expect(isValidLinkedInUrl('https://fake.com/in/bad')).toBe(false);
  });
});
