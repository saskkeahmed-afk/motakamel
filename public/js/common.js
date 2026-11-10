/* MOTAKAMEL — shared runtime: i18n, header/footer, media, lightbox, custom video player */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MK = window.MK = { $, $$, esc, content: null, lang: 'en', cleanups: [] };

/* ---------- i18n ---------- */
const LANGS = { en: { short: 'العربية', dir: 'ltr' }, ar: { short: 'EN', dir: 'rtl' } };
const UI = window.MK_UI;
MK.ui = (k) => { const ov = (MK.content && MK.content.ui && MK.content.ui[MK.lang]) || {}, o = ov[k], base = (UI[MK.lang] && UI[MK.lang][k]) ?? UI.en[k] ?? k;
  if (base && typeof base === 'object') { const m = { ...base }; Object.keys(base).forEach(x => { const v = ov[k + '__' + x]; if (typeof v === 'string' && v.trim()) m[x] = v; }); return m; }
  return (typeof o === 'string' && o.trim()) ? o : base; };
MK.t = o => (o && typeof o === 'object') ? (o[MK.lang] || o.en || o.ar || '') : (o ?? '');
MK.initial = () => { const q = new URLSearchParams(location.search).get('lang'); if (LANGS[q]) return q; let s; try { s = localStorage.getItem('mk-lang'); } catch {} if (LANGS[s]) return s; return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en'; };

/* ---------- icons ---------- */
const IC = {
  video: '<rect x="3" y="5" width="13" height="14" rx="3"/><path d="M16 10l5-3v10l-5-3"/>', motion: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.2 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
  social: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>', ads: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>', pen: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1z"/><path d="M14 7l3 3"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', wand: '<path d="M5 19L17 7M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 12l.7 1.3 1.3.7-1.3.7L19 16l-.7-1.3-1.3-.7 1.3-.7z"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-4-4z"/><circle cx="15.5" cy="8.5" r="1.3"/><path d="M9 11H5l2-3h3M13 15v4l3-2v-3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>', whatsapp: '<path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-.8.8c-.8-.4-1.6-1.2-2-2l.8-.8-1-2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>', facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.3 2.5 2 4.2 5 4.5"/>', youtube: '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10.5 9.5l4 2.5-4 2.5z"/>',
  linkedin: '<path d="M6 9v10M6 5v.5M10 19v-6a3 3 0 0 1 6 0v6M10 9v10"/>', behance: '<path d="M3 6h6a3 3 0 0 1 0 6H3zM3 12h7a3 3 0 0 1 0 6H3zM14 15h7a3.5 3.5 0 0 0-7 0zM15 7h5"/>', x: '<path d="M5 4l14 16M19 4L5 20"/>'
};
MK.icon = (n, cls = '') => `<svg viewBox="0 0 24 24" ${cls ? `class="${cls}"` : ''} aria-hidden="true">${IC[n] || IC.star || ''}</svg>`;
MK.socials = (links = {}) => Object.entries(links).filter(([k, v]) => v && IC[k]).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${k}">${MK.icon(k)}</a>`).join('');

/* ---------- media helpers ---------- */
const driveThumb = id => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000`;
MK.parseEmbed = url => {
  try {
    const u = new URL(url), h = u.hostname.replace('www.', '');
    if (h === 'youtu.be') return { provider: 'youtube', id: u.pathname.slice(1) };
    if (h.endsWith('youtube.com')) { const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/); return { provider: 'youtube', id: m ? m[2] : u.searchParams.get('v') }; }
    if (h.endsWith('vimeo.com')) { const m = u.pathname.match(/(\d{5,})/); return { provider: 'vimeo', id: m && m[1] }; }
    if (h === 'drive.google.com') { const m = u.pathname.match(/\/d\/([\w-]{10,})/) || [, u.searchParams.get('id')]; return { provider: 'drive', id: m[1] }; }
  } catch {}
  return null;
};
MK.kind = it => it.driveId || it.type === 'drive' ? 'drive' : (it.embed && it.embed.id) ? 'embed' : (it.type === 'video' || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(it.src || '')) ? 'video' : 'image';
const thumbOf = it => { const k = MK.kind(it); if (k === 'image') return it.src; if (it.poster) return it.poster; if (k === 'drive') return driveThumb(it.driveId); if (k === 'embed' && it.embed.provider === 'youtube') return `https://i.ytimg.com/vi/${it.embed.id}/hqdefault.jpg`; return ''; };
MK.thumb = thumbOf;
const PLAY = '<span class="play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg></span>';
MK.cardMedia = (it, lazy = true) => {
  const k = MK.kind(it), th = thumbOf(it), alt = esc(MK.t(it.title));
  if (k === 'image') return `<img src="${esc(it.src)}" alt="${alt}" ${lazy ? 'loading="lazy"' : ''} draggable="false">`;
  const media = th ? `<div class="ph"></div><img src="${esc(th)}" alt="${alt}" ${lazy ? 'loading="lazy"' : ''} draggable="false" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : (k === 'video' ? `<video src="${esc(it.src)}#t=0.3" muted playsinline preload="metadata"></video>` : '<div class="ph"></div>');
  return media + PLAY;
};

/* ---------- lightbox ---------- */
let lbItems = [], lbI = 0;
MK.openLB = (items, i) => { lbItems = items; lbI = i; $('#lb').hidden = false; document.body.classList.add('lock'); drawLB(); };
function drawLB() {
  const it = lbItems[lbI], box = $('#lbB'); box.innerHTML = ''; const k = MK.kind(it), ori = it.orient === 'h' ? 'h' : 'v';
  if (k === 'drive') box.innerHTML = `<div class="emb ${ori}"><iframe src="https://drive.google.com/file/d/${encodeURIComponent(it.driveId)}/preview" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe></div>`;
  else if (k === 'embed') { const e = it.embed, src = e.provider === 'youtube' ? `https://www.youtube-nocookie.com/embed/${e.id}?autoplay=1&rel=0&playsinline=1` : `https://player.vimeo.com/video/${e.id}?autoplay=1`; box.innerHTML = `<div class="emb ${ori}"><iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`; }
  else if (k === 'video') box.appendChild(createPlayer(it.src, it.poster));
  else box.innerHTML = `<img src="${esc(it.src)}" alt="">`;
  $('#lbC').textContent = MK.t(it.title) || '';
  $('#lbP').style.display = $('#lbN').style.display = lbItems.length < 2 ? 'none' : '';
}
const closeLB = () => { $('#lb').hidden = true; $('#lbB').innerHTML = ''; document.body.classList.remove('lock'); };
const stepLB = d => { lbI = (lbI + d + lbItems.length) % lbItems.length; drawLB(); };

/* ---------- custom video player ---------- */
const I = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>', pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  vol: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="st" d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>', mute: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="st" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  fs: '<svg viewBox="0 0 24 24" class="ln"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>', back: '<svg viewBox="0 0 24 24" class="ln"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4.5h4.5"/></svg>'
};
const fmt = s => { if (!isFinite(s)) return '0:00'; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
function createPlayer(src, poster) {
  const w = document.createElement('div'); w.className = 'pl paused';
  w.innerHTML = `<video playsinline preload="auto" ${poster ? `poster="${esc(poster)}"` : ''}></video><div class="pl-spin"></div><div class="pl-sk"></div>
    <button class="pl-big" aria-label="play">${I.play}</button>
    <div class="pl-bar"><div class="pl-seek"><div class="pl-bf"></div><div class="pl-pg"></div><div class="pl-kn"></div><input type="range" min="0" max="1000" step="1" value="0" aria-label="seek"></div>
      <div class="pl-row"><button class="pl-pp" aria-label="play/pause">${I.play}</button><button class="pl-b10" title="-10s">${I.back}</button><button class="pl-mute" aria-label="mute">${I.vol}</button><input class="pl-vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="volume">
        <span class="pl-t">0:00 / 0:00</span><span class="sp"></span><button class="rt" title="${MK.ui('rate')}">1x</button><button class="pl-fs" aria-label="fullscreen">${I.fs}</button></div></div>`;
  const v = $('video', w), q = s => $(s, w), seek = q('.pl-seek'), sk = q('.pl-seek input'), pp = q('.pl-pp'), mu = q('.pl-mute'), vol = q('.pl-vol'), tt = q('.pl-t'), rate = q('.rt'), flash = q('.pl-sk');
  v.src = src;
  v.addEventListener('loadedmetadata', () => w.classList.add(v.videoHeight > v.videoWidth ? 'portrait' : 'land'));
  const toggle = () => (v.paused ? v.play().catch(() => {}) : v.pause());
  const setMute = m => { v.muted = m; mu.innerHTML = (m || !v.volume) ? I.mute : I.vol; };
  const jump = d => { v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + d)); flash.textContent = (d > 0 ? '+' : '') + d + MK.ui('skip'); flash.className = 'pl-sk show ' + (d > 0 ? 'r' : 'l'); clearTimeout(jump.t); jump.t = setTimeout(() => flash.className = 'pl-sk', 600); };
  const fs = () => { const d = document; if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else if (w.requestFullscreen) w.requestFullscreen(); else if (w.webkitRequestFullscreen) w.webkitRequestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); };
  const upd = () => { const d = v.duration || 0, p = d ? v.currentTime / d : 0; seek.style.setProperty('--p', p * 100 + '%'); sk.value = p * 1000; tt.textContent = fmt(v.currentTime) + ' / ' + fmt(d); };
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(e => v.addEventListener(e, upd));
  v.addEventListener('progress', () => { try { const b = v.buffered; if (b.length && v.duration) seek.style.setProperty('--bf', b.end(b.length - 1) / v.duration * 100 + '%'); } catch {} });
  let idleT; const bump = () => { w.classList.remove('idle'); clearTimeout(idleT); if (!v.paused) idleT = setTimeout(() => w.classList.add('idle'), 2600); };
  v.addEventListener('play', () => { w.classList.remove('paused'); pp.innerHTML = I.pause; q('.pl-big').innerHTML = I.pause; bump(); });
  v.addEventListener('pause', () => { w.classList.add('paused'); w.classList.remove('idle'); pp.innerHTML = I.play; q('.pl-big').innerHTML = I.play; });
  v.addEventListener('waiting', () => w.classList.add('wait')); ['playing', 'canplay'].forEach(e => v.addEventListener(e, () => w.classList.remove('wait')));
  v.addEventListener('error', () => { w.classList.add('err'); w.classList.remove('wait'); });
  sk.addEventListener('input', () => { if (v.duration) v.currentTime = sk.value / 1000 * v.duration; upd(); });
  vol.addEventListener('input', () => { v.volume = +vol.value; setMute(+vol.value === 0); });
  mu.onclick = () => { setMute(!v.muted); if (!v.muted && v.volume === 0) { v.volume = .6; vol.value = .6; } };
  pp.onclick = toggle; q('.pl-big').onclick = e => { e.stopPropagation(); toggle(); }; q('.pl-b10').onclick = () => jump(-10); q('.pl-fs').onclick = fs;
  const rates = [1, 1.25, 1.5, 2, .75]; let ri = 0; rate.onclick = () => { ri = (ri + 1) % rates.length; v.playbackRate = rates[ri]; rate.textContent = rates[ri] + 'x'; };
  w.addEventListener('mousemove', bump); w.addEventListener('touchstart', bump, { passive: true });
  let ck; v.addEventListener('click', () => { clearTimeout(ck); ck = setTimeout(() => { toggle(); bump(); }, 220); });
  v.addEventListener('dblclick', e => { clearTimeout(ck); const r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; if (x < .33) jump(-10); else if (x > .67) jump(10); else fs(); });
  w._api = { toggle, mute: () => mu.onclick(), fs, jump };
  v.play().catch(() => {});
  return w;
}

/* ---------- header / footer ---------- */
const NAV = [['services', '/#services'], ['works', '/#works'], ['process', '/#process'], ['team', '/team'], ['contact', '/#contact']];
function renderHeader(active) {
  const c = MK.content, b = c.brand, home = MK.page === 'home';
  $('#hd').innerHTML = `<header class="hd" id="hdr"><div class="wrap in">
    <a class="brand" href="/" aria-label="${esc(b.name)}"><img src="/${esc(b.logo).replace(/^\//, '')}" alt="" width="38" height="40"><span><b>${esc(b.name)}</b><small>${esc(b.tag)}</small></span></a>
    <nav class="nav" id="nav" aria-label="Main">${NAV.map(([k, h]) => `<a href="${home && h.startsWith('/#') ? h.slice(1) : h}" data-k="${k}" class="${active === k ? 'on' : ''}">${MK.ui(k)}</a>`).join('')}</nav>
    <div class="act"><button class="lang" id="lang" aria-label="Language">${LANGS[MK.lang].short}</button><a class="btn p sm" href="${home ? '#contact' : '/#contact'}">${MK.ui('start')}</a>
    <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button></div></div></header>`;
  $('#lang').onclick = () => MK.setLang(MK.lang === 'ar' ? 'en' : 'ar');
  $('#burger').onclick = () => $('#nav').classList.toggle('open');
  $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));
}
function renderFooter() {
  const c = MK.content, b = c.brand, ct = c.contact || {};
  $('#ft').innerHTML = `<footer><div class="wrap"><div class="ft">
    <div><a class="brand" href="/"><img src="/${esc(b.logo).replace(/^\//, '')}" alt="" width="38" height="40"><span><b>${esc(b.name)}</b><small>${esc(b.tag)}</small></span></a><p>${esc(MK.t(c.seo.description))}</p></div>
    <div><h4>${MK.ui('explore')}</h4><ul>${NAV.map(([k, h]) => `<li><a href="${h}">${MK.ui(k)}</a></li>`).join('')}</ul></div>
    <div><h4>${MK.ui('follow')}</h4><div class="so">${MK.socials(ct.socials) || '<span style="color:var(--mut);font-size:14px">—</span>'}</div></div></div>
    <div class="cp"><span>© ${new Date().getFullYear()} ${esc(b.name)} ${esc(b.tag)}. ${MK.ui('rights')}</span><span>${MK.ui('tag')}</span></div></div><div class="ft-word" aria-hidden="true">${esc(b.name)}</div></footer>`;
  const wa = String(ct.whatsapp || '').replace(/\D/g, '');
  $('#wa').innerHTML = wa ? `<a class="wa" href="https://wa.me/${wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${MK.icon('whatsapp')}</a>` : '';
}

/* ---------- SEO / theme ---------- */
function applyMeta() {
  const c = MK.content, b = c.brand, s = c.seo, title = MK.t(s.title), desc = MK.t(s.description), base = location.origin;
  const set = (sel, attr, val) => { let el = $(sel); if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); const m = sel.match(/\[(\w+)="([^"]+)"\]/); if (m) el.setAttribute(m[1], m[2]); document.head.appendChild(el); } el.setAttribute(attr, val); };
  document.title = MK.page === 'team' ? `${MK.t(c.team.title)} — ${b.name} ${b.tag}` : title;
  set('meta[name="description"]', 'content', desc); set('meta[property="og:title"]', 'content', document.title); set('meta[property="og:description"]', 'content', desc);
  set('meta[property="og:image"]', 'content', base + '/' + (s.ogImage || 'assets/og-image.png').replace(/^\//, '')); set('link[rel="canonical"]', 'href', base + location.pathname);
  set('meta[name="theme-color"]', 'content', '#050816');
  document.documentElement.style.setProperty('--a', (b.accent && b.accent.toLowerCase() !== '#2563eb') ? b.accent : '#2563eb'); document.documentElement.style.setProperty('--b', (b.accent2 && b.accent2.toLowerCase() !== '#22d3ee') ? b.accent2 : '#22d3ee');
  const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: `${b.name} ${b.tag}`, url: base, logo: base + '/' + b.logo.replace(/^\//, ''), description: desc, sameAs: Object.values((c.contact || {}).socials || {}).filter(Boolean) };
  if (c.contact?.email) ld.email = c.contact.email; if (c.contact?.phone) ld.telephone = c.contact.phone;
  let s2 = $('#ld'); if (!s2) { s2 = document.createElement('script'); s2.id = 'ld'; s2.type = 'application/ld+json'; document.head.appendChild(s2); } s2.textContent = JSON.stringify(ld);
}

/* ---------- generic helpers ---------- */
MK.reveal = root => {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -40px' });
  $$('.reveal', root).forEach(x => io.observe(x)); MK.cleanups.push(() => io.disconnect());
};
MK.spotlight = root => $$('.sv', root).forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));
MK.contactForm = root => {
  const f = $('form.fm', root); if (!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('.msg', f), btn = $('button[type=submit]', f), d = Object.fromEntries(new FormData(f)); d.lang = MK.lang;
    msg.className = 'msg'; msg.textContent = '';
    if ((d.name || '').trim().length < 2 || (d.message || '').trim().length < 5 || !(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '') || (d.phone || '').trim().length >= 6)) { msg.className = 'msg er'; msg.textContent = MK.ui('fInvalid'); return; }
    btn.disabled = true; const old = btn.textContent; btn.textContent = MK.ui('fSending');
    try {
      const ct = MK.content.contact || {}, wa = String(ct.whatsapp || '').replace(/\D/g, ''), text = `${d.name}${d.service ? ' — ' + d.service : ''}\n${d.message}\n${d.email || ''} ${d.phone || ''}`.trim();
      if (wa) window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      else if (ct.email) location.href = 'mailto:' + ct.email + '?subject=' + encodeURIComponent('MOTAKAMEL — ' + d.name) + '&body=' + encodeURIComponent(text);
      else throw 0;
      f.reset(); msg.className = 'msg ok'; msg.textContent = MK.ui('fOk');
    } catch { msg.className = 'msg er'; msg.textContent = MK.ui('fErr'); }
    btn.disabled = false; btn.textContent = old;
  });
};
MK.contactHTML = () => {
  const c = MK.content, ct = c.contact || {}, wa = String(ct.whatsapp || '').replace(/\D/g, ''), addr = MK.t(ct.address);
  const rows = [ct.email && ['mail', MK.ui('email'), ct.email, 'mailto:' + ct.email], ct.phone && ['phone', MK.ui('phone'), ct.phone, 'tel:' + ct.phone.replace(/\s/g, '')], wa && ['whatsapp', MK.ui('whatsapp'), '+' + wa, 'https://wa.me/' + wa], addr && ['pin', MK.ui('location'), addr, '']].filter(Boolean);
  if (!rows.length) rows.push(['globe', MK.ui('location'), MK.ui('served') + ' · AR / EN', '']);
  const opts = (c.services.items || []).map(s => `<option>${esc(MK.t(s.title))}</option>`).join('');
  return `<div class="ct"><div class="reveal"><div class="sh"><h2>${MK.ui('cTitle')}</h2><p>${MK.ui('cSub')}</p></div>
    <div class="ci">${rows.map(([i, l, v, h]) => h ? `<a href="${esc(h)}" ${h.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${MK.icon(i)}<span><small>${l}</small><b>${esc(v)}</b></span></a>` : `<div class="r">${MK.icon(i)}<span><small>${l}</small><b>${esc(v)}</b></span></div>`).join('')}
    ${ct.socials && Object.values(ct.socials).some(Boolean) ? `<div class="so">${MK.socials(ct.socials)}</div>` : ''}</div></div>
    <form class="fm reveal" novalidate><div class="f"><label for="f1">${MK.ui('fName')}</label><input id="f1" name="name" autocomplete="name" required></div><div class="f"><label for="f2">${MK.ui('fEmail')}</label><input id="f2" name="email" type="email" autocomplete="email" dir="ltr"></div>
    <div class="f"><label for="f3">${MK.ui('fPhone')}</label><input id="f3" name="phone" type="tel" autocomplete="tel" dir="ltr"></div><div class="f"><label for="f4">${MK.ui('fService')}</label><select id="f4" name="service"><option value="">${MK.ui('choose')}</option>${opts}<option>${MK.ui('other')}</option></select></div>
    <div class="f w"><label for="f5">${MK.ui('fMsg')}</label><textarea id="f5" name="message" required></textarea></div><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="f w"><button type="submit" class="btn p">${MK.ui('fSend')} <span class="arr">${MK.icon('arrow')}</span></button></div><div class="msg" role="status" aria-live="polite"></div></form></div>`;
};

/* ---------- boot ---------- */
const PREVIEW = /[?&]preview=1/.test(location.search);
async function previewDraft() {
  try {
    const db = await new Promise((res, rej) => { const r = indexedDB.open('mk-admin', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(); r.onupgradeneeded = () => rej(); });
    const get = (st, k) => new Promise(r => { const q = db.transaction(st).objectStore(st).get(k); q.onsuccess = () => r(q.result); q.onerror = () => r(null); });
    const all = st => new Promise(r => { const o = db.transaction(st).objectStore(st), ks = o.getAllKeys(), vs = o.getAll(); vs.onsuccess = () => r([ks.result, vs.result]); vs.onerror = () => r([[], []]); });
    const d = await get('kv', 'content'); if (!d) return null;
    const [ks, vs] = await all('files'), map = {}; ks.forEach((k, i) => map['/' + k] = URL.createObjectURL(vs[i]));
    const swap = root => root.querySelectorAll('img[src],video[src],source[src]').forEach(e => { const s = e.getAttribute('src') || '', p = '/' + s.replace(/^\//, '').split('#')[0]; if (map[p]) e.src = map[p] + (s.includes('#') ? '#' + s.split('#')[1] : ''); });
    new MutationObserver(() => swap(document)).observe(document.documentElement, { childList: true, subtree: true }); window.addEventListener('DOMContentLoaded', () => swap(document));
    const bar = document.createElement('div'); bar.style.cssText = 'position:fixed;bottom:0;inset-inline:0;z-index:9999;background:#f59e0b;color:#000;text-align:center;padding:8px;font:700 13px sans-serif'; bar.textContent = '👁 ده وضع المعاينة — بتشوف تعديلاتك قبل النشر. الزوار مش شايفينها لسه.'; document.addEventListener('DOMContentLoaded', () => document.body.appendChild(bar));
    return d;
  } catch { return null; }
}
async function loadContent() {
  if (PREVIEW) { const d = await previewDraft(); if (d) return d; }
  for (const u of ['/content.json', '/default-content.json']) { try { const r = await fetch(u, { cache: 'no-store' }); if (r.ok) return await r.json(); } catch {} }
  throw new Error('content');
}
MK.render = null;
MK.apply = () => {
  MK.cleanups.forEach(f => { try { f(); } catch {} }); MK.cleanups = [];
  const L = LANGS[MK.lang]; document.documentElement.lang = MK.lang; document.documentElement.dir = L.dir;
  applyMeta(); renderHeader(MK.page === 'team' ? 'team' : ''); $('#app').innerHTML = MK.render(MK.content); renderFooter();
  MK.reveal(document); MK.spotlight(document); MK.contactForm(document);
  if (MK.after) MK.after(document);
  const hdr = $('#hdr'), onS = () => hdr.classList.toggle('sc', scrollY > 24); onS(); addEventListener('scroll', onS, { passive: true }); MK.cleanups.push(() => removeEventListener('scroll', onS));
};
MK.setLang = l => { MK.lang = l; try { localStorage.setItem('mk-lang', l); } catch {} const y = scrollY; MK.apply(); scrollTo(0, y); };
MK.boot = async (page, render, after) => {
  MK.page = page; MK.render = render; MK.after = after; MK.lang = MK.initial();
  $('#lbX').onclick = closeLB; $('#lbP').onclick = () => stepLB(-1); $('#lbN').onclick = () => stepLB(1);
  $('#lb').addEventListener('click', e => { if (e.target.id === 'lb' || e.target.id === 'lbB') closeLB(); });
  document.addEventListener('keydown', e => { if ($('#lb').hidden) return; const api = ($('#lbB .pl') || {})._api, k = e.key.toLowerCase();
    if (api) { if (k === ' ' || k === 'k') { e.preventDefault(); api.toggle(); } else if (k === 'm') api.mute(); else if (k === 'f') api.fs(); else if (k === 'j') api.jump(-10); else if (k === 'l') api.jump(10); }
    if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') stepLB(-1); if (e.key === 'ArrowRight') stepLB(1); });
  try { MK.content = await loadContent(); } catch { $('#app').innerHTML = '<p style="padding:120px 20px;text-align:center">Unable to load content.</p>'; $('#loader').classList.add('off'); return; }
  MK.apply();
  const imgs = $$('img').filter(i => !i.complete).slice(0, 6);
  Promise.race([Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 1400))]).then(() => $('#loader').classList.add('off'));
};
})();
