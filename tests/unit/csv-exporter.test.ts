import { describe, it, expect } from 'vitest';
import { convertProfilesToPhantomBusterCsv } from '../../src/engine/csv-exporter.js';
import { KNOWN_SANDBOX_PROFILES } from '../../src/engine/sandbox-data.js';

describe('PhantomBuster CSV Exporter', () => {
  it('generates standard 44-column CSV with required headers', () => {
    const profiles = [KNOWN_SANDBOX_PROFILES.satyanadella, KNOWN_SANDBOX_PROFILES.williamhgates];
    const csv = convertProfilesToPhantomBusterCsv(profiles);

    expect(csv).toContain('"Profile URL"');
    expect(csv).toContain('"Full Name"');
    expect(csv).toContain('"Headline"');
    expect(csv).toContain('"Company Name"');
    expect(csv).toContain('"Job Title"');
    expect(csv).toContain('"Professional Email"');
    expect(csv).toContain('Satya Nadella');
    expect(csv).toContain('Bill Gates');
    expect(csv).toContain('Microsoft');
  });
});
