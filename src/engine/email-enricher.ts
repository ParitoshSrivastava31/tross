import { ContactInfo } from '../core/types.js';

// Common company name to domain mappings for accurate professional email enrichment
const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  microsoft: 'microsoft.com',
  google: 'google.com',
  alphabet: 'google.com',
  meta: 'meta.com',
  facebook: 'meta.com',
  apple: 'apple.com',
  amazon: 'amazon.com',
  amazonaws: 'amazon.com',
  aws: 'amazon.com',
  netflix: 'netflix.com',
  tesla: 'tesla.com',
  nvidia: 'nvidia.com',
  openai: 'openai.com',
  anthropic: 'anthropic.com',
  salesforce: 'salesforce.com',
  linkedin: 'linkedin.com',
  stripe: 'stripe.com',
  uber: 'uber.com',
  airbnb: 'airbnb.com',
  spotify: 'spotify.com',
  oracle: 'oracle.com',
  ibm: 'ibm.com',
  intel: 'intel.com',
  adobe: 'adobe.com',
  twitter: 'x.com',
  x: 'x.com',
};

export function cleanName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '');
}

export function inferCompanyDomain(companyName?: string | null, companyUrl?: string | null): string | null {
  if (!companyName && !companyUrl) return null;

  if (companyUrl) {
    try {
      const url = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`);
      const host = url.hostname.replace(/^www\./, '');
      if (!host.includes('linkedin.com')) {
        return host;
      }
    } catch {
      // ignore parsing error
    }
  }

  if (companyName) {
    const simplified = companyName
      .toLowerCase()
      .replace(/\b(inc|corp|corporation|llc|ltd|limited|technologies|group|holdings|company|co)\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    if (KNOWN_COMPANY_DOMAINS[simplified]) {
      return KNOWN_COMPANY_DOMAINS[simplified];
    }

    if (simplified.length > 2) {
      return `${simplified}.com`;
    }
  }

  return null;
}

export function enrichProfileEmails(
  existingContact: Partial<ContactInfo> = {},
  firstName: string,
  lastName: string,
  companyName?: string | null,
  companyUrl?: string | null
): ContactInfo {
  const emails: string[] = [...(existingContact.emails || [])];
  let professionalEmail = existingContact.professionalEmail || null;

  const fName = cleanName(firstName);
  const lName = cleanName(lastName);
  const domain = inferCompanyDomain(companyName, companyUrl);

  if (domain && fName && lName) {
    // Top patterns: first.last@domain.com, first@domain.com, f.last@domain.com
    const candidate1 = `${fName}.${lName}@${domain}`;
    const candidate2 = `${fName}@${domain}`;
    const candidate3 = `${fName[0]}${lName}@${domain}`;

    if (!professionalEmail) {
      professionalEmail = candidate1;
    }

    if (!emails.includes(candidate1)) emails.push(candidate1);
    if (!emails.includes(candidate2)) emails.push(candidate2);
    if (!emails.includes(candidate3)) emails.push(candidate3);
  }

  return {
    emails: Array.from(new Set(emails.filter(Boolean))),
    professionalEmail,
    phones: existingContact.phones || [],
    websites: existingContact.websites || [],
    twitter: existingContact.twitter || null,
    birthday: existingContact.birthday || null,
    address: existingContact.address || null,
  };
}
