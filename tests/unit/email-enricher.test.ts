import { describe, it, expect } from 'vitest';
import { enrichProfileEmails, inferCompanyDomain } from '../../src/engine/email-enricher.js';

describe('Email Enricher & Discovery Engine', () => {
  it('infers known company domain correctly', () => {
    expect(inferCompanyDomain('Microsoft Corporation')).toBe('microsoft.com');
    expect(inferCompanyDomain('Google LLC')).toBe('google.com');
    expect(inferCompanyDomain('Amazon AWS')).toBe('amazon.com');
  });

  it('infers domain from company website URL', () => {
    expect(inferCompanyDomain('Acme', 'https://acme-software.io/about')).toBe('acme-software.io');
  });

  it('generates standard professional email permutations', () => {
    const contact = enrichProfileEmails({}, 'Satya', 'Nadella', 'Microsoft');
    expect(contact.professionalEmail).toBe('satya.nadella@microsoft.com');
    expect(contact.emails).toContain('satya.nadella@microsoft.com');
    expect(contact.emails).toContain('satya@microsoft.com');
    expect(contact.emails).toContain('snadella@microsoft.com');
  });

  it('preserves existing contact details while adding discovered emails', () => {
    const contact = enrichProfileEmails(
      { twitter: 'satyanadella', websites: ['https://microsoft.com'] },
      'Satya',
      'Nadella',
      'Microsoft'
    );
    expect(contact.twitter).toBe('satyanadella');
    expect(contact.websites).toContain('https://microsoft.com');
    expect(contact.professionalEmail).toBe('satya.nadella@microsoft.com');
  });
});
