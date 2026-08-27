import { InvalidUrlError } from './errors.js';

export interface CanonicalizedUrl {
  canonicalUrl: string;
  slug: string;
  originalUrl: string;
}

export function canonicalizeLinkedInUrl(rawUrl: string): CanonicalizedUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new InvalidUrlError('LinkedIn profile URL must be a non-empty string');
  }

  const trimmed = rawUrl.trim();

  // If user just entered a username or slug without protocol or domain (e.g. "satyanadella" or "in/satyanadella")
  let urlToParse = trimmed;
  if (!/^https?:\/\//i.test(urlToParse)) {
    if (urlToParse.startsWith('in/')) {
      urlToParse = `https://www.linkedin.com/${urlToParse}`;
    } else if (urlToParse.includes('linkedin.com')) {
      urlToParse = `https://${urlToParse}`;
    } else if (!urlToParse.includes('/') && !urlToParse.includes('.')) {
      // Pure slug input like "satyanadella"
      urlToParse = `https://www.linkedin.com/in/${urlToParse}`;
    } else {
      urlToParse = `https://${urlToParse}`;
    }
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlToParse);
  } catch {
    throw new InvalidUrlError(`Invalid URL format: "${rawUrl}"`);
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const validHostnames = [
    'linkedin.com',
    'www.linkedin.com',
    'in.linkedin.com',
    'uk.linkedin.com',
    'ca.linkedin.com',
    'au.linkedin.com',
    'de.linkedin.com',
    'fr.linkedin.com',
  ];

  const isLinkedInHost =
    validHostnames.includes(hostname) ||
    hostname.endsWith('.linkedin.com') ||
    hostname === 'linkedin.com';

  if (!isLinkedInHost) {
    throw new InvalidUrlError(
      `URL hostname "${hostname}" is not a valid LinkedIn domain. Expected linkedin.com`
    );
  }

  // Extract path and check for /in/{slug}
  const pathname = parsedUrl.pathname.replace(/\/+$/, ''); // remove trailing slashes
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    throw new InvalidUrlError('LinkedIn URL does not point to a profile');
  }

  // Find the 'in' segment
  const inIndex = segments.findIndex((s) => s.toLowerCase() === 'in');
  if (inIndex === -1 || inIndex === segments.length - 1) {
    throw new InvalidUrlError(
      `URL path "${pathname}" is not a valid LinkedIn profile path. Must match "/in/{profile-slug}"`
    );
  }

  const rawSlug = segments[inIndex + 1];
  const cleanSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  // Validate slug characters: letters, numbers, hyphens, and standard unicode characters
  if (!cleanSlug || cleanSlug.length < 2 || cleanSlug.length > 100) {
    throw new InvalidUrlError(`Invalid profile slug "${rawSlug}"`);
  }

  const canonicalUrl = `https://www.linkedin.com/in/${cleanSlug}`;

  return {
    canonicalUrl,
    slug: cleanSlug,
    originalUrl: rawUrl,
  };
}

export function isValidLinkedInUrl(url: string): boolean {
  try {
    canonicalizeLinkedInUrl(url);
    return true;
  } catch {
    return false;
  }
}
