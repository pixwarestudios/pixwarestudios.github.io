/**
 * Pixware Studios Admin Panel
 * Varsayilan sifre: pixware2026 (config.js icinde degistirin)
 */
const ADMIN_SESSION = 'pixware_admin_session';
const ADMIN_USER = 'pixware_admin_user';
const ADMIN_GH_SETTINGS = 'pixware_github_settings';
const ADMINS_STORAGE = 'pixware_admins_list';
const DATA_FILES = {
  games: 'data/games.json',
  posts: 'data/posts.json',
  jobs: 'data/jobs.json',
  team: 'data/team.json',
  site: 'data/site.json',
  launcher: 'data/launcher.json'
};

let adminState = {
  games: [],
  posts: [],
  jobs: [],
  team: [],
  site: {},
  launcher: {}
};

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION) === '1';
}

function getLoggedInUser() {
  return sessionStorage.getItem(ADMIN_USER);
}

function loadAdmins() {
  const stored = localStorage.getItem(ADMINS_STORAGE);
  return stored ? JSON.parse(stored) : PIXWARE_CONFIG.admins;
}

function saveAdmins(admins) {
  localStorage.setItem(ADMINS_STORAGE, JSON.stringify(admins));
}

function isFounder(adminId) {
  return adminId === 'founder';
}

function canManageAdmins(adminId) {
  return isFounder(adminId);
}

function showToast(msg, isError) {
  const old = document.querySelector('.admin-toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.style.borderColor = isError ? '#ff6b6b' : 'var(--neon-accent)';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

async function tryLogin(password, asFounder = false) {
  const hash = await hashPassword(password);
  let adminId = null;
  let role = null;

  if (asFounder) {
    if (hash === PIXWARE_CONFIG.founderPasswordHash) {
      adminId = 'founder';
      role = 'founder';
    }
  } else {
    // Normal admin kontrolü
    if (hash === PIXWARE_CONFIG.adminPasswordHash) {
      adminId = 'admin1';
      role = 'admin';
    } else {
      // Ek adminleri kontrol et
      const admins = loadAdmins();
      const found = admins.find(a => a.passwordHash === hash);
      if (found) {
        adminId = found.id;
        role = found.role;
      }
    }
  }

  if (adminId) {
    sessionStorage.setItem(ADMIN_SESSION, '1');
    sessionStorage.setItem(ADMIN_USER, adminId);
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(ADMIN_SESSION);
  sessionStorage.removeItem(ADMIN_USER);
  location.reload();
}

async function loadJson(path) {
  const res = await fetch(path + '?t=' + Date.now());
  if (!res.ok) throw new Error('Yuklenemedi: ' + path);
  return res.json();
}

async function loadAllData() {
  const [games, posts, jobs, team, site, launcher] = await Promise.all([
    loadJson('data/games.json'),
    loadJson('data/posts.json'),
    loadJson('data/jobs.json'),
    loadJson('data/team.json'),
    loadJson('data/site.json'),
    loadJson('data/launcher.json')
  ]);
  adminState = { games, posts, jobs, team, site, launcher };
}

function showPanel(id) {
  document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-btn').forEach((b) => b.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  const btn = document.querySelector('[data-panel="' + id + '"]');
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

function renderDashboard() {
  const el = document.getElementById('panel-dashboard');
  if (!el) return;
  el.innerHTML = `
    <h2 class="section-title">Dashboard</h2>
    <p class="admin-hint">Icerikleri duzenleyin, JSON disa aktarin veya GitHub'a gonderin. Yayin sonrasi site 1-2 dakika icinde guncellenir.</p>
    <div class="grid grid-3">
      <div class="admin-card"><h3>Oyunlar</h3><p>${adminState.games.length} kayit</p></div>
      <div class="admin-card"><h3>Haberler</h3><p>${adminState.posts.length} kayit</p></div>
      <div class="admin-card"><h3>Is ilanlari</h3><p>${adminState.jobs.length} kayit</p></div>
      <div class="admin-card"><h3>Ekip</h3><p>${adminState.team.length} kisi</p></div>
    </div>
    <p style="margin-top:1.5rem;"><a href="index.html" class="btn btn-accent" target="_blank">Siteyi onizle</a></p>
  `;
}

function listActions(key, index, onEdit, onDelete) {
  return `<div class="admin-actions">
    <button type="button" class="btn btn-sm" data-edit="${key}" data-index="${index}">Duzenle</button>
    <button type="button" class="btn btn-sm btn-danger" data-delete="${key}" data-index="${index}">Sil</button>
  </div>`;
}

function bindListActions(container, key) {
  container.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditor(key, parseInt(btn.dataset.index, 10)));
  });
  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Silmek istediginize emin misiniz?')) return;
      adminState[key].splice(parseInt(btn.dataset.index, 10), 1);
      renderAllPanels();
      showToast('Silindi. GitHub\'a gondermeyi unutmayin.');
    });
  });
}

function renderGamesList() {
  const el = document.getElementById('panel-games');
  if (!el) return;
  const items = adminState.games.map((g, i) => `
    <div class="admin-list-item">
      <span>${esc(g.emoji || '')} <strong>${esc(g.name)}</strong> — ${esc(g.category)}</span>
      ${listActions('games', i)}
    </div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Oyunlar</h2>
    <button type="button" class="btn btn-primary" id="add-game">+ Oyun Ekle</button>
    <div class="admin-card" style="margin-top:1rem;">${items || '<p style="color:var(--text-secondary)">Henuz oyun yok.</p>'}</div>
  `;
  document.getElementById('add-game')?.addEventListener('click', () => openEditor('games', -1));
  bindListActions(el, 'games');
}

function renderPostsList() {
  const el = document.getElementById('panel-posts');
  if (!el) return;
  const items = adminState.posts.map((p, i) => `
    <div class="admin-list-item">
      <span><strong>${esc(p.title)}</strong><br><small style="color:var(--text-secondary)">${esc(p.date)}</small></span>
      ${listActions('posts', i)}
    </div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Haberler</h2>
    <button type="button" class="btn btn-primary" id="add-post">+ Haber Ekle</button>
    <div class="admin-card" style="margin-top:1rem;">${items || '<p>Henuz haber yok.</p>'}</div>
  `;
  document.getElementById('add-post')?.addEventListener('click', () => openEditor('posts', -1));
  bindListActions(el, 'posts');
}

function renderJobsList() {
  const el = document.getElementById('panel-jobs');
  if (!el) return;
  const items = adminState.jobs.map((j, i) => `
    <div class="admin-list-item">
      <span><strong>${esc(j.title)}</strong> — ${esc(j.type)}</span>
      ${listActions('jobs', i)}
    </div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Kariyer / Is ilanlari</h2>
    <button type="button" class="btn btn-primary" id="add-job">+ Ilan Ekle</button>
    <div class="admin-card" style="margin-top:1rem;">${items || '<p>Henuz ilan yok.</p>'}</div>
  `;
  document.getElementById('add-job')?.addEventListener('click', () => openEditor('jobs', -1));
  bindListActions(el, 'jobs');
}

function renderTeamList() {
  const el = document.getElementById('panel-team');
  if (!el) return;
  const items = adminState.team.map((m, i) => `
    <div class="admin-list-item">
      <span>${esc(m.avatar)} <strong>${esc(m.name)}</strong> — ${esc(m.role)}</span>
      ${listActions('team', i)}
    </div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Ekip</h2>
    <button type="button" class="btn btn-primary" id="add-member">+ Uye Ekle</button>
    <div class="admin-card" style="margin-top:1rem;">${items || '<p>Henuz ekip uyesi yok.</p>'}</div>
  `;
  document.getElementById('add-member')?.addEventListener('click', () => openEditor('team', -1));
  bindListActions(el, 'team');
}

function renderAdminsPanel() {
  const el = document.getElementById('panel-admins');
  if (!el) return;
  const user = getLoggedInUser();
  if (!canManageAdmins(user)) {
    el.innerHTML = '<p style="color: var(--text-secondary);">Bu panele erismek icin kurucu olanmaniz gerekir.</p>';
    return;
  }
  const admins = loadAdmins();
  const items = admins.map((a, i) => `
    <div class="admin-list-item">
      <span><strong>${esc(a.name)}</strong> — ${esc(a.role)} ${a.id === 'founder' ? '(Kurucu)' : ''}</span>
      <span style="color:var(--text-secondary);font-size:0.85rem;">${esc(a.createdAt)}</span>
      ${a.id !== 'founder' ? `<div class="admin-actions"><button type="button" class="btn btn-sm btn-danger" data-remove-admin="${esc(a.id)}">Sil</button></div>` : ''}
    </div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Admin Yonetimi</h2>
    <p class="admin-hint">Kurucu olarak yeni adminler ekleyip sil sileyebilirsiniz.</p>
    <button type="button" class="btn btn-primary" id="add-admin">+ Admin Ekle</button>
    <div class="admin-card" style="margin-top:1rem;">${items || '<p>Henuz kurucu baska admin eklememis.</p>'}</div>
  `;
  document.getElementById('add-admin')?.addEventListener('click', () => openAddAdminModal());
  el.querySelectorAll('[data-remove-admin]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Bu admini silmek istediginize emin misiniz?')) return;
      const adminId = btn.dataset.removeAdmin;
      const updated = admins.filter(a => a.id !== adminId);
      saveAdmins(updated);
      renderAdminsPanel();
      showToast('Admin silindi.');
    });
  });
}

function openAddAdminModal() {
  const modal = document.getElementById('admin-modal');
  const body = document.getElementById('admin-modal-body');
  body.innerHTML = `
    <h3>Yeni Admin Ekle</h3>
    <div class="admin-form-grid">
      <div class="form-group"><label>Admin Adi</label><input id="new-admin-name" placeholder="Ornek: Ali Yilmaz"></div>
      <div class="form-group"><label>Sifre</label><input id="new-admin-pass" type="password" placeholder="Guclu bir sifre belirleyin"></div>
      <div class="form-group"><label>Sifre Onayi</label><input id="new-admin-pass-confirm" type="password"></div>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;">
      <button type="button" class="btn btn-primary" id="save-new-admin">Ekle</button>
      <button type="button" class="btn" id="cancel-admin">Iptal</button>
    </div>
  `;
  modal.classList.add('open');
  document.getElementById('cancel-admin').onclick = () => modal.classList.remove('open');
  document.getElementById('save-new-admin').onclick = async () => {
    const name = document.getElementById('new-admin-name').value.trim();
    const pass = document.getElementById('new-admin-pass').value;
    const passConfirm = document.getElementById('new-admin-pass-confirm').value;
    if (!name) {
      showToast('Ad gerekli', true);
      return;
    }
    if (!pass || pass.length < 6) {
      showToast('Sifre en az 6 karakter olmali', true);
      return;
    }
    if (pass !== passConfirm) {
      showToast('Sifreler eslesmiyor', true);
      return;
    }
    const hash = await hashPassword(pass);
    const admins = loadAdmins();
    const newAdmin = {
      id: 'admin-' + Date.now(),
      name,
      role: 'admin',
      passwordHash: hash,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    admins.push(newAdmin);
    saveAdmins(admins);
    modal.classList.remove('open');
    renderAdminsPanel();
    showToast('Yeni admin eklendi: ' + name);
  };
}

function renderSitePanel() {
  const el = document.getElementById('panel-site');
  if (!el) return;
  const s = adminState.site;
  const vision = (s.studio?.vision || []).join('\n\n');
  el.innerHTML = `
    <h2 class="section-title">Site ayarlari</h2>
    <form id="site-form" class="admin-form-grid">
      <div class="form-group"><label>Stüdyo adi</label><input name="studioName" value="${esc(s.studio?.name || '')}"></div>
      <div class="form-group"><label>Slogan</label><input name="tagline" value="${esc(s.studio?.tagline || '')}"></div>
      <div class="form-group"><label>Kurulus yili</label><input name="founded" value="${esc(s.studio?.founded || '')}"></div>
      <div class="form-group"><label>E-posta</label><input name="email" value="${esc(s.contact?.email || '')}"></div>
      <div class="form-group"><label>Hero alt baslik</label><textarea name="heroSubtitle" rows="3">${esc(s.hero?.subtitle || '')}</textarea></div>
      <div class="form-group"><label>Vizyon (paragraflar, bos satirla ayirin)</label><textarea name="vision" rows="6">${esc(vision)}</textarea></div>
      <div class="form-group"><label>GitHub URL</label><input name="github" value="${esc(s.social?.github || '')}"></div>
      <div class="form-group"><label>Discord URL</label><input name="discord" value="${esc(s.social?.discord || '')}"></div>
      <div class="form-group"><label>Twitter URL</label><input name="twitter" value="${esc(s.social?.twitter || '')}"></div>
      <button type="submit" class="btn btn-primary">Kaydet</button>
    </form>
  `;
  document.getElementById('site-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const visionText = f.vision.value.trim();
    adminState.site = {
      studio: {
        name: f.studioName.value.trim(),
        tagline: f.tagline.value.trim(),
        founded: f.founded.value.trim(),
        vision: visionText ? visionText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : []
      },
      hero: {
        title: 'Pixware Studios',
        subtitle: f.heroSubtitle.value.trim()
      },
      social: {
        github: f.github.value.trim(),
        discord: f.discord.value.trim(),
        twitter: f.twitter.value.trim(),
        youtube: adminState.site.social?.youtube || ''
      },
      contact: { email: f.email.value.trim() }
    };
    showToast('Site ayarlari kaydedildi (yerel). GitHub\'a gonderin.');
  });
}

function renderGithubPanel() {
  const el = document.getElementById('panel-github');
  if (!el) return;
  const saved = JSON.parse(localStorage.getItem(ADMIN_GH_SETTINGS) || '{}');
  el.innerHTML = `
    <h2 class="section-title">GitHub Yayin</h2>
    <p class="admin-hint">Personal Access Token (repo izni) olusturun: GitHub → Settings → Developer settings → Tokens. Token tarayicida saklanir, sunucuya gitmez.</p>
    <form id="gh-form" class="admin-form-grid">
      <div class="form-group"><label>Repo sahibi (kullanici veya org)</label><input name="owner" value="${esc(saved.owner || '')}" placeholder="ornek: enesdev"></div>
      <div class="form-group"><label>Repo adi</label><input name="repo" value="${esc(saved.repo || '')}" placeholder="pixware-website"></div>
      <div class="form-group"><label>Dal</label><input name="branch" value="${esc(saved.branch || 'master')}"></div>
      <div class="form-group"><label>GitHub Token</label><input name="token" type="password" value="${esc(saved.token || '')}" autocomplete="off"></div>
      <button type="submit" class="btn btn-primary">Tum icerigi GitHub'a gonder</button>
      <button type="button" class="btn" id="export-all">JSON dosyalarini indir</button>
    </form>
    <p style="margin-top:1rem;color:var(--text-secondary);font-size:0.85rem;">GitHub Pages: Repo → Settings → Pages → Source: GitHub Actions</p>
  `;
  document.getElementById('gh-form').addEventListener('submit', publishToGithub);
  document.getElementById('export-all').addEventListener('click', exportAllJson);
}

function openEditor(key, index) {
  const modal = document.getElementById('admin-modal');
  const body = document.getElementById('admin-modal-body');
  const isNew = index < 0;
  const item = isNew ? {} : { ...adminState[key][index] };

  let html = '';
  if (key === 'games') {
    html = gameEditorForm(item);
  } else if (key === 'posts') {
    html = postEditorForm(item);
  } else if (key === 'jobs') {
    html = jobEditorForm(item);
  } else if (key === 'team') {
    html = teamEditorForm(item);
  }

  body.innerHTML = html + '<div style="margin-top:1rem;display:flex;gap:0.5rem;"><button type="button" class="btn btn-primary" id="save-editor">Kaydet</button><button type="button" class="btn" id="cancel-editor">Iptal</button></div>';
  modal.classList.add('open');

  document.getElementById('cancel-editor').onclick = () => modal.classList.remove('open');
  document.getElementById('save-editor').onclick = () => {
    const saved = collectEditor(key, item, isNew);
    if (!saved) return;
    if (isNew) adminState[key].push(saved);
    else adminState[key][index] = saved;
    modal.classList.remove('open');
    renderAllPanels();
    showToast('Kaydedildi.');
  };
}

function gameEditorForm(g) {
  return `<h3>Oyun</h3>
    <div class="admin-form-grid">
      <div class="form-group"><label>Ad</label><input id="e-name" value="${esc(g.name)}"></div>
      <div class="form-group"><label>Slug</label><input id="e-slug" value="${esc(g.slug)}"></div>
      <div class="form-group"><label>Kategori</label><input id="e-category" value="${esc(g.category)}"></div>
      <div class="form-group"><label>Emoji</label><input id="e-emoji" value="${esc(g.emoji)}"></div>
      <div class="form-group"><label>Rating</label><input id="e-rating" type="number" step="0.1" value="${g.rating ?? 4.5}"></div>
      <div class="form-group"><label>Boyut</label><input id="e-size" value="${esc(g.size)}"></div>
      <div class="form-group"><label><input type="checkbox" id="e-featured" ${g.featured ? 'checked' : ''}> One cikan</label></div>
      <div class="form-group"><label>Aciklama</label><textarea id="e-desc" rows="4">${esc(g.description)}</textarea></div>
    </div>`;
}

function collectEditor(key, old, isNew) {
  if (key === 'games') {
    const name = document.getElementById('e-name').value.trim();
    if (!name) { showToast('Ad gerekli', true); return null; }
    const slug = document.getElementById('e-slug').value.trim() || name.toLowerCase().replace(/\s+/g, '-');
    const maxId = adminState.games.reduce((m, g) => Math.max(m, g.id || 0), 0);
    return {
      id: old.id ?? maxId + 1,
      slug,
      name,
      category: document.getElementById('e-category').value.trim(),
      emoji: document.getElementById('e-emoji').value.trim() || '🎮',
      rating: parseFloat(document.getElementById('e-rating').value) || 4.5,
      size: document.getElementById('e-size').value.trim(),
      featured: document.getElementById('e-featured').checked,
      description: document.getElementById('e-desc').value.trim()
    };
  }
  if (key === 'posts') {
    const title = document.getElementById('e-title').value.trim();
    if (!title) { showToast('Baslik gerekli', true); return null; }
    const slug = document.getElementById('e-slug').value.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return {
      slug,
      title,
      date: document.getElementById('e-date').value || new Date().toISOString().slice(0, 10),
      excerpt: document.getElementById('e-excerpt').value.trim(),
      body: document.getElementById('e-body').value.trim()
    };
  }
  if (key === 'jobs') {
    const title = document.getElementById('e-title').value.trim();
    if (!title) return null;
    const reqs = document.getElementById('e-reqs').value.split('\n').map((r) => r.trim()).filter(Boolean);
    return {
      id: old.id || 'job-' + Date.now(),
      title,
      type: document.getElementById('e-type').value.trim(),
      location: document.getElementById('e-location').value.trim(),
      description: document.getElementById('e-desc').value.trim(),
      requirements: reqs
    };
  }
  if (key === 'team') {
    const name = document.getElementById('e-name').value.trim();
    if (!name) return null;
    return {
      id: old.id || 'member-' + Date.now(),
      name,
      role: document.getElementById('e-role').value.trim(),
      bio: document.getElementById('e-bio').value.trim(),
      avatar: document.getElementById('e-avatar').value.trim() || '👤',
      order: parseInt(document.getElementById('e-order').value, 10) || 1,
      social: {
        github: document.getElementById('e-github').value.trim(),
        twitter: document.getElementById('e-twitter').value.trim(),
        linkedin: document.getElementById('e-linkedin').value.trim()
      }
    };
  }
  return null;
}

function postEditorForm(p) {
  return `<h3>Haber</h3><div class="admin-form-grid">
    <div class="form-group"><label>Baslik</label><input id="e-title" value="${esc(p.title)}"></div>
    <div class="form-group"><label>Slug</label><input id="e-slug" value="${esc(p.slug)}"></div>
    <div class="form-group"><label>Tarih</label><input id="e-date" type="date" value="${esc(p.date)}"></div>
    <div class="form-group"><label>Ozet</label><textarea id="e-excerpt" rows="2">${esc(p.excerpt)}</textarea></div>
    <div class="form-group"><label>Icerik (HTML)</label><textarea id="e-body" rows="8">${esc(p.body)}</textarea></div>
  </div>`;
}

function jobEditorForm(j) {
  return `<h3>Is ilani</h3><div class="admin-form-grid">
    <div class="form-group"><label>Pozisyon</label><input id="e-title" value="${esc(j.title)}"></div>
    <div class="form-group"><label>Tip</label><input id="e-type" value="${esc(j.type)}" placeholder="Tam zamanli / Staj"></div>
    <div class="form-group"><label>Konum</label><input id="e-location" value="${esc(j.location)}"></div>
    <div class="form-group"><label>Aciklama</label><textarea id="e-desc" rows="3">${esc(j.description)}</textarea></div>
    <div class="form-group"><label>Gereksinimler (her satir bir madde)</label><textarea id="e-reqs" rows="5">${esc((j.requirements || []).join('\n'))}</textarea></div>
  </div>`;
}

function teamEditorForm(m) {
  return `<h3>Ekip uyesi</h3><div class="admin-form-grid">
    <div class="form-group"><label>Ad</label><input id="e-name" value="${esc(m.name)}"></div>
    <div class="form-group"><label>Rol</label><input id="e-role" value="${esc(m.role)}"></div>
    <div class="form-group"><label>Avatar (emoji)</label><input id="e-avatar" value="${esc(m.avatar)}"></div>
    <div class="form-group"><label>Sira</label><input id="e-order" type="number" value="${m.order ?? 1}"></div>
    <div class="form-group"><label>Biyografi</label><textarea id="e-bio" rows="4">${esc(m.bio)}</textarea></div>
    <div class="form-group"><label>GitHub</label><input id="e-github" value="${esc(m.social?.github)}"></div>
    <div class="form-group"><label>Twitter</label><input id="e-twitter" value="${esc(m.social?.twitter)}"></div>
    <div class="form-group"><label>LinkedIn</label><input id="e-linkedin" value="${esc(m.social?.linkedin)}"></div>
  </div>`;
}

function renderAllPanels() {
  renderDashboard();
  renderGamesList();
  renderPostsList();
  renderJobsList();
  renderTeamList();
  renderSitePanel();
  renderAdminsPanel();
  renderGithubPanel();
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportAllJson() {
  downloadJson('games.json', adminState.games);
  downloadJson('posts.json', adminState.posts);
  downloadJson('jobs.json', adminState.jobs);
  downloadJson('team.json', adminState.team);
  downloadJson('site.json', adminState.site);
  downloadJson('launcher.json', adminState.launcher);
  showToast('6 JSON dosyasi indirildi. data/ klasorune kopyalayip commit edebilirsiniz.');
}

async function githubGetFile(owner, repo, path, token) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function githubPutFile(owner, repo, branch, path, content, message, token, sha) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function publishToGithub(e) {
  e.preventDefault();
  const f = e.target;
  const owner = f.owner.value.trim();
  const repo = f.repo.value.trim();
  const branch = f.branch.value.trim() || 'master';
  const token = f.token.value.trim();
  if (!owner || !repo || !token) {
    showToast('Owner, repo ve token gerekli', true);
    return;
  }
  localStorage.setItem(ADMIN_GH_SETTINGS, JSON.stringify({ owner, repo, branch, token }));

  const payloads = {
    'data/games.json': adminState.games,
    'data/posts.json': adminState.posts,
    'data/jobs.json': adminState.jobs,
    'data/team.json': adminState.team,
    'data/site.json': adminState.site,
    'data/launcher.json': adminState.launcher
  };

  try {
    showToast('GitHub\'a gonderiliyor...');
    for (const [path, data] of Object.entries(payloads)) {
      const content = JSON.stringify(data, null, 2) + '\n';
      const existing = await githubGetFile(owner, repo, path, token);
      await githubPutFile(owner, repo, branch, path, content, 'Pixware Admin: ' + path, token, existing?.sha);
    }
    showToast('Basariyla yayinlandi! GitHub Pages 1-2 dk icinde guncellenir.');
  } catch (err) {
    console.error(err);
    showToast('Hata: ' + (err.message || 'Yayin basarisiz'), true);
  }
}

function initAdminApp() {
  const loginEl = document.getElementById('admin-login');
  const appEl = document.getElementById('admin-app');
  loginEl.classList.remove('admin-login-visible');
  appEl.hidden = false;
  document.querySelectorAll('.admin-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => showPanel(btn.dataset.panel));
  });
  document.getElementById('admin-logout')?.addEventListener('click', logout);
  renderAllPanels();
  showPanel('dashboard');
}

async function init() {
  const loginForm = document.getElementById('login-form');
  const founderToggle = document.getElementById('founder-toggle');
  let isFounderMode = false;
  
  if (founderToggle) {
    founderToggle.addEventListener('click', () => {
      isFounderMode = !isFounderMode;
      founderToggle.textContent = isFounderMode ? 'Normal Girise Geri Don' : 'Kurucu Girisini Ac';
      document.getElementById('admin-password').focus();
    });
  }
  
  if (isLoggedIn()) {
    try {
      await loadAllData();
      initAdminApp();
    } catch (e) {
      showToast('Veri yuklenemedi. Yerel sunucu kullanin.', true);
    }
    return;
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('admin-password').value;
    const err = document.getElementById('login-error');
    if (await tryLogin(pw, isFounderMode)) {
      err.textContent = '';
      await loadAllData();
      initAdminApp();
    } else {
      err.textContent = isFounderMode ? 'Yanlis kurucu sifresi' : 'Yanlis sifre';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
