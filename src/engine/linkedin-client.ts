import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { LinkedInProfile } from '../core/types.js';
import { parsePublicProfileHtml } from './html-parser.js';
import { KNOWN_SANDBOX_PROFILES, generateDynamicSandboxProfile } from './sandbox-data.js';
import { enrichProfileEmails } from './email-enricher.js';

export interface VoyagerClientOptions {
  liAtCookie?: string;
  jsessionId?: string;
  proxyUrl?: string;
  useSandboxFallback?: boolean;
  enrichEmail?: boolean;
}

export class LinkedInVoyagerClient {
  private axiosInstance: AxiosInstance;
  private liAtCookie?: string;
  private jsessionId?: string;

  constructor(options: VoyagerClientOptions = {}) {
    this.liAtCookie = options.liAtCookie || env.LI_AT_COOKIE;
    this.jsessionId = options.jsessionId || env.JSESSIONID || 'ajax:1234567890123456789';

    // Format JSESSIONID properly if not wrapped
    let csrfToken = this.jsessionId;
    if (csrfToken.startsWith('"') && csrfToken.endsWith('"')) {
      csrfToken = csrfToken.slice(1, -1);
    }

    const cookieHeader = [
      this.liAtCookie ? `li_at=${this.liAtCookie}` : null,
      `JSESSIONID="${csrfToken}"`,
    ]
      .filter(Boolean)
      .join('; ');

    this.axiosInstance = axios.create({
      baseURL: 'https://www.linkedin.com',
      timeout: 12000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        Accept: 'application/vnd.linkedin.normalized+json+2.1, application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'x-li-lang': 'en_US',
        'x-restli-protocol-version': '2.0.0',
        'csrf-token': csrfToken,
        Cookie: cookieHeader,
        'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      validateStatus: () => true, // handle status codes manually
    });
  }

  /**
   * Main fetch method: Attempts Voyager API -> falls back to public HTML -> falls back to sandbox
   */
  async fetchProfile(
    canonicalUrl: string,
    slug: string,
    options: VoyagerClientOptions = {}
  ): Promise<LinkedInProfile> {
    const startTime = Date.now();
    const shouldEnrich = options.enrichEmail !== false;
    const allowSandbox = options.useSandboxFallback !== false && env.ENABLE_SANDBOX_FALLBACK;

    // 1. If explicit session cookie is available, try the internal Voyager API endpoints
    if (this.liAtCookie) {
      try {
        const voyagerProfile = await this.fetchFromVoyagerApi(slug, canonicalUrl);
        if (voyagerProfile) {
          const finalProfile = shouldEnrich
            ? this.enrichWithEmail(voyagerProfile)
            : voyagerProfile;
          finalProfile.meta.processingTimeMs = Date.now() - startTime;
          return finalProfile;
        }
      } catch (err) {
        console.warn(`[Voyager Client] Voyager API call failed for slug ${slug}:`, (err as Error).message);
      }
    }

    // 2. Try Public Web Page HTML parsing
    try {
      const publicProfile = await this.fetchFromPublicPage(slug, canonicalUrl);
      if (
        publicProfile &&
        publicProfile.fullName &&
        publicProfile.fullName !== slug &&
        publicProfile.experience &&
        publicProfile.experience.length > 0
      ) {
        const finalProfile = shouldEnrich
          ? this.enrichWithEmail(publicProfile as LinkedInProfile)
          : (publicProfile as LinkedInProfile);
        finalProfile.meta.processingTimeMs = Date.now() - startTime;
        return finalProfile;
      }
    } catch (err) {
      console.warn(`[Voyager Client] Public HTML scrape failed for slug ${slug}:`, (err as Error).message);
    }

    // 3. Fallback to Sandbox / Demo Dataset
    if (allowSandbox) {
      const knownProfile = KNOWN_SANDBOX_PROFILES[slug.toLowerCase()];
      const baseProfile = knownProfile ? { ...knownProfile } : generateDynamicSandboxProfile(slug);
      
      baseProfile.profileUrl = canonicalUrl;
      baseProfile.slug = slug;
      baseProfile.meta = {
        fetchedAt: new Date().toISOString(),
        dataSource: 'sandbox_demo',
        processingTimeMs: Date.now() - startTime,
      };

      const finalProfile = shouldEnrich ? this.enrichWithEmail(baseProfile) : baseProfile;
      return finalProfile;
    }

    throw new Error(`Unable to fetch profile data for LinkedIn URL: ${canonicalUrl}`);
  }

  /**
   * Internal Voyager Profile View fetcher
   */
  private async fetchFromVoyagerApi(slug: string, canonicalUrl: string): Promise<LinkedInProfile | null> {
    // Query profileView endpoint
    const response = await this.axiosInstance.get(`/voyager/api/identity/profiles/${encodeURIComponent(slug)}/profileView`);

    if (response.status === 200 && response.data) {
      return this.parseVoyagerPayload(response.data, slug, canonicalUrl);
    }

    // Try alternate dash endpoint
    const dashResponse = await this.axiosInstance.get(
      `/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${encodeURIComponent(
        slug
      )}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-103`
    );

    if (dashResponse.status === 200 && dashResponse.data) {
      return this.parseVoyagerPayload(dashResponse.data, slug, canonicalUrl);
    }

    return null;
  }

  /**
   * Public page scraper fallback
   */
  private async fetchFromPublicPage(slug: string, canonicalUrl: string): Promise<Partial<LinkedInProfile> | null> {
    const response = await this.axiosInstance.get(`/in/${encodeURIComponent(slug)}`, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (response.status === 200 && typeof response.data === 'string') {
      const parsed = parsePublicProfileHtml(response.data, canonicalUrl, slug);
      return {
        ...parsed,
        meta: {
          fetchedAt: new Date().toISOString(),
          dataSource: 'public_html',
          processingTimeMs: 0,
        },
      };
    }

    return null;
  }

  /**
   * Parse internal Voyager REST/JSON response structure
   */
  private parseVoyagerPayload(data: any, slug: string, canonicalUrl: string): LinkedInProfile {
    const profile = data.profile || data.elements?.[0] || {};
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || slug;
    const headline = profile.headline || '';
    const summary = profile.summary || null;

    // Parse location
    const locationRaw = profile.locationName || profile.geoLocationName || 'Not specified';

    // Parse profile picture
    let profilePicUrl: string | null = null;
    if (profile.miniProfile?.picture) {
      const vectorImage = profile.miniProfile.picture['com.linkedin.common.VectorImage'];
      if (vectorImage && vectorImage.rootUrl && vectorImage.artifacts?.length) {
        const largest = vectorImage.artifacts[vectorImage.artifacts.length - 1];
        profilePicUrl = `${vectorImage.rootUrl}${largest.fileIdentifyingUrlPathSegment}`;
      }
    }

    // Parse positions/experiences
    const experience: any[] = [];
    const rawPositions = data.positionView?.elements || data.positions?.elements || [];
    rawPositions.forEach((pos: any, idx: number) => {
      const timePeriod = pos.timePeriod || {};
      const startYear = timePeriod.startDate?.year;
      const startMonth = timePeriod.startDate?.month;
      const endYear = timePeriod.endDate?.year;
      const endMonth = timePeriod.endDate?.month;

      const startDate = startYear ? `${startMonth ? startMonth + '/' : ''}${startYear}` : null;
      const endDate = endYear ? `${endMonth ? endMonth + '/' : ''}${endYear}` : 'Present';

      experience.push({
        id: pos.entityUrn || `exp_${idx}`,
        title: pos.title || 'Position',
        companyName: pos.companyName || 'Company',
        companyUrn: pos.companyUrn || null,
        location: pos.locationName || null,
        startDate,
        endDate,
        isCurrent: !endYear,
        description: pos.description || null,
        employmentType: pos.employmentType || null,
      });
    });

    // Current company summary
    const currentExp = experience.find((e) => e.isCurrent) || experience[0];
    const currentCompany = currentExp
      ? {
          name: currentExp.companyName,
          title: currentExp.title,
          companyUrl: currentExp.companyUrn ? `https://www.linkedin.com/company/${currentExp.companyUrn}` : null,
          companyUrn: currentExp.companyUrn || null,
        }
      : null;

    // Parse education
    const education: any[] = [];
    const rawEducation = data.educationView?.elements || data.educations?.elements || [];
    rawEducation.forEach((edu: any, idx: number) => {
      const timePeriod = edu.timePeriod || {};
      education.push({
        id: edu.entityUrn || `edu_${idx}`,
        schoolName: edu.schoolName || 'School',
        degree: edu.degreeName || null,
        fieldOfStudy: edu.fieldsOfStudy?.[0] || edu.fieldOfStudy || null,
        startDate: timePeriod.startDate?.year ? String(timePeriod.startDate.year) : null,
        endDate: timePeriod.endDate?.year ? String(timePeriod.endDate.year) : null,
        grade: edu.grade || null,
        activities: edu.activities || null,
        description: edu.description || null,
      });
    });

    // Parse skills
    const skills: any[] = [];
    const rawSkills = data.skillView?.elements || data.skills?.elements || [];
    rawSkills.forEach((sk: any) => {
      if (sk.name) {
        skills.push({
          name: sk.name,
          endorsementCount: sk.endorsementCount || 0,
        });
      }
    });

    return {
      profileUrl: canonicalUrl,
      slug,
      urn: profile.entityUrn || `urn:li:fsd_profile:${slug}`,
      memberId: profile.plainId || null,
      publicIdentifier: profile.publicIdentifier || slug,
      fullName,
      firstName,
      lastName,
      headline,
      summary,
      location: {
        raw: locationRaw,
        city: locationRaw.split(',')[0]?.trim() || null,
        country: locationRaw.includes(',') ? locationRaw.split(',').pop()?.trim() : null,
      },
      currentCompany,
      profilePicture: profilePicUrl ? { url: profilePicUrl } : null,
      backgroundPicture: null,
      experience,
      education,
      skills,
      certifications: [],
      languages: [],
      contactInfo: {
        emails: [],
        websites: [canonicalUrl],
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        dataSource: 'voyager_api',
        processingTimeMs: 0,
      },
    };
  }

  private enrichWithEmail(profile: LinkedInProfile): LinkedInProfile {
    const enrichedContact = enrichProfileEmails(
      profile.contactInfo,
      profile.firstName,
      profile.lastName,
      profile.currentCompany?.name,
      profile.currentCompany?.companyUrl
    );

    return {
      ...profile,
      contactInfo: enrichedContact,
    };
  }
}
