(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
let D, tab = 'start', curCat = null, saveT, cfg = { blob: false };
const ADD = {};

/* ---------- api / save ---------- */
/* ---------- تخزين محلي (IndexedDB) — مفيش سيرفر ---------- */
const idb = new Promise((res, rej) => { const r = indexedDB.open('mk-admin', 1); r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('files'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbTx = async (st, mode, fn) => { const d = await idb; return new Promise((res, rej) => { const t = d.transaction(st, mode), o = fn(t.objectStore(st)); t.oncomplete = () => res(o && o.result); t.onerror = () => rej(t.error); }); };
const kvGet = k => idbTx('kv', 'readonly', s => s.get(k)), kvSet = (k, v) => idbTx('kv', 'readwrite', s => s.put(v, k));
const fGetAll = () => idbTx('files', 'readonly', s => s.getAll()).then(async v => { const k = await idbTx('files', 'readonly', s => s.getAllKeys()); return k.map((n, i) => [n, v[i]]); });
const fSet = (n, b) => idbTx('files', 'readwrite', s => s.put(b, n)), fDel = n => idbTx('files', 'readwrite', s => s.delete(n));
const PENDING = {}; // path -> blob URL (للمعاينة جوه الأدمن)
const swapPending = root => (root || document).querySelectorAll('img[src^="/uploads/"],video[src^="/uploads/"]').forEach(e => { const p = e.getAttribute('src').split('#')[0], h = e.getAttribute('src').includes('#') ? '#' + e.getAttribute('src').split('#')[1] : ''; if (PENDING[p]) e.src = PENDING[p] + h; });
const swapBg = () => document.querySelectorAll('[style*="/uploads/"]').forEach(e => { const m = e.getAttribute('style').match(/url\(['"]?(\/uploads\/[^'")]+)['"]?\)/); if (m && PENDING[m[1]] && !e.dataset.sw) { e.style.backgroundImage = `url('${PENDING[m[1]]}')`; e.dataset.sw = '1'; } });
let LIVE = false;
new MutationObserver(() => { swapPending(); swapBg(); }).observe(document.documentElement, { childList: true, subtree: true });
const status = (t, c = '') => { const s = $('#status'); s.textContent = t; s.className = 'status ' + c; };
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); };
const changed = () => { try { localStorage.setItem('mk-dirty', '1'); } catch {} pubBadge(); status('جاري الحفظ…'); clearTimeout(saveT); saveT = setTimeout(save, 900); };
async function save() { try {
  if (LIVE) { const r = await fetch('/__api/save', { method: 'POST', body: JSON.stringify(D, null, 2) }); if (!r.ok) throw new Error('السيرفر رفض الحفظ'); status('✓ اتحفظ في الموقع', 'ok'); }
  else { await kvSet('content', JSON.parse(JSON.stringify(D))); status('✓ محفوظ على المتصفح — اضغط «تصدير» لما تخلّص', 'ok'); $('#exp')?.classList.add('hot'); }
} catch (e) { status('فشل الحفظ ✕ ' + e.message, 'bad'); } }
addEventListener('beforeunload', e => { if ($('#status').textContent.startsWith('جاري')) { e.preventDefault(); e.returnValue = ''; } });

const getp = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const setp = (o, p, v) => { const ks = p.split('.'), l = ks.pop(); ks.reduce((a, k, i) => (a[k] ??= /^\d+$/.test(ks[i + 1] ?? l) ? [] : {}), o)[l] = v; };
const u = s => !s ? '' : (/^(https?:|\/|data:)/.test(s) ? s : '/' + s);

/* ---------- field builders ---------- */
const bi = (p, l, ta) => `<div class="f"><label>${l}</label><div class="bi">${['en', 'ar'].map(g => ta ? `<textarea class="${g}" data-k="${p}.${g}" placeholder="${g.toUpperCase()}">${esc(getp(D, p + '.' + g))}</textarea>` : `<input class="${g}" data-k="${p}.${g}" placeholder="${g.toUpperCase()}" value="${esc(getp(D, p + '.' + g))}">`).join('')}</div></div>`;
const tx = (p, l, type = 'text', ph = '') => `<div class="f"><label>${l}</label><input type="${type}" data-k="${p}" value="${esc(getp(D, p))}" ${ph ? `placeholder="${ph}"` : ''} ${type === 'text' || type === 'email' || type === 'url' ? 'dir="auto"' : ''}></div>`;
const ta = (p, l) => `<div class="f"><label>${l}</label><textarea data-k="${p}">${esc(getp(D, p))}</textarea></div>`;
const img = (p, l, max = 1600) => `<div class="f"><label>${l}</label><div class="img"><div class="pv" style="background-image:url('${esc(u(getp(D, p)))}')"></div><div><button class="btn sm" data-img="${p}" data-max="${max}">📤 ارفع صورة</button></div></div></div>`;
const vid = (p, l) => { const v = getp(D, p) || ''; return `<div class="f"><label>${l}</label><div class="img"><div class="pv" style="display:grid;place-items:center;font-size:26px">${v ? '🎬' : '—'}</div><div><button class="btn sm" data-vid="${p}">📤 ارفع فيديو</button> ${v ? `<button class="btn sm" data-novid="${p}">✕ شيل</button><br><small>${esc(String(v).split('/').pop())}</small>` : ''}</div></div></div>`; };
const sel = (p, l, opts) => `<div class="f"><label>${l}</label><select data-k="${p}">${opts.map(([v, n]) => `<option value="${v}" ${getp(D, p) === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`;
const chk = (p, l) => `<div class="f"><label><input type="checkbox" data-k="${p}" ${getp(D, p) ? 'checked' : ''}> ${l}</label></div>`;
const field = (base, f) => { const p = base + '.' + f.k; return { bi: () => bi(p, f.l), bita: () => bi(p, f.l, true), tx: () => tx(p, f.l, f.type, f.ph), num: () => tx(p, f.l, 'number'), ta: () => ta(p, f.l), img: () => img(p, f.l, f.max), vid: () => vid(p, f.l), sel: () => sel(p, f.l, f.opts), chk: () => chk(p, f.l) }[f.t](); };
function list(path, fields, mk, label, addLabel = '＋ إضافة') {
  ADD[path] = mk; const arr = getp(D, path) || [];
  return arr.map((it, i) => `<div class="item"><div class="hd"><span>${esc(label(it, i))}</span><div class="ops"><button data-mv="${path}:${i}:-1">↑</button><button data-mv="${path}:${i}:1">↓</button><button class="x" data-del="${path}:${i}">🗑</button></div></div>${fields.map(f => field(path + '.' + i, f)).join('')}</div>`).join('') + `<button class="btn sm" data-add="${path}">${addLabel}</button>`;
}
const B = (en = '', ar = '') => ({ en, ar });
const ICONS = ['video', 'motion', 'palette', 'social', 'ads', 'code', 'pen', 'camera', 'globe', 'film', 'search', 'compass', 'wand', 'rocket'].map(x => [x, x]);
const DEPTS = [['management', 'الإدارة'], ['video', 'الفيديو'], ['design', 'التصميم'], ['marketing', 'التسويق'], ['tech', 'التقنية'], ['production', 'الإنتاج'], ['content', 'المحتوى']];
const head = (t, s) => `<div class="ph"><div><h2>${t}</h2><p class="sub">${s}</p></div>${tab !== 'start' && tab !== 'settings' ? `<a class="where" target="_blank" href="${tab === 'team' ? '/team' : '/'}?preview=1${WHERE[tab] || ''}">👁 شوف التعديل في الموقع</a>` : ''}</div>`;
const card = (t, body) => `<div class="card">${t ? `<h3>${t}</h3>` : ''}${body}</div>`;
const lbl = (it, i, k = 'name') => `${i + 1}. ${(it[k] && (it[k].en || it[k].ar)) || ''}`;

/* ---------- views ---------- */
const GROUPS = [
  ['ابدأ من هنا', [['start', '🏁', 'ابدأ هنا — شرح بسيط']]],
  ['الصفحة الرئيسية', [['hero', '🎬', 'أول الصفحة (العنوان)'], ['slides', '🖼️', 'السلايد (الشاشة الكبيرة)'], ['about', 'ℹ️', 'عن الشركة والفروع'], ['services', '🧩', 'الخدمات'], ['works', '🎞️', 'الأعمال (صور وفيديو)'], ['stats', '📊', 'الأرقام وطريقة الشغل'], ['more', '💬', 'آراء العملاء والأسئلة']]],
  ['الناس', [['team', '👥', 'الفريق (الموظفين)'], ['clients', '🏢', 'لوجوهات العملاء']]],
  ['الشركة', [['brand', '🎨', 'اللوجو والألوان والتواصل']]],
  ['متقدم', [['texts', '✏️', 'كل كلمة في الأزرار والقوائم'], ['look', '🧱', 'إظهار / إخفاء الأقسام'], ['settings', '💾', 'النشر والنسخ الاحتياطي']]]
];
const TABS = Object.fromEntries(GROUPS.flatMap(g => g[1].map(x => [x[0], x[2]])));
const WHERE = { hero: '#top', slides: '#top', about: '#about', services: '#services', works: '#works', stats: '#process', more: '#faq', team: '', clients: '#top', brand: '#top', texts: '#top', look: '#top', settings: '#top', start: '' };
const VIEWS = {
  start: () => head('لوحة التحكم', '') +
    card('اختار اللي عايز تغيّره', `<div class="quick">${[['hero', '🎬', 'العنوان الكبير والأزرار', 'أول حاجة الزائر بيشوفها'], ['works', '🎞️', 'صور وفيديوهات الأعمال', 'الشاشة الكبيرة + معرض الأعمال'], ['team', '👥', 'الموظفين وصورهم', 'صفحة الفريق'], ['services', '🧩', 'الخدمات', 'الأسماء والوصف والأيقونات'], ['clients', '🏢', 'لوجوهات العملاء', 'الشريط المتحرك'], ['brand', '🎨', 'اللوجو والألوان وأرقام التواصل', 'والسوشيال والواتساب'], ['about', 'ℹ️', 'نبذة عن الشركة والفروع', 'ورقم/عنوان كل فرع'], ['texts', '✏️', 'كلمات الأزرار والقوائم', 'زي "ابدأ مشروعك" و"تواصل"'], ['look', '🧱', 'إخفاء أقسام', 'اخفي أي قسم مش عايزه']].map(([k, i, t, d]) => `<button class="qk" data-t="${k}"><span>${i}</span><b>${t}</b><small>${d}</small></button>`).join('')}</div>`),
  texts: () => { const U = window.MK_UI, flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => typeof v === 'object' ? flat(v, p + k + '.') : [[p + k, v]]);
    const N = { more: 'زر "ابدأ الآن" في الخدمات', services: 'قايمة: الخدمات', works: 'قايمة: الأعمال', process: 'قايمة: طريقة الشغل', team: 'قايمة: الفريق', contact: 'قايمة: تواصل', start: 'الزر الأبيض فوق: ابدأ مشروعك', all: 'فلتر: الكل', seeTeam: 'زر: اتعرف على الفريق', close: 'إغلاق', cTitle: 'عنوان قسم التواصل', cSub: 'وصف قسم التواصل', fName: 'فورم: الاسم', fEmail: 'فورم: الإيميل', fPhone: 'فورم: الموبايل', fService: 'فورم: الخدمة', fMsg: 'فورم: الرسالة', fSend: 'فورم: زر الإرسال', fSending: 'فورم: جاري الإرسال', fOk: 'رسالة نجاح الإرسال', fErr: 'رسالة الخطأ', fInvalid: 'رسالة بيانات ناقصة', choose: 'فورم: اختار الخدمة', other: 'فورم: حاجة تانية', email: 'تسمية الإيميل', phone: 'تسمية الهاتف', whatsapp: 'تسمية واتساب', location: 'تسمية العنوان', tag: 'جملة الفوتر الصغيرة', explore: 'عنوان الفوتر: استكشف', follow: 'عنوان الفوتر: تابعنا', rights: 'حقوق النشر', home: 'الرئيسية', teamHero: 'عنوان صفحة الفريق', joinT: 'صفحة الفريق: عنوان الانضمام', joinS: 'صفحة الفريق: وصف الانضمام', empty: 'لما القسم فاضي', watch: 'مشاهدة', skip: 'رمز الثواني', rate: 'السرعة', served: 'نص "حول العالم"' };
    const rows = flat(U.en).map(([k, v]) => { const ar = k.split('.').reduce((a, x) => a?.[x], U.ar) || '';
      return `<div class="f"><label>${N[k] || k}</label><div class="bi"><input class="en" data-k="ui.en.${k.replace(/\./g, '__')}" placeholder="${esc(v)}" value="${esc(getp(D, 'ui.en.' + k.replace(/\./g, '__')) || '')}"><input class="ar" data-k="ui.ar.${k.replace(/\./g, '__')}" placeholder="${esc(ar)}" value="${esc(getp(D, 'ui.ar.' + k.replace(/\./g, '__')) || '')}"></div></div>`; }).join('');
    return head('كلمات الأزرار والقوائم', 'الكلمات الثابتة في الموقع (القايمة، الأزرار، الفورم، الفوتر). الخانة الفاضية = الكلمة الأصلية (ظاهرة باهتة جوه الخانة).') + card('', rows); },
  look: () => { const S = [['clients', 'شريط لوجوهات العملاء'], ['about', 'عن الشركة + الأرقام'], ['services', 'الخدمات'], ['works', 'معرض الأعمال'], ['band', 'الشريط المتحرك الكبير'], ['process', 'طريقة الشغل'], ['team', 'الفريق (في الصفحة الرئيسية)'], ['testimonials', 'آراء العملاء'], ['faq', 'الأسئلة الشائعة'], ['cta', 'بانر الدعوة للتواصل'], ['offices', 'الفروع']];
    return head('إظهار / إخفاء الأقسام', 'شيل العلامة من أي قسم مش عايزه يظهر في الصفحة الرئيسية. (الهيدر وقسم التواصل والفوتر ثابتين.)') + card('', S.map(([k, n]) => `<div class="f"><label><input type="checkbox" data-sec="${k}" ${D.sections?.[k] === false ? '' : 'checked'}> ${n}</label></div>`).join('')); },
  brand: () => head('الهوية والتواصل', 'اسم الشركة، اللوجو، الألوان، بيانات التواصل وإعدادات الـ SEO.') +
    card('الهوية', `<div class="row">${tx('brand.name', 'اسم الشركة')}${tx('brand.tag', 'الوصف تحت الاسم')}${tx('brand.accent', 'اللون الأساسي', 'color')}${tx('brand.accent2', 'اللون الثانوي', 'color')}</div>${img('brand.logo', 'اللوجو (PNG شفاف — الأيقونة فقط)', 600)}`) +
    card('بيانات التواصل', `<div class="row">${tx('contact.email', 'الإيميل', 'email')}${tx('contact.phone', 'الهاتف')}${tx('contact.whatsapp', 'واتساب (الرقم بكود الدولة)', 'text', '201001234567')}</div>${bi('contact.address', 'العنوان')}`) +
    card('السوشيال ميديا (روابط كاملة)', `<div class="row">${['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'behance', 'x'].map(k => tx('contact.socials.' + k, k, 'url', 'https://')).join('')}</div>`) +
    card('محركات البحث (SEO) وصورة المشاركة', `${bi('seo.title', 'عنوان الموقع')}${bi('seo.description', 'وصف الموقع', true)}${img('seo.ogImage', 'صورة المشاركة (1200×630)', 1600)}`),
  slides: () => head('السلايد (الشاشة الكبيرة في أول الموقع)', 'الصور/الفيديوهات اللي بتتبدّل جوه الشكل السداسي الكبير. ضيف أو شيل أو رتّب زي ما تحب.') +
    card('الإعدادات', `${sel('hero.slideMode', 'مصدر السلايد', [['custom', 'اللي أنا هضيفه تحت (مخصص)'], ['auto', 'تلقائي من صور الأعمال']])}${tx('hero.interval', 'كل كام ثانية يتبدّل', 'number', '4')}<p class="hint">لو اخترت "مخصص" ومفيش سلايدات، هيعرض صور الأعمال لحد ما تضيف.</p>`) +
    list('hero.slides', [{ k: 'src', t: 'img', l: 'الصورة (أو غلاف الفيديو) — عريضة 16:9 أفضل', max: 1800 }, { k: 'video', t: 'vid', l: 'فيديو (اختياري — بيشتغل من غير صوت بدل الصورة)' }, { k: 'cap', t: 'bi', l: 'الكلمة اللي تظهر تحت السلايد (مثلاً: مونتاج)' }], () => ({ id: uid(), src: '', video: '', cap: B() }), (it, i) => lbl(it, i, 'cap') || ('سلايد ' + (i + 1)), '＋ سلايد جديد') + card('الشريط المتحرك الكبير (بين الأقسام)', `${bi('band.text', 'الجملة اللي بتتكرر (سيبها فاضية = العنوان الرئيسي)')}`),
  hero: () => head('الصفحة الرئيسية', 'النصوص الكبيرة في أول الموقع.') + card('', `${bi('hero.badge', 'الشارة الصغيرة')}${bi('hero.title1', 'العنوان — السطر الأول')}${bi('hero.title2', 'العنوان — السطر الملوّن')}${bi('hero.sub', 'الوصف', true)}${bi('hero.cta1', 'زرار 1')}${bi('hero.cta2', 'زرار 2')}`),
  services: () => head('الخدمات', 'الخدمة اللي عليها "مميزة" بتظهر كبيرة مع شاشة المونتاج.') + card('', `${bi('services.title', 'العنوان')}${bi('services.sub', 'الوصف')}`) +
    list('services.items', [{ k: 'icon', t: 'sel', l: 'الأيقونة', opts: ICONS }, { k: 'featured', t: 'chk', l: 'خدمة مميزة (كبيرة)' }, { k: 'src', t: 'img', l: 'صورة الخدمة (بتظهر في المربع الكبير)', max: 1400 }, { k: 'video', t: 'vid', l: 'أو فيديو (من غير صوت)' }, { k: 'title', t: 'bi', l: 'الاسم' }, { k: 'desc', t: 'bita', l: 'الوصف' }], () => ({ id: uid(), icon: 'star', src: '', video: '', title: B(), desc: B() }), (it, i) => lbl(it, i, 'title')),
  works: () => {
    const cats = D.works.categories; if (!curCat || !cats.find(c => c.id === curCat)) curCat = cats[0]?.id;
    const ci = cats.findIndex(c => c.id === curCat), c = cats[ci];
    let out = head('الأعمال', 'كل الكروت بمقاس ريلز 9:16. ارفع صور وفيديوهات، أو ضيف روابط Drive / YouTube / Vimeo.') + card('', `${bi('works.title', 'عنوان القسم')}${bi('works.sub', 'الوصف')}`);
    out += `<div class="chips">${cats.map(x => `<button data-cat="${x.id}" class="${x.id === curCat ? 'on' : ''}">${esc(x.name.en || x.name.ar)}</button>`).join('')}<button data-addcat>＋ تصنيف جديد</button></div>`;
    if (!c) return out + card('', 'اعمل تصنيف جديد الأول.');
    const P = `works.categories.${ci}`; ADD[P + '.items'] = null;
    out += card('إعدادات التصنيف', `${bi(P + '.name', 'اسم التصنيف')}<button class="btn dn sm" data-delcat>حذف التصنيف</button>`);
    out += card(`الملفات (${c.items.length})`, `<div class="drop" id="drop">📁 اسحب الصور والفيديوهات هنا أو اضغط للاختيار<br><small>الأفضل مقاس ريلز 9:16 (1080×1920) — MP4 بترميز H.264</small></div><input type="file" id="fi" multiple accept="image/*,video/*,.mov,.m4v" hidden><div class="up" id="uplist"></div>
      <div class="f"><label>🔗 أو الصق روابط (Google Drive لازم يكون "أي شخص معه الرابط" — يوتيوب/فيميو — كل رابط في سطر)</label><textarea id="lnk" dir="ltr" placeholder="https://drive.google.com/file/d/.../view&#10;https://youtube.com/shorts/..."></textarea><button class="btn sm" id="lnkAdd" style="margin-top:8px">إضافة الروابط</button></div>
      <div class="grid">${c.items.map((it, i) => cell(it, `${P}.items.${i}`, P + '.items', i)).join('')}</div>`);
    return out;
  },
  team: () => head('الفريق (الموظفين)', 'بتظهر في صفحة /team وفي الصفحة الرئيسية (أول 4).') + card('', `${bi('team.title', 'العنوان')}${bi('team.sub', 'الوصف')}`) +
    list('team.members', [{ k: 'photo', t: 'img', l: 'الصورة (4:5 أفضل)', max: 1200 }, { k: 'name', t: 'bi', l: 'الاسم' }, { k: 'role', t: 'bi', l: 'المنصب' }, { k: 'dept', t: 'sel', l: 'القسم', opts: DEPTS }, { k: 'bio', t: 'bita', l: 'نبذة قصيرة' }, { k: 'links.linkedin', t: 'tx', l: 'LinkedIn', type: 'url' }, { k: 'links.instagram', t: 'tx', l: 'Instagram', type: 'url' }, { k: 'links.behance', t: 'tx', l: 'Behance', type: 'url' }, { k: 'links.x', t: 'tx', l: 'X', type: 'url' }],
      () => ({ id: uid(), name: B(), role: B(), dept: 'video', photo: 'assets/samples/team-1.svg', bio: B(), links: {} }), lbl, '＋ موظف جديد'),
  clients: () => { ADD['clients.logos'] = null; return head('العملاء', 'لوجوهات الشركات (PNG شفاف أو SVG).') + card('', bi('clients.title', 'العنوان')) +
    card(`اللوجوهات (${D.clients.logos.length})`, `<div class="drop" id="drop">📁 اسحب اللوجوهات هنا أو اضغط للاختيار</div><input type="file" id="fi" multiple accept="image/*" hidden><div class="up" id="uplist"></div><div class="grid">${D.clients.logos.map((l, i) => `<div class="cell"><div class="th sq" style="background-image:url('${esc(u(l.src))}')"></div><div class="bd"><input data-k="clients.logos.${i}.name" value="${esc(l.name || '')}" placeholder="اسم العميل"><div class="ac"><button data-mv="clients.logos:${i}:-1">→</button><button data-mv="clients.logos:${i}:1">←</button><button class="x" data-del="clients.logos:${i}">🗑</button></div></div></div>`).join('')}</div>`); },
  about: () => head('عن الشركة والفروع', 'نبذة "عن الشركة" جنب الأرقام، وفروعك/مكاتبك اللي بتظهر قبل فورم التواصل.') + card('', `${bi('about.title', 'عنوان "عن الشركة"')}${bi('about.text', 'النبذة', true)}${bi('about.more', 'نص الزر')}`) + list('offices', [{ k: 'city', t: 'bi', l: 'المدينة' }, { k: 'address', t: 'bi', l: 'العنوان (اختياري)' }, { k: 'phone', t: 'tx', l: 'الهاتف' }], () => ({ city: B(), address: B(), phone: '' }), (it, i) => lbl(it, i, 'city'), '＋ فرع جديد'),
  stats: () => head('الأرقام وطريقة الشغل', 'الأرقام اللي بتتعدّ، وخطوات "بنشتغل إزاي".') + card('الأرقام', list('stats.items', [{ k: 'value', t: 'num', l: 'الرقم' }, { k: 'suffix', t: 'tx', l: 'علامة بعد الرقم (+ أو %)' }, { k: 'label', t: 'bi', l: 'الوصف' }], () => ({ value: 0, suffix: '+', label: B() }), (it, i) => `${i + 1}. ${it.value}${it.suffix || ''}`)) +
    card('', `${bi('process.title', 'عنوان "بنشتغل إزاي"')}${bi('process.sub', 'الوصف')}`) + list('process.items', [{ k: 'icon', t: 'sel', l: 'الأيقونة', opts: ICONS }, { k: 'title', t: 'bi', l: 'العنوان' }, { k: 'desc', t: 'bita', l: 'الوصف' }], () => ({ icon: 'star', title: B(), desc: B() }), (it, i) => lbl(it, i, 'title')),
  more: () => head('آراء العملاء والأسئلة', 'استبدل النصوص التجريبية بآراء حقيقية من عملائك.') + card('', bi('testimonials.title', 'عنوان آراء العملاء')) +
    list('testimonials.items', [{ k: 'avatar', t: 'img', l: 'صورة العميل (اختياري)', max: 400 }, { k: 'name', t: 'bi', l: 'الاسم' }, { k: 'role', t: 'bi', l: 'الشركة · المنصب' }, { k: 'text', t: 'bita', l: 'الرأي' }], () => ({ id: uid(), name: B(), role: B(), text: B() }), lbl) +
    card('', bi('faq.title', 'عنوان الأسئلة الشائعة')) + list('faq.items', [{ k: 'q', t: 'bi', l: 'السؤال' }, { k: 'a', t: 'bita', l: 'الإجابة' }], () => ({ q: B(), a: B() }), (it, i) => lbl(it, i, 'q'), '＋ سؤال جديد') +
    card('بانر الدعوة للتواصل', `${bi('cta.title', 'العنوان')}${bi('cta.sub', 'الوصف')}${bi('cta.button', 'الزرار')}`),
  settings: () => head('الحفظ والنشر', '') + card('', LIVE
      ? `<p>✓ إنت شغال محلياً: كل تعديل وصورة بتتحفظ مباشرة في فولدر المشروع (<code>public/content.json</code> و<code>public/uploads</code>).<br>عشان تنشر: ارفع فولدر المشروع كله على Vercel.</p>`
      : `<p>اضغط <b>🚀 نشر الموقع</b> (فوق في القائمة) وتعديلاتك بتظهر للزوار خلال دقيقة.</p>`) +
    (LIVE ? '' : card('إعداد النشر (مرة واحدة)', (() => { const g = GH() || {}; return `<div class="f"><label>الريبو على GitHub</label><input id="ghr" dir="ltr" value="${esc(g.repo || 'saskkeahmed-afk/motakamel')}"></div><div class="f"><label>الفرع</label><input id="ghb" dir="ltr" value="${esc(g.branch || 'main')}"></div><div class="f"><label>مفتاح النشر (Token)</label><input id="ght" type="password" dir="ltr" placeholder="github_pat_…" value="${esc(g.token || '')}"></div><button class="btn" id="ghsave">حفظ الإعداد</button> ${g.token ? '<span style="color:#4ade80">✓ جاهز</span>' : ''}`; })()) +
      card('مفتاح واحد لكل الناس', `<p>اكتب المفتاح فوق، واختار كلمة سر دخول قوية، ودوس تنزيل. حط الملف في <code>public</code> وارفعه على جيت هب مرة واحدة. بعدها أي حد يكتب كلمة السر بيدخل والنشر شغال من غير ما يلصق حاجة.</p><div class="f"><label>كلمة سر الدخول (قوية)</label><input id="ghpw" type="text" dir="ltr" placeholder="٨ حروف على الأقل"></div><button class="btn" id="ghkey">⬇ تنزيل admin-key.json</button>`)) +
    card('نسخة احتياطية', `<button class="btn" id="imp">📥 استيراد ملف</button><input type="file" id="impf" accept=".json" hidden> <button class="btn" id="bak">💾 تنزيل نسخة</button>`) +
    (LIVE ? '' : card('', '<button class="btn dn" id="rst">إعادة ضبط المسودة</button>'))
};
function cell(it, P, arrPath, i) {
  const k = it.driveId || it.type === 'drive' ? 'drive' : it.embed?.id ? 'embed' : (it.type === 'video' || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(it.src || '')) ? 'video' : 'image';
  let th = it.poster || (k === 'image' ? it.src : k === 'drive' ? `https://drive.google.com/thumbnail?id=${it.driveId}&sz=w400` : k === 'embed' && it.embed.provider === 'youtube' ? `https://i.ytimg.com/vi/${it.embed.id}/hqdefault.jpg` : '');
  const tag = { image: '', video: 'فيديو', drive: 'Drive', embed: it.embed?.provider || '' }[k];
  return `<div class="cell"><div class="th">${th ? `<img src="${esc(u(th))}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : k === 'video' ? `<video src="${esc(u(it.src))}#t=0.5" muted preload="metadata"></video>` : '▶'}${tag ? `<span class="tag">${tag}</span>` : ''}</div>
    <div class="bd"><input data-k="${P}.title.en" value="${esc(it.title?.en || '')}" placeholder="Title (EN)"><input dir="rtl" data-k="${P}.title.ar" value="${esc(it.title?.ar || '')}" placeholder="العنوان (AR)">
    ${k === 'drive' || k === 'embed' ? `<select data-k="${P}.orient"><option value="v" ${it.orient !== 'h' ? 'selected' : ''}>طولي 9:16</option><option value="h" ${it.orient === 'h' ? 'selected' : ''}>عرضي 16:9</option></select>` : ''}
    <div class="ac"><button data-mv="${arrPath}:${i}:-1">→</button><button data-mv="${arrPath}:${i}:1">←</button><button class="x" data-del="${arrPath}:${i}">🗑</button></div></div></div>`;
}

/* ---------- uploads ---------- */
async function shrink(file, max, q = .86) {
  if (!/^image\/(png|jpe?g|webp|avif)/.test(file.type)) return file;
  const bmp = await createImageBitmap(file); let s = Math.min(1, max / Math.max(bmp.width, bmp.height)), blob;
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    blob = await new Promise(r => c.toBlob(r, 'image/webp', q)); if (blob.size < 4 * 1024 * 1024 || cfg.blob === false) break; s *= .8; q = Math.max(.6, q - .08);
  }
  return new File([blob], file.name.replace(/\.\w+$/, '') + (blob.type === 'image/webp' ? '.webp' : '.png'), { type: blob.type });
}
const raw = async (file, onP) => {
  const ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.bin'])[0].toLowerCase(), base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w\u0600-\u06FF-]+/g, '-').slice(0, 40) || 'file';
  const name = `uploads/${base}-${Date.now().toString(36)}${ext}`; if (LIVE) { const r = await fetch('/__api/upload?name=' + encodeURIComponent(name.slice(8)), { method: 'POST', body: file }); if (!r.ok) throw new Error('فشل رفع الملف'); const j = await r.json(); onP && onP(1); return j.path; }
  await fSet(name, file); PENDING['/' + name] = URL.createObjectURL(file); onP && onP(1); return '/' + name;
};
function probeVideo(file) {
  return new Promise(res => {
    const url = URL.createObjectURL(file), v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.playsInline = true;
    const done = r => { clearTimeout(t); URL.revokeObjectURL(url); v.removeAttribute('src'); res(r); }, t = setTimeout(() => done({ ok: false, timeout: true }), 25000);
    v.onerror = () => done({ ok: false });
    v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 1) * .1); } catch { done({ ok: false }); } };
    v.onseeked = () => { try { const W = 540, H = 960, c = document.createElement('canvas'); c.width = W; c.height = H; const vw = v.videoWidth, vh = v.videoHeight; if (!vw || !vh) return done({ ok: false }); const sc = Math.max(W / vw, H / vh); c.getContext('2d').drawImage(v, (W - vw * sc) / 2, (H - vh * sc) / 2, vw * sc, vh * sc); c.toBlob(b => done({ ok: true, blob: b }), 'image/jpeg', .82); } catch { done({ ok: false }); } };
    v.src = url;
  });
}
const isVid = f => f.type.startsWith('video') || /\.(mp4|webm|mov|m4v)$/i.test(f.name);
async function handleFiles(files, mode) {
  const list = $('#uplist'); let errs = 0;
  for (const f of files) {
    const row = document.createElement('div'); row.className = 'u'; row.innerHTML = `<i></i><span>${esc(f.name)}</span>`; list.appendChild(row);
    const say = t => row.querySelector('span').textContent = f.name + ' — ' + t, bar = p => row.firstChild.style.width = p * 100 + '%';
    try {
      let url, poster, v = isVid(f);
      if (v) {
        if (mode !== 'works') throw new Error('هنا صور فقط');
        say('بفحص الفيديو…'); const pr = await probeVideo(f);
        if (!pr.ok && !pr.timeout) throw new Error('الفيديو ده مش بيشتغل في المتصفح (غالبًا H.265/HEVC من الآيفون). حوّله لـ MP4 H.264 وارفعه تاني');
        if (pr.blob) { try { poster = await raw(new File([pr.blob], 'poster.jpg', { type: 'image/jpeg' })); } catch {} }
        if (f.size > 150 * 1024 * 1024) throw new Error('الفيديو كبير (+150MB) — حطه على Drive/YouTube وضيف الرابط بدل الرفع'); url = await raw(f, p => { bar(p); say(Math.round(p * 100) + '%'); });
      } else {
        const sm = await shrink(f, mode === 'logos' ? 800 : 1800); url = await raw(sm, p => { bar(p); say(Math.round(p * 100) + '%'); });
      }
      if (mode === 'works') { const c = D.works.categories.find(x => x.id === curCat); c.items.push({ id: uid(), type: v ? 'video' : 'image', src: url, title: B(), ...(poster ? { poster } : {}) }); }
      else D.clients.logos.push({ id: uid(), name: '', src: url });
      say('✓'); changed();
    } catch (e) { say('✕ ' + e.message); row.style.color = '#fca5a5'; errs++; }
  }
  setTimeout(render, errs ? 8000 : 700);
}
function parseLink(line) {
  line = line.trim(); if (!line) return null;
  let m = line.match(/drive\.google\.com\/.*?\/d\/([\w-]{10,})/) || line.match(/drive\.google\.com\/.*[?&]id=([\w-]{10,})/);
  if (m) return { id: uid(), type: 'drive', driveId: m[1], orient: 'v', title: B() };
  try {
    const x = new URL(line), h = x.hostname.replace('www.', '');
    if (h === 'youtu.be') return { id: uid(), type: 'embed', embed: { provider: 'youtube', id: x.pathname.slice(1) }, orient: 'h', title: B() };
    if (h.endsWith('youtube.com')) { const s = x.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/); const id = s ? s[2] : x.searchParams.get('v'); if (id) return { id: uid(), type: 'embed', embed: { provider: 'youtube', id }, orient: s && s[1] === 'shorts' ? 'v' : 'h', title: B() }; }
    if (h.endsWith('vimeo.com')) { const s = x.pathname.match(/(\d{5,})/); if (s) return { id: uid(), type: 'embed', embed: { provider: 'vimeo', id: s[1] }, orient: 'h', title: B() }; }
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(x.pathname)) return { id: uid(), type: 'video', src: line, title: B() };
    if (/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(x.pathname)) return { id: uid(), type: 'image', src: line, title: B() };
  } catch {}
  return null;
}

/* ---------- events (delegated) ---------- */
function bind() {
  const m = $('#main');
  m.oninput = e => { const sc = e.target.closest('[data-sec]'); if (sc) { D.sections = D.sections || {}; D.sections[sc.dataset.sec] = sc.checked; changed(); return; } const el = e.target.closest('[data-k]'); if (!el) return; setp(D, el.dataset.k, el.type === 'number' ? +el.value : el.type === 'checkbox' ? el.checked : el.value); changed(); };
  m.onclick = async e => {
    const t = e.target.closest('button, .drop'); if (!t) return;
    if (t.dataset.img) { const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.onchange = async () => { if (!fi.files[0]) return; t.textContent = '⏳ جاري الرفع…'; try { const s = await shrink(fi.files[0], +t.dataset.max || 1600), url = await raw(s); setp(D, t.dataset.img, url); changed(); } catch (er) { toast(er.message); } render(); }; fi.click(); }
    else if (t.dataset.vid) { const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'video/mp4,video/webm,video/quicktime'; fi.onchange = async () => { if (!fi.files[0]) return; t.textContent = '⏳ جاري الرفع…'; try { setp(D, t.dataset.vid, await raw(fi.files[0])); changed(); } catch (er) { toast(er.message); } render(); }; fi.click(); }
    else if (t.dataset.novid) { setp(D, t.dataset.novid, ''); changed(); render(); }
    else if (t.dataset.add) { setp(D, t.dataset.add, [...getp(D, t.dataset.add), ADD[t.dataset.add]()]); changed(); render(); }
    else if (t.dataset.del) { if (!confirm('تمسح العنصر ده؟')) return; const [p, i] = t.dataset.del.split(':'), arr = getp(D, p), [it] = arr.splice(+i, 1); if (it) ['src', 'poster', 'video'].forEach(k => it[k] && String(it[k]).startsWith('/uploads/') && fDel(it[k].slice(1))); changed(); render(); }
    else if (t.dataset.mv) { const [p, i, d] = t.dataset.mv.split(':'), a = getp(D, p), j = +i + +d; if (j < 0 || j >= a.length) return; [a[+i], a[j]] = [a[j], a[+i]]; changed(); render(); }
    else if (t.dataset.cat) { curCat = t.dataset.cat; render(); }
    else if (t.hasAttribute('data-addcat')) { const id = uid(); D.works.categories.push({ id, name: B('New category', 'تصنيف جديد'), items: [] }); curCat = id; changed(); render(); }
    else if (t.hasAttribute('data-delcat')) { if (!confirm('تحذف التصنيف بكل أعماله؟')) return; D.works.categories = D.works.categories.filter(c => c.id !== curCat); curCat = null; changed(); render(); }
    else if (t.id === 'lnkAdd') { const items = $('#lnk').value.split('\n').map(parseLink).filter(Boolean); if (!items.length) return toast('الروابط مش مفهومة — الصق رابط Drive / YouTube / Vimeo'); D.works.categories.find(c => c.id === curCat).items.push(...items); changed(); toast(`اتضاف ${items.length} ✓`); render(); }
    else if (t.id === 'drop') $('#fi').click();
    else if (t.id === 'ghsave') { localStorage.setItem('mk-gh', JSON.stringify({ repo: $('#ghr').value.trim(), branch: $('#ghb').value.trim() || 'main', token: $('#ght').value.trim() })); toast('✓ اتحفظ'); render(); }
    else if (t.id === 'ghkey') { const tk = $('#ght').value.trim(), pw = $('#ghpw').value; if (!tk) return toast('الصق المفتاح الأول'); if (pw.length < 8) return toast('كلمة السر لازم ٨ حروف على الأقل'); const f = await sealKey({ repo: $('#ghr').value.trim(), branch: $('#ghb').value.trim() || 'main', token: tk }, pw); dl(new Blob([JSON.stringify(f)], { type: 'application/json' }), 'admin-key.json'); toast('✓ حطه في فولدر public وارفعه'); }
    else if (t.id === 'imp') $('#impf').click();
    else if (t.id === 'bak') dl(new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' }), 'content-backup.json');
    else if (t.id === 'rst') { if (!confirm('تمسح كل التعديلات المحفوظة على الجهاز ده؟')) return; await kvSet('content', null); for (const [n] of await fGetAll()) await fDel(n); location.reload(); }
  };
  m.onchange = async e => { if (e.target.id === 'impf' && e.target.files[0]) { try { const j = JSON.parse(await e.target.files[0].text()); if (j.brand && j.hero && j.works) D = j; else if (j.team || j.testimonials) { if (j.team) { const old = (D.team && D.team.members) || [], ms = (j.team.members || []).map(m => { const o = old.find(x => x.id === m.id) || {}; return { ...o, ...m, photo: m.photo || o.photo || '' }; }); D.team = { ...D.team, ...j.team, members: ms }; } if (j.testimonials) D.testimonials = { ...D.testimonials, ...j.testimonials }; } else throw 0; await save(); toast('تم الاستيراد ✓'); render(); } catch { toast('الملف مش content.json صالح'); } e.target.value = ''; return; } if (e.target.id === 'fi') { handleFiles([...e.target.files], tab === 'works' ? 'works' : 'logos'); e.target.value = ''; } };
  m.ondragover = e => { const d = e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.add('over'); } };
  m.ondragleave = e => { const d = e.target.closest('#drop'); if (d) d.classList.remove('over'); };
  m.ondrop = e => { const d = e.target.closest('#drop'); if (d) { e.preventDefault(); d.classList.remove('over'); handleFiles([...e.dataTransfer.files], tab === 'works' ? 'works' : 'logos'); } };
}
function render() {
  $('#tabs').innerHTML = GROUPS.map(([g, it]) => `<div class="grp">${g}</div>` + it.map(([k, i, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}"><span>${i}</span>${n}</button>`).join('')).join('');
  const y = scrollY; $('#main').innerHTML = VIEWS[tab](); scrollTo(0, y); 
}
$('#main').addEventListener('click', e => { const q = e.target.closest('.qk'); if (q) { tab = q.dataset.t; render(); scrollTo(0, 0); } });
$('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; render(); scrollTo(0, 0); } };

/* ---------- ZIP (بدون ضغط) + تصدير ---------- */
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = crcT[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
async function makeZip(entries) { // [{name, data:Uint8Array}]
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
  for (const { name, data } of entries) {
    const nm = enc.encode(name), crc = crc32(data), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
    parts.push(h.buffer, nm, data);
    const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    cd.push(c.buffer, nm); off += 30 + nm.length + data.length;
  }
  const cdLen = cd.reduce((a, b) => a + (b.byteLength || b.length), 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, cdLen, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cd, e.buffer], { type: 'application/zip' });
}
const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); };
const pubBadge = () => { const b = $('#pub'); if (!b) return; let d = false; try { d = localStorage.getItem('mk-dirty') === '1'; } catch {} b.textContent = d ? '⚠ فيه تعديلات لسه ما اتنشرتش' : '✓ مفيش تعديلات معلّقة'; b.className = 'pub ' + (d ? 'dirty' : 'clean'); };
const GH = () => { try { return JSON.parse(localStorage.getItem('mk-gh') || 'null'); } catch { return null; } };
const b64 = async blob => { const u = new Uint8Array(await blob.arrayBuffer()); let o = ''; for (let i = 0; i < u.length; i += 0x8000) o += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(o); };
async function publishGH() {
  const g = GH(); if (!g || !g.token) { tab = 'settings'; render(); scrollTo(0, 0); return toast('الصق مفتاح النشر الأول (مرة واحدة)'); }
  const btn = $('#exp'); btn.disabled = true;
  const api = async (p, o = {}) => { const r = await fetch('https://api.github.com/repos/' + g.repo + p, { ...o, headers: { Authorization: 'Bearer ' + g.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }); if (!r.ok) { let m = ''; try { m = (await r.json()).message; } catch {} throw new Error(r.status === 401 ? 'المفتاح غلط أو منتهي' : r.status === 404 ? 'الريبو أو المفتاح مش مظبوط' : r.status + ' ' + m); } return r.json(); };
  try {
    status('جاري النشر…'); await save();
    const json = JSON.stringify(D, null, 2); let done = []; try { done = JSON.parse(localStorage.getItem('mk-pubd') || '[]'); } catch {}
    const files = (await fGetAll()).filter(([n]) => json.includes('/' + n) && !done.includes(n));
    const ref = await api('/git/ref/heads/' + g.branch), base = await api('/git/commits/' + ref.object.sha);
    const tree = [{ path: 'public/content.json', mode: '100644', type: 'blob', content: json }]; let k = 0;
    for (const [n, b] of files) { status(`رفع الملفات ${++k}/${files.length}…`); const bl = await api('/git/blobs', { method: 'POST', body: JSON.stringify({ content: await b64(b), encoding: 'base64' }) }); tree.push({ path: 'public/' + n, mode: '100644', type: 'blob', sha: bl.sha }); }
    const nt = await api('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
    const cm = await api('/git/commits', { method: 'POST', body: JSON.stringify({ message: 'تحديث من لوحة التحكم', tree: nt.sha, parents: [ref.object.sha] }) });
    await api('/git/refs/heads/' + g.branch, { method: 'PATCH', body: JSON.stringify({ sha: cm.sha }) });
    localStorage.setItem('mk-pubd', JSON.stringify([...done, ...files.map(f => f[0])])); localStorage.setItem('mk-dirty', '0'); pubBadge();
    status('✓ اتنشر — الموقع هيتحدّث خلال دقيقة', 'ok'); toast('✓ اتنشر — الموقع هيتحدّث خلال دقيقة');
  } catch (e) { status('فشل النشر ✕ ' + e.message, 'bad'); toast('فشل النشر: ' + e.message); }
  btn.disabled = false;
}
async function exportSite() {
  status('جاري تجهيز الملف…'); const json = JSON.stringify(D, null, 2), files = await fGetAll(), used = files.filter(([n]) => json.includes('/' + n));
  const entries = [{ name: 'content.json', data: new TextEncoder().encode(json) }];
  for (const [n, b] of used) entries.push({ name: n, data: new Uint8Array(await b.arrayBuffer()) });
  dl(await makeZip(entries), 'motakamel-publish.zip'); status(`اتصدّر ✓ (${used.length} ملف) — انسخهم جوه public وارفع`, 'ok'); $('#exp')?.classList.remove('hot'); try { localStorage.removeItem('mk-dirty'); } catch {} pubBadge();
}
/* ---------- start ---------- */
async function start() {
  try { LIVE = (await fetch('/__api/ping', { cache: 'no-store' })).ok; } catch { LIVE = false; }
  let d = LIVE ? null : await kvGet('content');
  if (!d) { for (const u of ['/content.json', '/default-content.json']) { try { const r = await fetch(u, { cache: 'no-store' }); if (r.ok) { d = await r.json(); break; } } catch {} } }
  D = d; if (!D) { document.body.textContent = 'تعذّر تحميل المحتوى'; return; }
  D.hero.slides = D.hero.slides || []; D.hero.slideMode = D.hero.slideMode || 'custom'; D.hero.interval = D.hero.interval || 4; D.band = D.band || {}; D.band.text = D.band.text || { en: '', ar: '' }; D.about = D.about || {}; for (const k of ['title', 'text', 'more']) D.about[k] = D.about[k] || { en: '', ar: '' }; D.offices = D.offices || [];
  for (const [n, b] of await fGetAll()) PENDING['/' + n] = URL.createObjectURL(b);
  $('#app').hidden = false; status(LIVE ? '● متصل بملفات الموقع — كل تعديل بيتحفظ مباشرة' : 'جاهز', LIVE ? 'ok' : ''); if (LIVE) { $('#exp').style.display = 'none'; $('#pub').style.display = 'none'; } bind(); render(); if (!LIVE) $('#exp').textContent = '🚀 نشر الموقع'; $('#exp').onclick = LIVE ? exportSite : publishGH; $('#prev').onclick = () => window.open(LIVE ? '/' : '/?preview=1', '_blank'); pubBadge();
}

/* ---------- كلمة سر الأدمن ---------- */
const kdf = async (pw, salt) => crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
const toB = u => btoa(String.fromCharCode(...u)), fromB = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
const sealKey = async (obj, pw) => { const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await kdf(pw, salt), new TextEncoder().encode(JSON.stringify(obj)))); return { v: 1, salt: toB(salt), iv: toB(iv), ct: toB(ct) }; };
const openKey = async (f, pw) => JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB(f.iv) }, await kdf(pw, fromB(f.salt)), fromB(f.ct))));
// لو فيه admin-key.json: كلمة السر بتفك تشفير مفتاح النشر وبتحفظه تلقائي على الجهاز (null = مفيش ملف)
const keyLogin = async pw => { let f; try { const r = await fetch('/admin-key.json', { cache: 'no-store' }); if (!r.ok) return null; f = await r.json(); if (!f.ct) return null; } catch { return null; } try { const c = await openKey(f, pw); localStorage.setItem('mk-gh', JSON.stringify(c)); return true; } catch { return false; } };
const PW_HASH = '41f0dae57fff6926face689f438eaf398ef9bbff2719b8f8c348e9ec54b30f8e';
const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
function gate() {
  let ok = false; try { ok = sessionStorage.getItem('mk-auth') === PW_HASH; } catch {}
  if (ok) return start();
  const g = document.createElement('div');
  g.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#05060f;font-family:Cairo,sans-serif;direction:rtl';
  g.innerHTML = '<form style="width:min(380px,90vw);padding:34px;border-radius:22px;background:#0d1030;border:1px solid #232850;text-align:center;color:#fff"><img src="/assets/logo-mark.png" width="54" alt=""><h2 style="margin:14px 0 4px">لوحة التحكم</h2><p style="color:#8b93b8;margin:0 0 22px;font-size:14px">اكتب كلمة السر عشان تدخل</p><input id="pw" type="password" autocomplete="current-password" placeholder="كلمة السر" style="width:100%;padding:14px;border-radius:12px;border:1px solid #2b3160;background:#070920;color:#fff;font:inherit;text-align:center;outline:none"><button style="margin-top:14px;width:100%;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#22d3ee);color:#fff;font:700 15px Cairo,sans-serif;cursor:pointer">دخول</button><div id="pe" style="color:#fb7185;margin-top:12px;min-height:20px;font-size:13px"></div></form>';
  document.body.append(g); const f = g.querySelector('form'), pw = g.querySelector('#pw'); pw.focus();
  f.onsubmit = async e => { e.preventDefault(); const pe = g.querySelector('#pe');
    if (!crypto.subtle) { pe.textContent = 'افتح الأدمن من https أو localhost'; return; }
    const kl = await keyLogin(pw.value);
    if (kl === true || (kl === null && await sha(pw.value) === PW_HASH)) { try { sessionStorage.setItem('mk-auth', PW_HASH); } catch {} g.remove(); start(); }
    else { pe.textContent = 'كلمة السر غلط'; pw.value = ''; f.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 250 }); } };
}
gate();
})();
