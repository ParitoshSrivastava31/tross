import * as cheerio from 'cheerio';
import { LinkedInProfile, LocationInfo, ExperienceItem, EducationItem } from '../core/types.js';

export function parsePublicProfileHtml(html: string, canonicalUrl: string, slug: string): Partial<LinkedInProfile> {
  const $ = cheerio.load(html);

  // Extract JSON-LD if present
  let jsonLdData: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed['@type'] === 'Person' || (Array.isArray(parsed['@graph']) && parsed['@graph'].some((item: any) => item['@type'] === 'Person'))) {
          jsonLdData = parsed['@type'] === 'Person' ? parsed : parsed['@graph'].find((item: any) => item['@type'] === 'Person');
        }
      }
    } catch {
      // ignore json parse error
    }
  });

  // Extract OpenGraph and standard meta tags
  const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Extract name: Often in format "FirstName LastName - Headline | LinkedIn" or "FirstName LastName"
  let fullName = jsonLdData?.name || '';
  let headline = jsonLdData?.jobTitle || '';
  let locationRaw = '';

  if (!fullName && ogTitle) {
    const titleParts = ogTitle.split(/[-–—|]/);
    if (titleParts.length > 0) {
      fullName = titleParts[0].trim();
    }
    if (titleParts.length > 1 && !headline) {
      headline = titleParts[1].replace(/LinkedIn.*$/i, '').trim();
    }
  }

  // Fallback to DOM elements
  if (!fullName) {
    fullName = $('.top-card-layout__title, .profile-topcard__full-name, h1.top-card-layout__title').first().text().trim();
  }
  if (!headline) {
    headline = $('.top-card-layout__headline, .profile-topcard__headline, h2.top-card-layout__headline').first().text().trim();
  }

  // Parse first and last name
  const nameSegments = fullName.split(' ').filter(Boolean);
  const firstName = nameSegments.length > 0 ? nameSegments[0] : '';
  const lastName = nameSegments.length > 1 ? nameSegments.slice(1).join(' ') : '';

  // Location
  if (jsonLdData?.address) {
    if (typeof jsonLdData.address === 'string') {
      locationRaw = jsonLdData.address;
    } else if (jsonLdData.address.addressLocality || jsonLdData.address.addressCountry) {
      locationRaw = [jsonLdData.address.addressLocality, jsonLdData.address.addressRegion, jsonLdData.address.addressCountry]
        .filter(Boolean)
        .join(', ');
    }
  }
  if (!locationRaw) {
    locationRaw = $('.top-card-layout__first-subline, .profile-topcard__location-data').first().text().trim();
  }

  // Summary / About
  let summary = jsonLdData?.description || ogDescription || null;
  const domSummary = $('.summary, .core-section-container__content, [data-section="summary"] p').first().text().trim();
  if (domSummary && domSummary.length > (summary?.length || 0)) {
    summary = domSummary;
  }

  // Experience from JSON-LD or HTML
  const experience: ExperienceItem[] = [];
  if (Array.isArray(jsonLdData?.worksFor)) {
    jsonLdData.worksFor.forEach((work: any, index: number) => {
      experience.push({
        id: `exp_ld_${index}`,
        title: headline || 'Professional',
        companyName: work.name || 'Company',
        isCurrent: true,
        companyUrl: work.url || null,
      });
    });
  }

  // Scrape HTML experience cards if available in public markup
  $('.experience-item, .profile-section-card--experience').each((idx, el) => {
    const title = $(el).find('.profile-section-card__title, .experience-item__title').text().trim();
    const company = $(el).find('.profile-section-card__subtitle, .experience-item__subtitle').text().trim();
    const duration = $(el).find('.date-range, .experience-item__duration').text().trim();
    const desc = $(el).find('.show-more-less-text__text--less, .experience-item__description').text().trim();

    if (title || company) {
      experience.push({
        id: `exp_dom_${idx}`,
        title: title || 'Position',
        companyName: company || 'Company',
        duration: duration || null,
        isCurrent: duration.toLowerCase().includes('present'),
        description: desc || null,
      });
    }
  });

  // Education from HTML
  const education: EducationItem[] = [];
  if (Array.isArray(jsonLdData?.alumniOf)) {
    jsonLdData.alumniOf.forEach((school: any, index: number) => {
      education.push({
        id: `edu_ld_${index}`,
        schoolName: school.name || 'University',
      });
    });
  }

  $('.education-item, .profile-section-card--education').each((idx, el) => {
    const schoolName = $(el).find('.profile-section-card__title, .education__school-name').text().trim();
    const degree = $(el).find('.profile-section-card__subtitle, .education__degree-name').text().trim();
    const dates = $(el).find('.date-range, .education__duration').text().trim();

    if (schoolName) {
      education.push({
        id: `edu_dom_${idx}`,
        schoolName,
        degree: degree || null,
        startDate: dates || null,
      });
    }
  });

  const location: LocationInfo = {
    raw: locationRaw || 'Not specified',
    city: locationRaw ? locationRaw.split(',')[0]?.trim() : null,
    country: locationRaw && locationRaw.includes(',') ? locationRaw.split(',').pop()?.trim() : null,
  };

  const currentExp = experience.find((e) => e.isCurrent) || experience[0];
  let currentCompany: any = null;
  if (currentExp) {
    currentCompany = {
      name: currentExp.companyName,
      title: currentExp.title,
      companyUrl: currentExp.companyUrl || null,
    };
  } else if (headline && headline.includes(' at ')) {
    const parts = headline.split(' at ');
    currentCompany = {
      title: parts[0].trim(),
      name: parts[1].trim(),
    };
  }

  return {
    profileUrl: canonicalUrl,
    slug,
    urn: `urn:li:fsd_profile:public_${slug}`,
    publicIdentifier: slug,
    fullName: fullName || slug,
    firstName: firstName || slug,
    lastName: lastName || '',
    headline: headline || 'LinkedIn Member',
    summary,
    location,
    currentCompany,
    profilePicture: ogImage ? { url: ogImage } : null,
    experience,
    education,
    skills: [],
    certifications: [],
    languages: [],
    contactInfo: {
      emails: [],
      websites: [canonicalUrl],
    },
  };
}
