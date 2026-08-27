// Global State
let currentProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  initSegmentedTabs();
  initPresetPills();
  initDrawer();
  initExtractActions();
  initBatchActions();
  initCodeActions();

  // Load default Satya Nadella profile
  extractProfile('https://www.linkedin.com/in/satyanadella');
});

// 1. Segmented Control Tabs
function initSegmentedTabs() {
  const pills = document.querySelectorAll('.segment-pill');
  const panels = document.querySelectorAll('.view-panel');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetView = pill.getAttribute('data-view');
      pills.forEach((p) => p.classList.remove('active'));
      panels.forEach((pan) => pan.classList.remove('active'));

      pill.classList.add('active');
      document.getElementById(targetView)?.classList.add('active');
    });
  });
}

// 2. Preset Pills
function initPresetPills() {
  const pills = document.querySelectorAll('.preset-pill');
  const input = document.getElementById('profileUrlInput');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const url = pill.getAttribute('data-url');
      if (url && input) {
        input.value = url;
        extractProfile(url);
      }
    });
  });
}

// 3. Parameters Drawer
function initDrawer() {
  const trigger = document.getElementById('toggleDrawerBtn');
  const drawer = document.getElementById('drawerBody');

  trigger?.addEventListener('click', () => {
    drawer?.classList.toggle('hidden');
  });
}

// 4. Extract Actions
function initExtractActions() {
  const btn = document.getElementById('extractBtn');
  const input = document.getElementById('profileUrlInput');

  btn?.addEventListener('click', () => {
    const url = input?.value?.trim();
    if (url) extractProfile(url);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = input.value.trim();
      if (url) extractProfile(url);
    }
  });
}

async function extractProfile(url) {
  const loader = document.getElementById('loadingState');
  const errorBanner = document.getElementById('errorState');
  const resultsDeck = document.getElementById('resultsConsole');
  const btn = document.getElementById('extractBtn');
  const spinner = btn?.querySelector('.btn-spinner');
  const label = btn?.querySelector('.btn-label');

  const liAtCookie = document.getElementById('liAtInput')?.value?.trim();
  const jsessionId = document.getElementById('jsessionIdInput')?.value?.trim();
  const enrichEmail = document.getElementById('enrichEmailCheck')?.checked ?? true;
  const useSandboxFallback = document.getElementById('sandboxFallbackCheck')?.checked ?? true;

  updateCurlPreview(url, enrichEmail, liAtCookie);

  errorBanner?.classList.add('hidden');
  loader?.classList.remove('hidden');
  if (btn) btn.disabled = true;
  spinner?.classList.remove('hidden');
  if (label) label.textContent = 'Extracting...';

  const startTime = performance.now();

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
      throw new Error(result.error?.message || 'Failed to extract profile.');
    }

    const elapsed = Math.round(performance.now() - startTime);
    currentProfile = result.data;

    renderVisualPreview(result.data, elapsed);
    renderJsonViewer(result.data);
    resultsDeck?.classList.remove('hidden');
  } catch (err) {
    console.error('Extract error:', err);
    if (errorBanner) {
      document.getElementById('errorMessage').textContent = err.message || 'Error occurred';
      errorBanner.classList.remove('hidden');
    }
  } finally {
    loader?.classList.add('hidden');
    if (btn) btn.disabled = false;
    spinner?.classList.add('hidden');
    if (label) label.textContent = 'Extract Profile';
  }
}

function renderVisualPreview(p, latencyMs) {
  if (!p) return;

  document.getElementById('latencyTag').textContent = `⚡ ${p.meta?.processingTimeMs || latencyMs}ms`;
  document.getElementById('sourceTag').textContent = p.meta?.dataSource || 'voyager_api';

  document.getElementById('cardFullName').textContent = p.fullName || p.slug;
  document.getElementById('cardHeadline').textContent = p.headline || 'LinkedIn Member';
  document.getElementById('cardLocationText').textContent = p.location?.raw || 'Location not specified';
  document.getElementById('cardCompanyText').textContent = p.currentCompany?.name || p.experience?.[0]?.companyName || 'Independent';
  document.getElementById('cardFollowersText').textContent = p.followerCount ? `${formatNumber(p.followerCount)} Followers` : '500+ Connections';

  const avatar = document.getElementById('cardAvatar');
  if (avatar) {
    avatar.src = p.profilePicture?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullName)}&background=0f172a&color=fff&size=200`;
  }
  const banner = document.getElementById('cardBanner');
  if (banner && p.backgroundPicture?.url) {
    banner.style.backgroundImage = `url(${p.backgroundPicture.url})`;
  }

  // Discovered Emails
  const emailBox = document.getElementById('cardEmails');
  if (emailBox) {
    emailBox.innerHTML = '';
    const emails = p.contactInfo?.emails || [];
    if (emails.length === 0 && p.contactInfo?.professionalEmail) emails.push(p.contactInfo.professionalEmail);

    if (emails.length > 0) {
      emails.forEach((email) => {
        const chip = document.createElement('div');
        chip.className = 'email-tag-chip';
        chip.innerHTML = `
          <span>${email}</span>
          <button class="btn-tag-copy" title="Copy email" onclick="copyToClipboard('${email}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        `;
        emailBox.appendChild(chip);
      });
    } else {
      emailBox.innerHTML = '<span style="color: var(--text-faint); font-size: 0.78rem;">No public emails discovered</span>';
    }
  }

  // Summary
  const about = document.getElementById('cardAbout');
  if (about) {
    about.textContent = p.summary || 'No summary text provided by member.';
  }

  // Experience
  const expBox = document.getElementById('cardExperience');
  if (expBox) {
    expBox.innerHTML = '';
    if (p.experience?.length) {
      p.experience.forEach((exp) => {
        const card = document.createElement('div');
        card.className = 'timeline-card';
        card.innerHTML = `
          <div class="timeline-bullet"></div>
          <div class="timeline-info">
            <div class="timeline-pos">${exp.title}</div>
            <div class="timeline-org-row">${exp.companyName} ${exp.location ? '• ' + exp.location : ''}</div>
            <div class="timeline-period">${exp.startDate || ''} – ${exp.endDate || 'Present'} ${exp.duration ? '• ' + exp.duration : ''}</div>
            ${exp.description ? `<div class="timeline-desc-text">${exp.description}</div>` : ''}
          </div>
        `;
        expBox.appendChild(card);
      });
    } else {
      expBox.innerHTML = '<span style="color: var(--text-faint); font-size: 0.78rem;">No work history recorded</span>';
    }
  }

  // Education
  const eduBox = document.getElementById('cardEducation');
  if (eduBox) {
    eduBox.innerHTML = '';
    if (p.education?.length) {
      p.education.forEach((edu) => {
        const item = document.createElement('div');
        item.className = 'edu-card';
        item.innerHTML = `
          <div class="edu-school-name">${edu.schoolName}</div>
          <div class="edu-degree-details">${edu.degree || ''} ${edu.fieldOfStudy ? '• ' + edu.fieldOfStudy : ''}</div>
          <div class="edu-period-tag">${edu.startDate || ''} – ${edu.endDate || ''}</div>
        `;
        eduBox.appendChild(item);
      });
    } else {
      eduBox.innerHTML = '<span style="color: var(--text-faint); font-size: 0.78rem;">No education recorded</span>';
    }
  }

  // Skills
  const skillsBox = document.getElementById('cardSkills');
  if (skillsBox) {
    skillsBox.innerHTML = '';
    if (p.skills?.length) {
      p.skills.forEach((sk) => {
        const chip = document.createElement('span');
        chip.className = 'skill-pill-token';
        chip.innerHTML = `
          <span>${sk.name}</span>
          ${sk.endorsementCount ? `<span class="skill-counter">${sk.endorsementCount}</span>` : ''}
        `;
        skillsBox.appendChild(chip);
      });
    } else {
      skillsBox.innerHTML = '<span style="color: var(--text-faint); font-size: 0.78rem;">No skills recorded</span>';
    }
  }
}

// 5. Syntax Highlighting
function renderJsonViewer(json) {
  const container = document.getElementById('jsonViewer');
  if (!container) return;

  const jsonStr = JSON.stringify(json, null, 2);
  container.innerHTML = syntaxHighlight(jsonStr);
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// 6. Dynamic cURL Preview
function updateCurlPreview(url, enrichEmail, liAtCookie) {
  const curlBox = document.getElementById('curlViewer');
  if (!curlBox) return;

  const origin = window.location.origin;
  const payload = { url, enrichEmail };
  if (liAtCookie) payload.liAtCookie = liAtCookie;

  curlBox.textContent = `curl -X POST "${origin}/api/v1/profile" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`;
}

// 7. Code Actions
function initCodeActions() {
  document.getElementById('copyJsonBtn')?.addEventListener('click', () => {
    if (currentProfile) {
      copyToClipboard(JSON.stringify(currentProfile, null, 2));
      showToast('JSON copied to clipboard');
    }
  });

  document.getElementById('downloadJsonBtn')?.addEventListener('click', () => {
    if (currentProfile) {
      const blob = new Blob([JSON.stringify(currentProfile, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkedin-${currentProfile.slug || 'profile'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded JSON export');
    }
  });

  document.getElementById('copyCurlBtn')?.addEventListener('click', () => {
    const text = document.getElementById('curlViewer')?.textContent;
    if (text) {
      copyToClipboard(text);
      showToast('cURL command copied');
    }
  });
}

// 8. Batch Exporter
function initBatchActions() {
  const runBtn = document.getElementById('runBatchBtn');
  const exportBtn = document.getElementById('exportCsvBtn');
  const input = document.getElementById('batchUrlsInput');

  runBtn?.addEventListener('click', async () => {
    const raw = input?.value || '';
    const urls = raw.split('\n').map((u) => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      showToast('Please specify at least one URL');
      return;
    }

    runBtn.disabled = true;
    runBtn.innerHTML = `<span>Processing...</span>`;

    try {
      const res = await fetch('/api/v1/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      const data = await res.json();

      document.getElementById('batchMetrics')?.classList.remove('hidden');
      document.getElementById('metricTotal').textContent = data.total || 0;
      document.getElementById('metricSuccess').textContent = data.successful || 0;
      document.getElementById('metricFailed').textContent = data.failed || 0;
      document.getElementById('metricLatency').textContent = `${data.processingTimeMs || 0}ms`;

      const tbody = document.getElementById('batchTableBody');
      const tableBox = document.getElementById('batchTableWrapper');
      if (tbody) {
        tbody.innerHTML = '';
        (data.results || []).forEach((r) => {
          const row = document.createElement('tr');
          const p = r.data;
          row.innerHTML = `
            <td><a href="${r.url}" target="_blank" style="color: #0f172a; font-weight: 600; text-decoration: none;">${p?.slug || r.url}</a></td>
            <td><strong>${p?.fullName || '-'}</strong></td>
            <td>${p?.headline || p?.currentCompany?.title || '-'}</td>
            <td>${p?.currentCompany?.name || '-'}</td>
            <td><code>${p?.contactInfo?.professionalEmail || p?.contactInfo?.emails?.[0] || '-'}</code></td>
            <td><span class="badge-pill">${r.success ? 'Success' : 'Error'}</span></td>
          `;
          tbody.appendChild(row);
        });
        tableBox?.classList.remove('hidden');
      }
      showToast('Batch processing completed');
    } catch (err) {
      showToast('Batch error: ' + err.message);
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Process Batch</span>`;
    }
  });

  exportBtn?.addEventListener('click', async () => {
    const raw = input?.value || '';
    const urls = raw.split('\n').map((u) => u.trim()).filter(Boolean);

    if (urls.length === 0) {
      showToast('Please specify at least one URL');
      return;
    }

    exportBtn.disabled = true;
    exportBtn.innerHTML = `<span>Exporting CSV...</span>`;

    try {
      const res = await fetch('/api/v1/batch/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      if (!res.ok) throw new Error('Failed to generate CSV');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkedin-profiles-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded PhantomBuster CSV');
    } catch (err) {
      showToast('CSV error: ' + err.message);
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Export PhantomBuster CSV</span>`;
    }
  });
}

// Helpers
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMessage');
  if (toast && msgEl) {
    msgEl.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2200);
  }
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
