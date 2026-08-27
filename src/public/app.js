// Global state
let currentProfileData = null;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSettingsToggle();
  initQuickSamples();
  initSingleExtractor();
  initBatchExtractor();
  initJsonActions();

  // Auto-run initial demo profile
  extractProfile('https://www.linkedin.com/in/satyanadella');
});

// 1. Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });
}

// 2. Settings Toggle
function initSettingsToggle() {
  const toggleBtn = document.getElementById('toggleSettingsBtn');
  const panel = document.getElementById('settingsPanel');

  toggleBtn?.addEventListener('click', () => {
    panel?.classList.toggle('hidden');
  });
}

// 3. Quick Samples
function initQuickSamples() {
  const pills = document.querySelectorAll('.sample-pill');
  const urlInput = document.getElementById('profileUrlInput');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const url = pill.getAttribute('data-url');
      if (url && urlInput) {
        urlInput.value = url;
        extractProfile(url);
      }
    });
  });
}

// 4. Single Extractor
function initSingleExtractor() {
  const extractBtn = document.getElementById('extractBtn');
  const urlInput = document.getElementById('profileUrlInput');

  extractBtn?.addEventListener('click', () => {
    const url = urlInput?.value?.trim();
    if (url) {
      extractProfile(url);
    }
  });

  urlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = urlInput.value.trim();
      if (url) extractProfile(url);
    }
  });
}

async function extractProfile(url) {
  const loading = document.getElementById('loadingState');
  const errorAlert = document.getElementById('errorState');
  const resultsWrapper = document.getElementById('resultsWrapper');
  const extractBtn = document.getElementById('extractBtn');
  const btnSpinner = extractBtn?.querySelector('.btn-spinner');
  const btnText = extractBtn?.querySelector('.btn-text');

  const liAtCookie = document.getElementById('liAtInput')?.value?.trim();
  const jsessionId = document.getElementById('jsessionIdInput')?.value?.trim();
  const enrichEmail = document.getElementById('enrichEmailCheck')?.checked ?? true;
  const useSandboxFallback = document.getElementById('sandboxFallbackCheck')?.checked ?? true;

  // Show loading
  errorAlert?.classList.add('hidden');
  resultsWrapper?.classList.add('hidden');
  loading?.classList.remove('hidden');
  if (extractBtn) extractBtn.disabled = true;
  btnSpinner?.classList.remove('hidden');

  try {
    const response = await fetch('/api/v1/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        liAtCookie: liAtCookie || undefined,
        jsessionId: jsessionId || undefined,
        enrichEmail,
        useSandboxFallback,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.status === 'error') {
      throw new Error(result.error?.message || 'Failed to extract profile');
    }

    currentProfileData = result.data;
    renderProfile(result.data);
    resultsWrapper?.classList.remove('hidden');
  } catch (err) {
    console.error('Extraction error:', err);
    if (errorAlert) {
      document.getElementById('errorMessage').textContent = err.message || 'An error occurred';
      errorAlert.classList.remove('hidden');
    }
  } finally {
    loading?.classList.add('hidden');
    if (extractBtn) extractBtn.disabled = false;
    btnSpinner?.classList.add('hidden');
  }
}

function renderProfile(profile) {
  if (!profile) return;

  // Header & Identity
  document.getElementById('cardFullName').textContent = profile.fullName || profile.slug;
  document.getElementById('cardHeadline').textContent = profile.headline || 'LinkedIn Member';
  document.getElementById('cardLocation').innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ${profile.location?.raw || 'Not specified'}
  `;
  document.getElementById('cardCompany').innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    ${profile.currentCompany?.name || profile.experience?.[0]?.companyName || 'Independent'}
  `;

  // Avatar & Banner
  const avatarImg = document.getElementById('cardAvatar');
  if (avatarImg) {
    avatarImg.src = profile.profilePicture?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=0a66c2&color=fff&size=200`;
  }
  const banner = document.getElementById('cardBanner');
  if (banner && profile.backgroundPicture?.url) {
    banner.style.backgroundImage = `url(${profile.backgroundPicture.url})`;
  }

  // Badges
  const sourceBadge = document.getElementById('cardSourceBadge');
  if (sourceBadge) {
    sourceBadge.textContent = profile.meta?.dataSource === 'voyager_api' ? 'Voyager API' : profile.meta?.dataSource === 'sandbox_demo' ? 'Sandbox Demo' : 'Public Scraper';
  }
  const followersBadge = document.getElementById('cardFollowersBadge');
  if (followersBadge) {
    followersBadge.textContent = profile.followerCount ? `${formatNumber(profile.followerCount)} Followers` : '500+ Connections';
  }

  // Enriched Emails
  const emailsContainer = document.getElementById('cardEmails');
  if (emailsContainer) {
    emailsContainer.innerHTML = '';
    const emails = profile.contactInfo?.emails || [];
    if (emails.length === 0 && profile.contactInfo?.professionalEmail) {
      emails.push(profile.contactInfo.professionalEmail);
    }

    if (emails.length > 0) {
      emails.forEach((email) => {
        const chip = document.createElement('div');
        chip.className = 'email-chip';
        chip.innerHTML = `
          <span>${email}</span>
          <button class="copy-email-btn" title="Copy email" onclick="navigator.clipboard.writeText('${email}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        `;
        emailsContainer.appendChild(chip);
      });
    } else {
      emailsContainer.innerHTML = '<span style="color: var(--text-dim); font-size: 0.84rem;">No public emails exposed</span>';
    }
  }

  // About
  const aboutText = document.getElementById('cardAbout');
  if (aboutText) {
    aboutText.textContent = profile.summary || 'No summary or about description provided by member.';
  }

  // Experience Timeline
  const expContainer = document.getElementById('cardExperience');
  if (expContainer) {
    expContainer.innerHTML = '';
    if (profile.experience?.length) {
      profile.experience.forEach((exp) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-title">${exp.title}</div>
          <div class="timeline-company">${exp.companyName} ${exp.location ? '• ' + exp.location : ''}</div>
          <div class="timeline-duration">${exp.startDate || ''} – ${exp.endDate || 'Present'} ${exp.duration ? '• ' + exp.duration : ''}</div>
          ${exp.description ? `<div class="timeline-desc">${exp.description}</div>` : ''}
        `;
        expContainer.appendChild(item);
      });
    } else {
      expContainer.innerHTML = '<span style="color: var(--text-dim); font-size: 0.84rem;">No work experience listed</span>';
    }
  }

  // Education
  const eduContainer = document.getElementById('cardEducation');
  if (eduContainer) {
    eduContainer.innerHTML = '';
    if (profile.education?.length) {
      profile.education.forEach((edu) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-title">${edu.schoolName}</div>
          <div class="timeline-company">${edu.degree || ''} ${edu.fieldOfStudy ? '• ' + edu.fieldOfStudy : ''}</div>
          <div class="timeline-duration">${edu.startDate || ''} – ${edu.endDate || ''}</div>
        `;
        eduContainer.appendChild(item);
      });
    } else {
      eduContainer.innerHTML = '<span style="color: var(--text-dim); font-size: 0.84rem;">No education entries listed</span>';
    }
  }

  // Skills
  const skillsContainer = document.getElementById('cardSkills');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    if (profile.skills?.length) {
      profile.skills.forEach((sk) => {
        const tag = document.createElement('span');
        tag.className = 'skill-tag';
        tag.innerHTML = `
          <span>${sk.name}</span>
          ${sk.endorsementCount ? `<span class="skill-count">${sk.endorsementCount}</span>` : ''}
        `;
        skillsContainer.appendChild(tag);
      });
    } else {
      skillsContainer.innerHTML = '<span style="color: var(--text-dim); font-size: 0.84rem;">No skills listed</span>';
    }
  }

  // Render JSON Viewer
  const jsonViewer = document.getElementById('jsonViewer');
  if (jsonViewer) {
    jsonViewer.textContent = JSON.stringify(profile, null, 2);
  }
}

// 5. JSON Actions
function initJsonActions() {
  document.getElementById('copyJsonBtn')?.addEventListener('click', () => {
    if (currentProfileData) {
      navigator.clipboard.writeText(JSON.stringify(currentProfileData, null, 2));
      alert('JSON copied to clipboard!');
    }
  });

  document.getElementById('downloadJsonBtn')?.addEventListener('click', () => {
    if (currentProfileData) {
      const blob = new Blob([JSON.stringify(currentProfileData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkedin-profile-${currentProfileData.slug || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
}

// 6. Batch Extractor & CSV Export
function initBatchExtractor() {
  const runBatchBtn = document.getElementById('runBatchBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const batchUrlsInput = document.getElementById('batchUrlsInput');

  runBatchBtn?.addEventListener('click', async () => {
    const rawText = batchUrlsInput?.value || '';
    const urls = rawText.split('\n').map((u) => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      alert('Please enter at least one LinkedIn URL.');
      return;
    }

    runBatchBtn.disabled = true;
    runBatchBtn.textContent = 'Processing...';

    try {
      const response = await fetch('/api/v1/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      // Render metrics
      document.getElementById('batchMetrics')?.classList.remove('hidden');
      document.getElementById('metricTotal').textContent = data.total || 0;
      document.getElementById('metricSuccess').textContent = data.successful || 0;
      document.getElementById('metricFailed').textContent = data.failed || 0;
      document.getElementById('metricLatency').textContent = `${data.processingTimeMs || 0}ms`;

      // Render table
      const tbody = document.getElementById('batchTableBody');
      const tableWrapper = document.getElementById('batchTableWrapper');
      if (tbody) {
        tbody.innerHTML = '';
        (data.results || []).forEach((item) => {
          const row = document.createElement('tr');
          const p = item.data;
          row.innerHTML = `
            <td><a href="${item.url}" target="_blank" style="color: var(--accent); text-decoration: none;">${p?.slug || item.url}</a></td>
            <td><strong>${p?.fullName || '-'}</strong></td>
            <td>${p?.headline || p?.currentCompany?.title || '-'}</td>
            <td>${p?.currentCompany?.name || '-'}</td>
            <td><code>${p?.contactInfo?.professionalEmail || p?.contactInfo?.emails?.[0] || '-'}</code></td>
            <td>${p?.location?.raw || '-'}</td>
            <td><span class="badge ${item.success ? 'live-badge' : 'alert-error'}">${item.success ? 'Extracted' : 'Failed'}</span></td>
          `;
          tbody.appendChild(row);
        });
        tableWrapper?.classList.remove('hidden');
      }
    } catch (err) {
      alert('Batch error: ' + err.message);
    } finally {
      runBatchBtn.disabled = false;
      runBatchBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Process Batch
      `;
    }
  });

  exportCsvBtn?.addEventListener('click', async () => {
    const rawText = batchUrlsInput?.value || '';
    const urls = rawText.split('\n').map((u) => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      alert('Please enter at least one LinkedIn URL.');
      return;
    }

    exportCsvBtn.disabled = true;
    exportCsvBtn.textContent = 'Generating CSV...';

    try {
      const response = await fetch('/api/v1/batch/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) throw new Error('Failed to generate CSV export');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkedin-profiles-phantombuster-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export error: ' + err.message);
    } finally {
      exportCsvBtn.disabled = false;
      exportCsvBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export to CSV (PhantomBuster Format)
      `;
    }
  });
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
