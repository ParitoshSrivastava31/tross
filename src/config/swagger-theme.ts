export const SWAGGER_CUSTOM_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap');

:root {
  --bg-page: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;
  --border-hairline: #e2e8f0;
  --border-input: #cbd5e1;
  --border-hover: #94a3b8;
  --text-title: #0f172a;
  --text-body: #1e293b;
  --text-secondary: #334155;
  --text-muted: #475569;
  --text-faint: #64748b;
  --apple-blue: #0071e3;
  --apple-green: #059669;
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
}

/* Page Canvas */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  font-family: var(--font-display) !important;
  background-color: var(--bg-page) !important;
  background: var(--bg-page) !important;
  color: var(--text-body) !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-image: 
    radial-gradient(at 50% 0%, rgba(0, 113, 227, 0.03) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.02) 0px, transparent 50%) !important;
  background-attachment: fixed !important;
  min-height: 100vh !important;
}

#swagger-ui,
.swagger-ui,
.swagger-ui .wrapper,
.swagger-ui .swagger-container {
  background-color: transparent !important;
  background: transparent !important;
  color: var(--text-body) !important;
}

/* Custom Sticky Navigation Bar */
.tross-custom-nav {
  position: sticky;
  top: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-hairline);
  padding: 12px 24px;
}

.tross-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tross-nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-title);
}

.tross-brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
}

.tross-brand-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-title);
}

.tross-brand-sub {
  color: var(--apple-blue);
  font-weight: 500;
}

.tross-badge-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--bg-subtle);
  color: var(--text-muted);
  border: 1px solid var(--border-hairline);
  margin-left: 4px;
}

.tross-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tross-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: var(--text-body);
  background: #ffffff;
  border: 1px solid var(--border-hairline);
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.tross-nav-btn:hover {
  background: var(--bg-subtle);
  border-color: var(--border-input);
  color: var(--text-title);
  transform: translateY(-1px);
}

.tross-nav-btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
  border-color: #0f172a !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2) !important;
}

.tross-nav-btn-primary:hover {
  background: #1e293b !important;
  color: #ffffff !important;
}

.tross-status-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tross-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Hide Default Swagger Topbar */
.swagger-ui .topbar {
  display: none !important;
}

/* Main Container */
.swagger-ui {
  font-family: var(--font-display) !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 32px 24px 80px 24px !important;
}

.swagger-ui .wrapper {
  padding: 0 !important;
  max-width: 100% !important;
}

/* Info Section Header Card */
.swagger-ui .info {
  margin: 0 0 28px 0 !important;
  padding: 32px !important;
  background: #ffffff !important;
  border-radius: 16px !important;
  border: 1px solid var(--border-hairline) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02) !important;
}

.swagger-ui .info .title {
  font-family: var(--font-display) !important;
  font-size: 30px !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: var(--text-title) !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
  margin-bottom: 8px !important;
}

/* Remove 1.0.0 and OAS 3.0 badges completely */
.swagger-ui .info .title small,
.swagger-ui .info .title .version-stamp,
.swagger-ui .info .title .version-pragma,
.swagger-ui .info .title .version,
.swagger-ui .info .title pre,
.swagger-ui .info .version-pragma {
  display: none !important;
}

.swagger-ui .info .base-url,
.swagger-ui .info a.nostyle {
  font-family: var(--font-mono) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: var(--apple-blue) !important;
  text-decoration: none !important;
}

.swagger-ui .info p,
.swagger-ui .info .description,
.swagger-ui .info .description p {
  font-family: var(--font-display) !important;
  font-size: 15px !important;
  line-height: 1.65 !important;
  color: var(--text-secondary) !important;
  margin-top: 10px !important;
  font-weight: 500 !important;
}

.swagger-ui .info a {
  color: var(--apple-blue) !important;
  font-weight: 600 !important;
  text-decoration: none !important;
}

/* Scheme & Server Selector Card */
.swagger-ui .scheme-container {
  background: #ffffff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02) !important;
  border: 1px solid var(--border-hairline) !important;
  border-radius: 12px !important;
  padding: 16px 22px !important;
  margin-bottom: 24px !important;
}

.swagger-ui .servers-title {
  font-family: var(--font-display) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--text-faint) !important;
  margin-bottom: 8px !important;
}

.swagger-ui .servers > label select {
  font-family: var(--font-mono) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: 1.5px solid var(--border-input) !important;
  border-radius: 8px !important;
  padding: 8px 14px !important;
  background-color: var(--bg-subtle) !important;
  color: var(--text-title) !important;
  cursor: pointer !important;
}

/* Filter Input Box */
.swagger-ui .filter-container {
  margin-bottom: 24px !important;
  padding: 0 !important;
}

.swagger-ui .filter-container input,
.swagger-ui .filter-container .operation-filter-input {
  font-family: var(--font-display) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  border: 1.5px solid var(--border-input) !important;
  border-radius: 10px !important;
  padding: 10px 16px !important;
  background: #ffffff !important;
  color: var(--text-title) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.15s ease !important;
  width: 100% !important;
  max-width: 440px !important;
}

.swagger-ui .filter-container input::placeholder,
.swagger-ui .filter-container .operation-filter-input::placeholder {
  color: #64748b !important;
  opacity: 1 !important;
  font-weight: 500 !important;
}

.swagger-ui .filter-container input:focus,
.swagger-ui .filter-container .operation-filter-input:focus {
  border-color: var(--apple-blue) !important;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15) !important;
  outline: none !important;
}

/* Tag Sections (Profile, Batch Scraper, Health) */
.swagger-ui .opblock-tag-section {
  margin-bottom: 32px !important;
}

.swagger-ui .opblock-tag {
  font-family: var(--font-display) !important;
  font-size: 20px !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
  color: var(--text-title) !important;
  border-bottom: 2px solid var(--border-hairline) !important;
  padding: 14px 0 !important;
  margin-bottom: 16px !important;
  display: flex !important;
  align-items: center !important;
}

.swagger-ui .opblock-tag:hover {
  background: transparent !important;
}

.swagger-ui .opblock-tag a,
.swagger-ui .opblock-tag a span {
  color: var(--text-title) !important;
  font-weight: 800 !important;
}

/* High-Contrast Section Tag Descriptions (Overrides Swagger UI's 0.6 opacity) */
.swagger-ui .opblock-tag small,
.swagger-ui .opblock-tag small *,
.swagger-ui .opblock-tag .markdown,
.swagger-ui .opblock-tag .markdown p,
.swagger-ui .opblock-tag small div,
.swagger-ui .opblock-tag small p {
  opacity: 1 !important;
  filter: none !important;
  color: #334155 !important;
  font-family: var(--font-display) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin: 0 0 0 14px !important;
  padding: 0 !important;
  display: inline-block !important;
}

.swagger-ui .opblock-tag svg {
  fill: var(--text-title) !important;
}

/* Endpoint Cards (.opblock) */
.swagger-ui .opblock {
  border-radius: 12px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
  border: 1.5px solid var(--border-hairline) !important;
  background: #ffffff !important;
  margin: 0 0 14px 0 !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  overflow: hidden !important;
}

.swagger-ui .opblock:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05) !important;
  border-color: var(--border-input) !important;
}

.swagger-ui .opblock .opblock-summary {
  padding: 14px 20px !important;
  display: flex !important;
  align-items: center !important;
  background: #ffffff !important;
}

/* Method Badges */
.swagger-ui .opblock .opblock-summary-method {
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  border-radius: 6px !important;
  padding: 5px 14px !important;
  min-width: 72px !important;
  text-align: center !important;
  letter-spacing: 0.04em !important;
  text-shadow: none !important;
}

/* Method Variants */
.swagger-ui .opblock.opblock-get {
  background: #ffffff !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
}
.swagger-ui .opblock.opblock-get .opblock-summary-method {
  background: #ecfdf5 !important;
  color: #059669 !important;
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
}
.swagger-ui .opblock.opblock-get .opblock-summary {
  border-color: rgba(16, 185, 129, 0.2) !important;
}

.swagger-ui .opblock.opblock-post {
  background: #ffffff !important;
  border-color: rgba(37, 99, 235, 0.4) !important;
}
.swagger-ui .opblock.opblock-post .opblock-summary-method {
  background: #eff6ff !important;
  color: #2563eb !important;
  border: 1px solid rgba(37, 99, 235, 0.4) !important;
}
.swagger-ui .opblock.opblock-post .opblock-summary {
  border-color: rgba(37, 99, 235, 0.2) !important;
}

.swagger-ui .opblock.opblock-delete .opblock-summary-method {
  background: #fef2f2 !important;
  color: #e11d48 !important;
  border: 1px solid rgba(225, 29, 72, 0.4) !important;
}

/* Endpoint Path & Description */
.swagger-ui .opblock .opblock-summary-path {
  font-family: var(--font-mono) !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
  text-decoration: none !important;
}

.swagger-ui .opblock .opblock-summary-path:hover {
  color: var(--apple-blue) !important;
}

.swagger-ui .opblock .opblock-summary-description {
  font-family: var(--font-display) !important;
  font-size: 13.5px !important;
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  opacity: 1 !important;
}

/* Opblock Body (Expanded Endpoint View) */
.swagger-ui .opblock-body {
  background: #ffffff !important;
  border-top: 1px solid var(--border-hairline) !important;
  padding: 24px !important;
}

/* Expanded Endpoint Title & Markdown Descriptions */
.swagger-ui .opblock-description-wrapper,
.swagger-ui .opblock-description-wrapper p,
.swagger-ui .opblock-description-wrapper *,
.swagger-ui .opblock-title_normal,
.swagger-ui .opblock-title_normal p,
.swagger-ui .markdown,
.swagger-ui .markdown p,
.swagger-ui .renderedMarkdown,
.swagger-ui .renderedMarkdown p {
  opacity: 1 !important;
  color: #1e293b !important;
  font-family: var(--font-display) !important;
  font-size: 14.5px !important;
  font-weight: 500 !important;
  line-height: 1.6 !important;
}

/* Parameters Section Header */
.swagger-ui .opblock-section-header {
  background: var(--bg-subtle) !important;
  border: 1px solid var(--border-hairline) !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  box-shadow: none !important;
  min-height: auto !important;
  margin-bottom: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.swagger-ui .opblock-section-header:before,
.swagger-ui .opblock-section-header:after {
  display: none !important;
}

.swagger-ui .opblock-section-header h4 {
  font-family: var(--font-display) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
  margin: 0 !important;
  letter-spacing: -0.01em !important;
}

/* Parameters Table */
.swagger-ui .parameters-container {
  padding: 0 !important;
  margin-top: 10px !important;
}

.swagger-ui table.parameters {
  font-family: var(--font-display) !important;
}

.swagger-ui table.parameters thead th {
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--text-muted) !important;
  border-bottom: 2px solid var(--border-hairline) !important;
  padding: 12px 8px !important;
}

.swagger-ui .parameter__name {
  font-family: var(--font-mono) !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
}

.swagger-ui .parameter__name.required:after {
  color: #ef4444 !important;
  font-weight: 800 !important;
}

.swagger-ui .parameter__type {
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: var(--text-faint) !important;
}

.swagger-ui .parameter__in {
  font-size: 12px !important;
  color: var(--apple-blue) !important;
  font-weight: 600 !important;
}

.swagger-ui .parameter__description,
.swagger-ui .parameter__description p,
.swagger-ui .parameter__description p.markdown,
.swagger-ui .parameter__description * {
  opacity: 1 !important;
  color: #1e293b !important;
  font-family: var(--font-display) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 1.55 !important;
}

/* Form Inputs & Textareas */
.swagger-ui input[type="text"],
.swagger-ui textarea,
.swagger-ui select {
  font-family: var(--font-mono) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  border: 1.5px solid var(--border-input) !important;
  border-radius: 8px !important;
  padding: 10px 14px !important;
  background: #ffffff !important;
  color: var(--text-title) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.15s ease !important;
}

.swagger-ui input[type="text"]::placeholder,
.swagger-ui textarea::placeholder {
  color: #64748b !important;
  opacity: 1 !important;
  font-weight: 500 !important;
}

.swagger-ui input[type="text"]:focus,
.swagger-ui textarea:focus,
.swagger-ui select:focus {
  border-color: var(--apple-blue) !important;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15) !important;
  outline: none !important;
}

/* Action Buttons */
.swagger-ui .btn {
  font-family: var(--font-display) !important;
  border-radius: 8px !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  box-shadow: none !important;
  transition: all 0.15s ease !important;
}

.swagger-ui .btn.try-out__btn {
  background: var(--bg-subtle) !important;
  border: 1.5px solid var(--border-input) !important;
  color: var(--text-title) !important;
  padding: 6px 16px !important;
  font-size: 12px !important;
}

.swagger-ui .btn.try-out__btn:hover {
  background: #e2e8f0 !important;
  border-color: var(--border-hover) !important;
  color: var(--text-title) !important;
}

.swagger-ui .btn.execute {
  background: #0f172a !important;
  color: #ffffff !important;
  border: none !important;
  padding: 10px 28px !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25) !important;
}

.swagger-ui .btn.execute:hover {
  background: #1e293b !important;
  transform: translateY(-1px) !important;
}

.swagger-ui .btn.btn-clear {
  background: #ffffff !important;
  border: 1.5px solid var(--border-input) !important;
  color: var(--text-muted) !important;
  padding: 8px 18px !important;
}

.swagger-ui .btn.cancel {
  background: rgba(239, 68, 68, 0.08) !important;
  border: 1px solid rgba(239, 68, 68, 0.25) !important;
  color: #ef4444 !important;
  padding: 8px 18px !important;
}

/* High-Contrast Code Boxes & Response Viewers */
.swagger-ui .highlight-code,
.swagger-ui pre.microlight,
.swagger-ui .curl-command,
.swagger-ui .responses-inner pre {
  background: #0f172a !important;
  color: #f8fafc !important;
  border-radius: 10px !important;
  border: 1px solid #1e293b !important;
  font-family: var(--font-mono) !important;
  font-size: 12.5px !important;
  padding: 16px !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

.swagger-ui .highlight-code code,
.swagger-ui pre.microlight code {
  font-family: var(--font-mono) !important;
  color: #f8fafc !important;
}

/* Responses Table */
.swagger-ui .responses-table {
  font-family: var(--font-display) !important;
}

.swagger-ui .responses-table thead th {
  font-size: 12px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--text-muted) !important;
  border-bottom: 2px solid var(--border-hairline) !important;
  padding: 10px 8px !important;
}

.swagger-ui .response-col_status {
  font-family: var(--font-mono) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  color: var(--text-title) !important;
}

.swagger-ui .response-col_description,
.swagger-ui .response-col_description p,
.swagger-ui .response-col_description * {
  color: var(--text-body) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

/* Models / Schemas Block at Bottom */
.swagger-ui section.models {
  background: #ffffff !important;
  border: 1px solid var(--border-hairline) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
  margin-top: 40px !important;
  overflow: hidden !important;
}

.swagger-ui section.models h4 {
  font-family: var(--font-display) !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
  padding: 16px 20px !important;
  border-bottom: 1px solid var(--border-hairline) !important;
}

.swagger-ui .model-box {
  background: #ffffff !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
}

.swagger-ui .model-title {
  font-family: var(--font-display) !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ==========================================================================
   MOBILE & TABLET RESPONSIVENESS FOR SWAGGER UI
   ========================================================================== */

@media (max-width: 868px) {
  .swagger-ui {
    padding: 24px 16px 60px 16px !important;
  }
  
  .swagger-ui .info {
    padding: 24px !important;
  }
}

@media (max-width: 640px) {
  /* Sticky Navigation */
  .tross-custom-nav {
    padding: 10px 14px;
  }
  
  .tross-nav-container {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .tross-nav-actions {
    width: 100%;
    justify-content: space-between;
    gap: 6px;
  }
  
  .tross-nav-btn {
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .tross-status-box {
    padding: 3px 8px;
    font-size: 11px;
  }
  
  /* Swagger Root Canvas */
  .swagger-ui {
    padding: 16px 10px 50px 10px !important;
  }
  
  /* Info Card */
  .swagger-ui .info {
    padding: 18px 14px !important;
    border-radius: 12px !important;
    margin-bottom: 20px !important;
  }
  
  .swagger-ui .info .title {
    font-size: 21px !important;
    line-height: 1.25 !important;
    margin-bottom: 6px !important;
  }
  
  .swagger-ui .info p,
  .swagger-ui .info .description,
  .swagger-ui .info .description p {
    font-size: 13.5px !important;
    line-height: 1.5 !important;
  }
  
  /* Scheme & Server Select */
  .swagger-ui .scheme-container {
    padding: 12px 14px !important;
    border-radius: 10px !important;
    margin-bottom: 18px !important;
  }
  
  .swagger-ui .servers > label select {
    width: 100% !important;
    font-size: 12px !important;
  }
  
  /* Filter Container */
  .swagger-ui .filter-container input,
  .swagger-ui .filter-container .operation-filter-input {
    max-width: 100% !important;
    font-size: 13px !important;
    padding: 8px 12px !important;
  }
  
  /* Tag Sections */
  .swagger-ui .opblock-tag {
    font-size: 17px !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    padding: 10px 0 !important;
  }
  
  .swagger-ui .opblock-tag small,
  .swagger-ui .opblock-tag small *,
  .swagger-ui .opblock-tag .markdown,
  .swagger-ui .opblock-tag .markdown p {
    margin-left: 0 !important;
    width: 100% !important;
    font-size: 13px !important;
  }
  
  /* Opblock Summary */
  .swagger-ui .opblock .opblock-summary {
    padding: 10px 12px !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }
  
  .swagger-ui .opblock .opblock-summary-method {
    min-width: 58px !important;
    font-size: 11px !important;
    padding: 4px 8px !important;
  }
  
  .swagger-ui .opblock .opblock-summary-path {
    font-size: 12.5px !important;
    word-break: break-all !important;
  }
  
  .swagger-ui .opblock .opblock-summary-description {
    width: 100% !important;
    font-size: 12px !important;
  }
  
  /* Opblock Body */
  .swagger-ui .opblock-body {
    padding: 14px 10px !important;
  }
  
  .swagger-ui .opblock-section-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
    padding: 8px 12px !important;
  }
  
  .swagger-ui .btn.try-out__btn {
    width: 100% !important;
    text-align: center !important;
  }
  
  /* Parameters Table */
  .swagger-ui table.parameters {
    display: block !important;
    overflow-x: auto !important;
    width: 100% !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  .swagger-ui .parameters-col_name {
    min-width: 100px !important;
  }
  
  .swagger-ui .parameters-col_description {
    min-width: 160px !important;
  }
  
  /* Inputs */
  .swagger-ui input[type="text"],
  .swagger-ui textarea,
  .swagger-ui select {
    width: 100% !important;
    max-width: 100% !important;
    font-size: 12px !important;
    padding: 8px 10px !important;
  }
  
  /* Execute Buttons */
  .swagger-ui .btn.execute {
    width: 100% !important;
    padding: 10px 16px !important;
  }
  
  .swagger-ui .btn.btn-clear,
  .swagger-ui .btn.cancel {
    width: 100% !important;
    margin-top: 6px !important;
  }
  
  .swagger-ui .execute-wrapper {
    padding: 10px 0 !important;
  }
  
  /* Code & Responses */
  .swagger-ui .highlight-code,
  .swagger-ui pre.microlight,
  .swagger-ui .curl-command,
  .swagger-ui .responses-inner pre {
    font-size: 11.5px !important;
    padding: 10px !important;
  }
  
  .swagger-ui .responses-table {
    display: block !important;
    overflow-x: auto !important;
    width: 100% !important;
  }
}
`;

export const SWAGGER_CUSTOM_JS = `
(function() {
  function injectCustomNavbar() {
    if (document.getElementById('tross-custom-navbar')) return;

    const nav = document.createElement('header');
    nav.id = 'tross-custom-navbar';
    nav.className = 'tross-custom-nav';
    nav.innerHTML = \`
      <div class="tross-nav-container">
        <a href="/" class="tross-nav-brand">
          <div class="tross-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </div>
          <div class="tross-brand-text">
            Tross <span class="tross-brand-sub">Engine</span>
            <span class="tross-badge-pill">v1.0 Pro</span>
          </div>
        </a>

        <div class="tross-nav-actions">
          <a href="/" class="tross-nav-btn tross-nav-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Interactive Playground</span>
          </a>
          <a href="https://github.com/ParitoshSrivastava31/tross" target="_blank" class="tross-nav-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <div class="tross-status-box">
            <span class="tross-status-dot"></span>
            <span>System Active</span>
          </div>
        </div>
      </div>
    \`;

    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCustomNavbar);
  } else {
    injectCustomNavbar();
  }
})();
`;
