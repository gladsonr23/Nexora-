const icons = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  vault: '<path d="M3 6h6l2 2h10v11H3z"/>',
  schedule: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h3m3 0h3"/>',
  summarizer: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2m-8-5 4 3-4 3z"/>',
  flashloop: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8m-8 4h5M3 6v12m18-12v12"/>',
  quiz: '<path d="M5 3h14v18H5zM8 8h5m-5 5 2 2 4-4m2 4h1"/>',
  assistant: '<path d="M4 4h16v12H9l-5 4z"/><path d="M8 9h8m-8 3h5"/>',
  focus: '<circle cx="12" cy="13" r="8"/><path d="M12 13V8m0 5 3 2M9 2h6m4 3 2-2"/>',
  analytics: '<path d="M3 20h18M6 17v-5m6 5V7m6 10V4"/>',
  pattern: '<path d="M3 20h18M6 16l5-5 4 3 5-7"/><circle cx="6" cy="16" r="1"/><circle cx="11" cy="11" r="1"/><circle cx="15" cy="14" r="1"/><circle cx="20" cy="7" r="1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 15.8A8 8 0 0 1 8.2 4 8 8 0 1 0 20 15.8z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4"/>',
  upload: '<path d="M12 16V3m-4 4 4-4 4 4M4 16v5h16v-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  pause: '<path d="M7 4v16m10-16v16"/>'
};
const icon = (name, className = '') => `<svg class="nx-icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const modules = [
  {id:'vault',name:'Vault',group:'Study workspace',short:'Course files in one place',detail:'Store PDFs, syllabi, assignment sheets, lecture slides, and generated study notes.'},
  {id:'schedule',name:'SyllabusToSchedule',group:'Study workspace',short:'A plan from your syllabus',detail:'Turn course documents and exam dates into a practical daily study schedule.'},
  {id:'summarizer',name:'One-Shot Summarizer',group:'Study workspace',short:'Lectures become study notes',detail:'Turn long YouTube lectures into timestamped notes you can export and save in Vault.'},
  {id:'flashloop',name:'FlashLoop',group:'Study workspace',short:'Recall at the right time',detail:'Practice generated flashcards using SM-2 spaced repetition.'},
  {id:'quiz',name:'NoteToQuiz',group:'Study workspace',short:'Practice from your notes',detail:'Generate MCQs, short answers, and term checks from uploaded notes.'},
  {id:'assistant',name:'AI Study Assistant',group:'Focus & insights',short:'Answers with sources',detail:'Ask questions grounded in uploaded files, with file and page citations.'},
  {id:'focus',name:'Focus Mode',group:'Focus & insights',short:'Study without switching',detail:'Use Pomodoro sessions connected to planned tasks and daily goals.'},
  {id:'analytics',name:'Progress Analytics',group:'Focus & insights',short:'See what needs work',detail:'Track topic mastery, study streaks, and weak areas.'},
  {id:'pattern',name:'Prof Pattern Detector',group:'Focus & insights',short:'Read the exam pattern',detail:'Analyze past-year question repetition, topic frequency, weightage, and revision priority.'}
];
const navLink = (item) => `<a class="nx-nav-link" href="#${item.id}" data-page="${item.id}">${icon(item.id)}<span>${item.name}</span></a>`;
const toolRow = (item) => `<a class="nx-tool-row" href="#${item.id}">${icon(item.id)}<span><strong>${item.name}</strong><small>${item.short}</small></span><span class="nx-row-arrow" aria-hidden="true">↗</span></a>`;
const bookLogo = `<svg class="nx-book" viewBox="0 0 210 174" aria-hidden="true">
  <path class="nx-book-left" d="M20 30 C47 25 70 39 101 65 L101 151 C73 132 47 123 20 127 Z"/>
  <path class="nx-book-right" d="M190 30 C163 25 140 39 109 65 L109 151 C137 132 163 123 190 127 Z"/>
  <path class="nx-book-base" d="M8 52 L17 50 L17 139 C50 131 78 142 105 162 C132 142 160 131 193 139 L193 50 L202 52 L202 153 C165 142 134 150 105 170 C76 150 45 142 8 153 Z"/>
  <path class="nx-book-shade" d="M47 41 L47 115 C63 117 78 125 92 136 L92 75 C76 58 62 47 47 41 Z"/>
  <g class="nx-flip-page"><path class="nx-book-page" d="M4 53 C24 30 47 17 89 8 L89 81 C52 88 27 101 4 116 Z" transform="translate(101 0)"/></g>
</svg>`;
document.body.innerHTML = `
  <a class="nx-skip-link" href="#nx-main">Skip to main content</a>
  <div class="nx-shell">
    <aside class="nx-sidebar" id="nx-sidebar" aria-label="Main navigation">
      <div class="nx-sidebar-top"><a class="nx-brand" href="#overview" aria-label="Nexora overview">${bookLogo}<span translate="no">Nexora</span></a><button class="nx-icon-button nx-close-nav" id="nx-close-nav" type="button" aria-label="Close navigation">${icon('close')}</button></div>
      <div class="nx-sidebar-scroll"><nav aria-label="Nexora pages">
        <div class="nx-nav-group"><p class="nx-nav-label">Workspace</p><a class="nx-nav-link" href="#overview" data-page="overview">${icon('overview')}<span>Overview</span></a></div>
        <div class="nx-nav-group"><p class="nx-nav-label">Study workspace</p>${modules.filter(m=>m.group==='Study workspace').map(navLink).join('')}</div>
        <div class="nx-nav-group"><p class="nx-nav-label">Focus & insights</p>${modules.filter(m=>m.group==='Focus & insights').map(navLink).join('')}</div>
      </nav></div>
      <div class="nx-sidebar-bottom"><a class="nx-nav-link" href="#settings" data-page="settings">${icon('settings')}<span>Settings</span></a><button class="nx-theme-control" id="nx-theme-control" type="button" aria-label="Dark mode"><span class="nx-theme-copy"><strong>Appearance</strong><small id="nx-theme-label">Light mode</small></span><span class="nx-theme-art" aria-hidden="true"><img class="nx-theme-day" src="./assets/theme-light.png" alt="" width="375" height="130"><img class="nx-theme-night" src="./assets/theme-dark.png" alt="" width="375" height="130"></span></button><div class="nx-profile"><span class="nx-avatar" id="nx-avatar" aria-hidden="true">?</span><span><strong id="nx-profile-name">Student</strong><small>Student workspace</small></span></div></div>
    </aside>
    <div class="nx-scrim" id="nx-scrim" hidden></div>
    <div class="nx-main-column">
      <header class="nx-topbar"><div class="nx-topbar-start"><button class="nx-icon-button nx-menu" id="nx-menu" type="button" aria-label="Open navigation" aria-controls="nx-sidebar" aria-expanded="false">${icon('menu')}</button><a class="nx-compact-brand" href="#overview" aria-label="Nexora overview">${bookLogo}</a><span class="nx-breadcrumb">Workspace <span>/</span> <strong id="nx-breadcrumb-page">Overview</strong></span></div><div class="nx-topbar-actions"><button class="nx-icon-button" id="nx-notifications" type="button" aria-label="Notifications">${icon('bell')}</button><button class="nx-primary-button" id="nx-upload" type="button">${icon('upload')}<span>Upload material</span></button></div></header>
      <main id="nx-main" tabindex="-1">
        <section id="nx-overview" class="nx-overview" aria-labelledby="nx-page-title">
          <div class="nx-intro"><div><p class="nx-eyebrow" id="nx-date"></p><h1 id="nx-page-title">Your study desk.</h1><p>Pick up where you left off and make time for what matters today.</p></div><span class="nx-sample-badge">Sample workspace</span></div>
          <div class="nx-priority-grid">
            <section class="nx-plan" aria-labelledby="nx-plan-title"><div class="nx-section-head"><div><p class="nx-kicker">Plan for today</p><h2 id="nx-plan-title">Three things to move forward</h2></div><a class="nx-text-link" href="#schedule">Open planner ${icon('arrow')}</a></div>
              <div class="nx-plan-list">
                <label class="nx-plan-row"><input type="checkbox" name="review-patterns" data-task="0"><span class="nx-checkbox">${icon('check')}</span><span class="nx-plan-copy"><strong>Review design patterns notes</strong><small>Advanced Programming Practices · 45 min</small></span><span class="nx-plan-time">4:30 PM</span></label>
                <label class="nx-plan-row"><input type="checkbox" name="practice-unit-three" data-task="1"><span class="nx-checkbox">${icon('check')}</span><span class="nx-plan-copy"><strong>Practice Unit 3 questions</strong><small>Advanced Programming Practices · 30 min</small></span><span class="nx-plan-time">6:00 PM</span></label>
                <label class="nx-plan-row"><input type="checkbox" name="revise-flashcards" data-task="2"><span class="nx-checkbox">${icon('check')}</span><span class="nx-plan-copy"><strong>Revise 18 flashcards</strong><small>FlashLoop · 20 min</small></span><span class="nx-plan-time">8:00 PM</span></label>
              </div><div class="nx-plan-foot"><span id="nx-task-progress" aria-live="polite">0 of 3 completed</span><span>Exam preparation · this week</span></div>
            </section>
            <section class="nx-focus-panel" aria-labelledby="nx-focus-title"><p class="nx-kicker">Focus mode</p><h2 id="nx-focus-title">A clear 25 minutes.</h2><p>Work through your next study task without switching context.</p><output class="nx-clock" id="nx-clock">25:00</output><div class="nx-focus-actions"><button class="nx-focus-start" id="nx-focus-start" type="button">${icon('play')}<span>Start session</span></button><button class="nx-focus-reset" id="nx-focus-reset" type="button" hidden>Reset</button></div><div class="nx-focus-linked"><span>Linked task</span><strong>Review design patterns notes</strong></div></section>
          </div>
          <section class="nx-metrics" aria-label="Sample study snapshot"><div><span>Focus time</span><strong>2h 40m</strong><small>This week · sample</small></div><div><span>Tasks due</span><strong id="nx-metric-tasks">3</strong><small>Today · sample</small></div><div><span>Cards to revise</span><strong>18</strong><small>FlashLoop · sample</small></div><div><span>Materials saved</span><strong>24</strong><small>Vault · sample</small></div><div><span>Study streak</span><strong>12 days</strong><small>Sample activity</small></div></section>
          <section class="nx-tools" aria-labelledby="nx-tools-title"><div class="nx-section-head"><div><p class="nx-kicker">Explore Nexora</p><h2 id="nx-tools-title">Your learning tools</h2></div><p class="nx-section-note">Nine tools, one study workflow.</p></div><div class="nx-tool-groups">
            <div class="nx-tool-group"><div class="nx-group-heading"><span>01</span><h3>Organize & plan</h3></div>${modules.slice(0,3).map(toolRow).join('')}</div>
            <div class="nx-tool-group"><div class="nx-group-heading"><span>02</span><h3>Learn & practice</h3></div>${modules.slice(3,6).map(toolRow).join('')}</div>
            <div class="nx-tool-group"><div class="nx-group-heading"><span>03</span><h3>Focus & improve</h3></div>${modules.slice(6,9).map(toolRow).join('')}</div>
          </div></section>
        </section>
        <section id="nx-module" class="nx-module-view" aria-labelledby="nx-module-title" hidden><p class="nx-eyebrow" id="nx-module-group"></p><div class="nx-module-title-row"><h1 id="nx-module-title"></h1><span class="nx-status-pill">Feature in development</span></div><p class="nx-module-description" id="nx-module-description"></p><div class="nx-module-placeholder"><span class="nx-placeholder-rule"></span><h2>Workspace coming together</h2><p id="nx-module-detail"></p><a class="nx-secondary-button" href="#overview">Back to overview ${icon('arrow')}</a></div></section>
        <section id="nx-settings" class="nx-module-view" aria-labelledby="nx-settings-title" hidden><p class="nx-eyebrow">Workspace preferences</p><h1 id="nx-settings-title">Settings</h1><p class="nx-module-description">Make this study space yours.</p><div class="nx-module-placeholder nx-settings-card"><span class="nx-placeholder-rule"></span><h2>Your profile</h2><p>Your name appears in the greeting and sidebar. It is saved only in this browser.</p><div class="nx-settings-row"><span><small>Display name</small><strong id="nx-settings-name">Student</strong></span><button class="nx-secondary-button" id="nx-edit-name" type="button">Change name</button></div></div></section>
      </main>
    </div>
  </div><dialog class="nx-name-dialog" id="nx-name-dialog" aria-labelledby="nx-name-title" aria-describedby="nx-name-description"><form id="nx-name-form" novalidate><span class="nx-placeholder-rule"></span><p class="nx-kicker">Nexora workspace</p><h2 id="nx-name-title">Welcome to Nexora</h2><p id="nx-name-description">What should we call you? Your name will appear on your dashboard and stay in this browser.</p><label for="nx-name-input">Your name</label><input id="nx-name-input" name="display-name" type="text" autocomplete="name" maxlength="40" aria-describedby="nx-name-error" required><p class="nx-field-error" id="nx-name-error" role="alert" hidden>Please enter your name.</p><div class="nx-dialog-actions"><button class="nx-secondary-button" id="nx-name-cancel" type="button" hidden>Cancel</button><button class="nx-primary-button" id="nx-name-submit" type="submit">Continue to dashboard</button></div></form></dialog><div class="nx-toast" id="nx-toast" role="status" aria-live="polite" hidden></div>`;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const nameDialog = $('#nx-name-dialog');
const nameInput = $('#nx-name-input');
const normalizeName = (value) => value.replace(/\s+/g, ' ').trim();
let displayName = '';
try { displayName = normalizeName(localStorage.getItem('nexora-display-name') || '').slice(0, 40); } catch (_) {}
function renderName() {
  $('#nx-page-title').textContent = displayName ? `Your study desk, ${displayName}.` : 'Your study desk.';
  $('#nx-profile-name').textContent = displayName || 'Student';
  $('#nx-settings-name').textContent = displayName || 'Student';
  $('#nx-avatar').textContent = displayName ? Array.from(displayName)[0].toLocaleUpperCase() : '?';
}
function openNameDialog(edit = false) {
  nameDialog.dataset.mode = edit ? 'edit' : 'welcome';
  $('#nx-name-title').textContent = edit ? 'Change your name' : 'Welcome to Nexora';
  $('#nx-name-description').textContent = edit ? 'Update the name shown in your dashboard and sidebar.' : 'What should we call you? Your name will appear on your dashboard and stay in this browser.';
  $('#nx-name-submit').textContent = edit ? 'Save name' : 'Continue to dashboard';
  $('#nx-name-cancel').hidden = !edit;
  $('#nx-name-error').hidden = true;
  nameInput.removeAttribute('aria-invalid');
  nameInput.value = edit ? displayName : '';
  nameDialog.showModal();
  nameInput.focus();
}
function validateName() {
  const valid = Boolean(normalizeName(nameInput.value));
  $('#nx-name-error').hidden = valid;
  if (valid) nameInput.removeAttribute('aria-invalid'); else nameInput.setAttribute('aria-invalid', 'true');
  return valid;
}
nameInput.addEventListener('blur', () => { if (nameInput.value) validateName(); });
nameInput.addEventListener('input', () => { if (nameInput.getAttribute('aria-invalid') === 'true') validateName(); });
nameDialog.addEventListener('cancel', (event) => { if (!displayName) event.preventDefault(); });
$('#nx-name-cancel').addEventListener('click', () => nameDialog.close());
$('#nx-name-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateName()) { nameInput.focus(); return; }
  displayName = normalizeName(nameInput.value).slice(0, 40);
  let saved = true;
  try { localStorage.setItem('nexora-display-name', displayName); } catch (_) { saved = false; }
  renderName();
  nameDialog.close();
  if (!saved) toast('Browser storage is unavailable. Your name will last for this visit only.');
});
$('#nx-edit-name').addEventListener('click', () => openNameDialog(true));
renderName();
if (!displayName) openNameDialog();
function renderTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#020608' : '#f5fafb';
  $('#nx-theme-control').setAttribute('aria-pressed', String(dark));
  $('#nx-theme-label').textContent = dark ? 'Dark mode' : 'Light mode';
}
$('#nx-theme-control').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  const art = $('.nx-theme-art');
  clearTimeout(art.motionTimer);
  art.classList.remove('nx-to-dark', 'nx-to-light');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    art.classList.add(next === 'dark' ? 'nx-to-dark' : 'nx-to-light');
    art.motionTimer = setTimeout(() => art.classList.remove('nx-to-dark', 'nx-to-light'), 720);
  }
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('nexora-theme', next); } catch (_) {}
  renderTheme();
});
renderTheme();
const dateFormatter = new Intl.DateTimeFormat('en-IN', {weekday:'long', day:'numeric', month:'long'});
$('#nx-date').textContent = dateFormatter.format(new Date());
function closeNav() {
  $('#nx-sidebar').classList.remove('nx-open');
  $('#nx-scrim').hidden = true;
  $('#nx-menu').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nx-drawer-open');
  $('.nx-main-column').inert = false;
}
$('#nx-menu').addEventListener('click', () => {
  $('#nx-sidebar').classList.add('nx-open');
  $('#nx-scrim').hidden = false;
  $('#nx-menu').setAttribute('aria-expanded', 'true');
  document.body.classList.add('nx-drawer-open');
  $('.nx-main-column').inert = true;
  $('#nx-close-nav').focus();
});
$('#nx-close-nav').addEventListener('click', () => { closeNav(); $('#nx-menu').focus(); });
$('#nx-scrim').addEventListener('click', closeNav);
$$('.nx-sidebar .nx-nav-link').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#nx-sidebar').classList.contains('nx-open')) { closeNav(); $('#nx-menu').focus(); } });
function navigate() {
  const id = location.hash.slice(1) || 'overview';
  const module = modules.find(m => m.id === id);
  const title = id === 'overview' ? 'Overview' : module?.name || (id === 'settings' ? 'Settings' : 'Overview');
  const actual = id === 'overview' || module || id === 'settings' ? id : 'overview';
  $('#nx-overview').hidden = actual !== 'overview';
  $('#nx-module').hidden = actual === 'overview' || actual === 'settings';
  $('#nx-settings').hidden = actual !== 'settings';
  $('#nx-breadcrumb-page').textContent = title;
  document.title = `Nexora — ${title}`;
  $$('.nx-nav-link').forEach(link => {
    const selected = link.dataset.page === actual;
    link.classList.toggle('nx-active', selected);
    if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (module) {
    $('#nx-module-group').textContent = module?.group || 'Workspace';
    $('#nx-module-title').textContent = title;
    $('#nx-module-description').textContent = module?.short || 'Choose how Nexora works for you.';
    $('#nx-module-detail').textContent = module?.detail || 'Settings will be available as the team builds the full application.';
  }
  closeNav();
  window.scrollTo({top:0,behavior:'auto'});
}
window.addEventListener('hashchange', () => { navigate(); $('#nx-main').focus({preventScroll:true}); });
navigate();
function toast(message) {
  const el = $('#nx-toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 3600);
}
$('#nx-upload').addEventListener('click', () => { location.hash = '#vault'; toast('Vault upload will be connected when the feature is built.'); });
$('#nx-notifications').addEventListener('click', () => toast('No notifications in this sample workspace.'));
const checks = $$('[data-task]');
let savedTasks = [];
try { savedTasks = JSON.parse(localStorage.getItem('nexora-sample-tasks') || '[]'); } catch (_) {}
checks.forEach((check, index) => { check.checked = Boolean(savedTasks[index]); check.addEventListener('change', () => {
  const state = checks.map(item => item.checked);
  try { localStorage.setItem('nexora-sample-tasks', JSON.stringify(state)); } catch (_) {}
  renderTasks();
}); });
function renderTasks() {
  const completed = checks.filter(item => item.checked).length;
  $('#nx-task-progress').textContent = `${completed} of ${checks.length} completed`;
  $('#nx-metric-tasks').textContent = String(checks.length - completed);
}
renderTasks();
let remaining = 25 * 60, timer = null;
function renderClock() {
  $('#nx-clock').textContent = `${String(Math.floor(remaining / 60)).padStart(2,'0')}:${String(remaining % 60).padStart(2,'0')}`;
}
$('#nx-focus-start').addEventListener('click', () => {
  const button = $('#nx-focus-start');
  if (timer) {
    clearInterval(timer); timer = null;
    button.innerHTML = `${icon('play')}<span>Resume session</span>`;
    toast('Focus session paused.');
  } else {
    button.innerHTML = `${icon('pause')}<span>Pause session</span>`;
    $('#nx-focus-reset').hidden = false;
    timer = setInterval(() => {
      remaining--;
      renderClock();
      if (remaining <= 0) {
        clearInterval(timer); timer = null; remaining = 25 * 60;
        button.innerHTML = `${icon('play')}<span>Start session</span>`;
        renderClock();
        toast('Focus session complete. Nice work.');
      }
    }, 1000);
  }
});
$('#nx-focus-reset').addEventListener('click', () => {
  clearInterval(timer); timer = null; remaining = 25 * 60;
  $('#nx-focus-start').innerHTML = `${icon('play')}<span>Start session</span>`;
  $('#nx-focus-reset').hidden = true; renderClock();
});
renderClock();
