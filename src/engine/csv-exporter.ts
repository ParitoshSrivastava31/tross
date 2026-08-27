// @ts-ignore
import { Parser } from 'json2csv';
import { LinkedInProfile } from '../core/types.js';

export function convertProfilesToPhantomBusterCsv(profiles: LinkedInProfile[]): string {
  const flattenedRows = profiles.map((p) => {
    const exp1 = p.experience?.[0];
    const exp2 = p.experience?.[1];
    const edu1 = p.education?.[0];
    const edu2 = p.education?.[1];

    return {
      profileUrl: p.profileUrl,
      publicIdentifier: p.publicIdentifier || p.slug,
      urn: p.urn,
      fullName: p.fullName,
      firstName: p.firstName,
      lastName: p.lastName,
      headline: p.headline,
      location: p.location?.raw || '',
      summary: p.summary || '',
      profileImageUrl: p.profilePicture?.url || '',
      backgroundBannerUrl: p.backgroundPicture?.url || '',
      
      // Current / Primary Company
      companyName: p.currentCompany?.name || exp1?.companyName || '',
      companyIndustry: p.currentCompany?.industry || '',
      companyUrl: p.currentCompany?.companyUrl || exp1?.companyUrl || '',
      jobTitle: p.currentCompany?.title || exp1?.title || '',
      jobLocation: exp1?.location || '',
      jobStartDate: exp1?.startDate || '',
      jobEndDate: exp1?.endDate || '',
      jobDuration: exp1?.duration || '',
      jobDescription: exp1?.description || '',

      // 2nd Experience
      company2Name: exp2?.companyName || '',
      job2Title: exp2?.title || '',
      job2Location: exp2?.location || '',
      job2StartDate: exp2?.startDate || '',
      job2EndDate: exp2?.endDate || '',
      job2Duration: exp2?.duration || '',

      // Education 1
      educationSchool: edu1?.schoolName || '',
      educationDegree: edu1?.degree || '',
      educationFieldOfStudy: edu1?.fieldOfStudy || '',
      educationStartDate: edu1?.startDate || '',
      educationEndDate: edu1?.endDate || '',

      // Education 2
      education2School: edu2?.schoolName || '',
      education2Degree: edu2?.degree || '',
      education2FieldOfStudy: edu2?.fieldOfStudy || '',

      // Skills & Contact
      skills: (p.skills || []).map((s) => s.name).join('; '),
      languages: (p.languages || []).map((l) => l.name).join('; '),
      professionalEmail: p.contactInfo?.professionalEmail || p.contactInfo?.emails?.[0] || '',
      allEmails: (p.contactInfo?.emails || []).join('; '),
      twitter: p.contactInfo?.twitter || '',
      website: p.contactInfo?.websites?.[0] || '',
      followerCount: p.followerCount ?? '',
      connectionCount: p.connectionCount ?? '',

      // Extraction metadata
      fetchedAt: p.meta?.fetchedAt || '',
      dataSource: p.meta?.dataSource || '',
    };
  });

  const parser = new Parser({
    header: true,
    fields: [
      { label: 'Profile URL', value: 'profileUrl' },
      { label: 'Public Identifier', value: 'publicIdentifier' },
      { label: 'Full Name', value: 'fullName' },
      { label: 'First Name', value: 'firstName' },
      { label: 'Last Name', value: 'lastName' },
      { label: 'Headline', value: 'headline' },
      { label: 'Location', value: 'location' },
      { label: 'Summary', value: 'summary' },
      { label: 'Profile Image URL', value: 'profileImageUrl' },
      { label: 'Company Name', value: 'companyName' },
      { label: 'Company Industry', value: 'companyIndustry' },
      { label: 'Company URL', value: 'companyUrl' },
      { label: 'Job Title', value: 'jobTitle' },
      { label: 'Job Location', value: 'jobLocation' },
      { label: 'Job Start Date', value: 'jobStartDate' },
      { label: 'Job End Date', value: 'jobEndDate' },
      { label: 'Job Duration', value: 'jobDuration' },
      { label: 'Job Description', value: 'jobDescription' },
      { label: 'Company 2 Name', value: 'company2Name' },
      { label: 'Job 2 Title', value: 'job2Title' },
      { label: 'Job 2 Start Date', value: 'job2StartDate' },
      { label: 'Job 2 End Date', value: 'job2EndDate' },
      { label: 'Education School', value: 'educationSchool' },
      { label: 'Education Degree', value: 'educationDegree' },
      { label: 'Education Field of Study', value: 'educationFieldOfStudy' },
      { label: 'Education Start Date', value: 'educationStartDate' },
      { label: 'Education End Date', value: 'educationEndDate' },
      { label: 'Education 2 School', value: 'education2School' },
      { label: 'Education 2 Degree', value: 'education2Degree' },
      { label: 'Skills', value: 'skills' },
      { label: 'Languages', value: 'languages' },
      { label: 'Professional Email', value: 'professionalEmail' },
      { label: 'All Emails', value: 'allEmails' },
      { label: 'Twitter', value: 'twitter' },
      { label: 'Website', value: 'website' },
      { label: 'Follower Count', value: 'followerCount' },
      { label: 'Connection Count', value: 'connectionCount' },
      { label: 'LinkedIn URN', value: 'urn' },
      { label: 'Fetched At', value: 'fetchedAt' },
      { label: 'Data Source', value: 'dataSource' },
    ],
  });

  return parser.parse(flattenedRows);
}
