(() => {
const { $, $$, esc, t, ui, icon } = MK;

function hero(c) {
  const H = c.hero, slides = [];
  const custom = H.slideMode !== 'auto' ? (H.slides || []).filter(x => x.src || x.video).map(x => ({ th: x.src ? (/^(https?:|\/|data:)/.test(x.src) ? x.src : '/' + x.src) : '', vd: x.video ? (/^(https?:|\/|data:)/.test(x.video) ? x.video : '/' + x.video) : '', cat: t(x.cap) })) : [];
  if (custom.length) slides.push(...custom);
  else (c.works.categories || []).forEach(cat => (cat.items || []).forEach(it => { const th = MK.thumb(it); if (th && slides.length < 7 && !slides.some(x => x.th === th)) slides.push({ th, cat: t(cat.name) }); }));
  const soc = MK.socials((c.contact || {}).socials);
  return `<section class="hero2" id="top" data-iv="${Math.max(2, +H.interval || 4) * 1000}">
    <div class="sr-wrap"><div class="srl" id="sr">${slides.map((x, i) => `<div class="sl ${i ? '' : 'on'}" data-cap="${esc(x.cat || '')}">${x.vd ? `<video src="${esc(x.vd)}" ${x.th ? `poster="${esc(x.th)}"` : ''} muted loop playsinline preload="${i ? 'none' : 'auto'}"></video>` : `<img src="${esc(x.th)}" alt="" ${i ? 'loading="lazy"' : ''}>`}</div>`).join('')}<div class="sr-sh"></div>
      <div class="sr-cap"><div class="sr-tt"><span class="sr-n"><b id="srn">01</b> / ${String(slides.length || 1).padStart(2, '0')}</span><strong id="srt">${esc(slides[0] ? slides[0].cat : '')}</strong></div>
      ${slides.length > 1 ? `<div class="sr-nav"><div class="sr-bars">${slides.map((_, i) => `<button type="button" data-i="${i}" aria-label="${i + 1}" class="${i ? '' : 'on'}"><i></i></button>`).join('')}</div><button type="button" class="sr-ar" data-d="-1" aria-label="prev">‹</button><button type="button" class="sr-ar" data-d="1" aria-label="next">›</button></div>` : ''}</div></div></div>${soc ? `<div class="sr-so so">${soc}</div>` : ''}</div>
    <div class="wrap h2t"><div class="reveal"><span class="eyebrow"><i class="dot"></i>${esc(t(H.badge))}</span>
      <h1>${esc(t(H.title1))} <em>${esc(t(H.title2))}</em></h1>
      <p class="sub">${esc(t(H.sub))}</p>
      <div class="ctas"><a class="btn p" href="#contact">${esc(t(H.cta1))} <span class="arr">${icon('arrow')}</span></a><a class="btn g" href="#works">${esc(t(H.cta2))}</a></div></div></div></section>`;
}
function studio(c) {
  const it = (c.services.items || []).slice(0, 4), cols = ['#2563eb', '#22d3ee', '#4f46e5', '#7dd3fc'], logo = esc(c.brand.logo || '/assets/logo-mark.png');
  const clips = [[6, 34], [38, 24], [18, 30], [52, 36]];
  return `<div class="st-scene">
    <div class="sw sw-view"><div class="sw-bar"><i></i><i></i><i></i><span>COMP 01 — ${esc(c.brand.name)}</span><em class="rec"><u></u>REC</em></div>
      <div class="vw"><div class="orb"><s></s><s></s><s></s></div><img class="vlogo" src="/assets/logo-mark.png" alt=""><i class="cm tl"></i><i class="cm tr"></i><i class="cm bl"></i><i class="cm br"></i><div class="safe"></div><span class="tc" id="tc">00:00:00:00</span><span class="fps">24 FPS · 4K</span></div></div>
    <div class="sw sw-ease"><div class="sw-bar"><i></i><i></i><i></i><span>GRAPH EDITOR</span></div>
      <svg viewBox="0 0 200 130" class="ge"><g class="grid">${[26, 52, 78, 104].map(y => `<path d="M0 ${y}H200"/>`).join('')}${[50, 100, 150].map(x => `<path d="M${x} 0V130"/>`).join('')}</g>
      <path id="gp" class="gcurve" d="M14 116C70 116 60 14 186 14"/><path id="gh1" class="gh" d="M14 116L70 116"/><path id="gh2" class="gh" d="M186 14L60 14"/>
      <circle class="gdot" r="5"><animateMotion dur="3.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".5 0 .2 1"><mpath href="#gp"/></animateMotion></circle>
      <rect x="11" y="113" width="6" height="6" class="ga"/><rect x="183" y="11" width="6" height="6" class="ga"/>
      <circle id="gc1" class="gk" cx="70" cy="116" r="6"/><circle id="gc2" class="gk" cx="60" cy="14" r="6"/></svg></div>
    <div class="sw sw-pal"><div class="sw-bar"><i></i><i></i><i></i><span>COLOR</span></div><div class="pal">${['#fff', '#bfe9ff', '#22d3ee', '#2563eb', '#0a2a7a', '#000'].map(x => `<b style="background:${x}"></b>`).join('')}</div>
      <div class="lay">${it.map((x, i) => `<span style="--c:${cols[i]}"><i></i>${esc(t(x.title))}</span>`).join('')}</div></div>
    <div class="sw sw-tl"><div class="sw-bar"><i></i><i></i><i></i><span>TIMELINE</span></div>
      <div class="tlw">${it.map((x, i) => `<div class="tkr"><span>${esc(t(x.title))}</span><div><b style="left:${clips[i][0]}%;width:${clips[i][1]}%;--c:${cols[i]};animation-delay:${-i * 1.3}s"></b></div></div>`).join('')}<u class="head"></u></div></div>
    <svg class="orbit" viewBox="0 0 100 100"><path d="M5 80C20 20 60 110 95 20" /></svg>
  </div>`;
}
function clients(c) {
  const l = c.clients.logos || []; if (!l.length) return '';
  let row = l.slice(); while (row.length < 8) row = row.concat(l);
  const track = [...row, ...row].map(x => `<img src="${esc(x.src)}" alt="${esc(x.name || '')}" loading="lazy">`).join('');
  return `<div class="mq"><div class="wrap"><p>${esc(t(c.clients.title))}</p></div><div class="tr"><div class="tk">${track}</div></div></div>`;
}
const TL = '<div class="tl" aria-hidden="true"><div class="win"><div class="bar"><i></i><i></i><i></i></div>' +
  [[['4%', '30%', '#2563eb'], ['34%', '22%', '#22d3ee'], ['60%', '34%', '#6366f1']], [['10%', '18%', '#0ea5e9'], ['30%', '40%', '#2563eb'], ['74%', '20%', '#22d3ee']], [['2%', '46%', '#4f46e5'], ['52%', '40%', '#0891b2']]]
    .map(r => `<div class="tr">${r.map(([l, w, col]) => `<b style="left:${l};width:${w};--c:${col}"></b>`).join('')}</div>`).join('') + '<i class="ph"></i></div></div>';
function services(c) {
  const it = c.services.items || [];
  return `<section id="services"><div class="wrap"><div class="sh reveal"><h2>${esc(t(c.services.title))}</h2><p>${esc(t(c.services.sub))}</p></div>
    <div class="svl reveal"><ul>${it.map((s, i) => `<li class="${i ? '' : 'on'}" data-i="${i}" tabindex="0"><small>${String(i + 1).padStart(2, '0')}</small><span>${esc(t(s.title))}</span></li>`).join('')}</ul>
    <div class="svp">${it.map((s, i) => `<div class="pn ${i ? '' : 'on'}" data-i="${i}"><div class="pn-sh ${s.video || s.src ? 'has' : ''}">${s.video ? `<video src="${esc(MK.asset ? MK.asset(s.video) : /^(https?:|\/)/.test(s.video) ? s.video : '/' + s.video)}" ${s.src ? `poster="${esc(/^(https?:|\/)/.test(s.src) ? s.src : '/' + s.src)}"` : ''} muted loop autoplay playsinline preload="metadata"></video>` : s.src ? `<img src="${esc(/^(https?:|\/)/.test(s.src) ? s.src : '/' + s.src)}" alt="" loading="lazy">` : `<div class="pn-ic">${icon(s.icon)}</div>`}<b>${String(i + 1).padStart(2, '0')}</b></div><p>${esc(t(s.desc))}</p><a class="btn p sm" href="#contact">${esc(ui('more') || '')} <span class="arr">${icon('arrow')}</span></a></div>`).join('')}</div></div></div></section>`;
}
function band(c) {
  const w = (c.band && t(c.band.text)) || `${t(c.hero.title1)} ${t(c.hero.title2)}`.replace(/[.،]/g, ''), n = c.brand.name;
  const row = Array.from({ length: 4 }, () => `<span>${esc(w)}</span><i>✦</i><span class="o">${esc(n)}</span><i>✦</i>`).join('');
  return `<div class="band" aria-hidden="true"><div class="bt">${row}${row}</div></div>`;
}
function works(c) {
  const cats = c.works.categories.filter(x => x.items && x.items.length);
  return `<section id="works"><div class="wrap"><div class="sh c reveal"><h2>${esc(t(c.works.title))}</h2><p>${esc(t(c.works.sub))}</p></div>
    ${cats.length > 1 ? `<div class="tabs reveal">${cats.map((x, i) => `<button class="tab ${i ? '' : 'on'}" data-c="${esc(x.id)}">${esc(t(x.name))}</button>`).join('')}</div>` : ''}
    <div id="cfBox" class="reveal"></div></div></section>`;
}
function process(c) {
  return `<section id="process"><div class="wrap"><div class="sh c reveal"><h2>${esc(t(c.process.title))}</h2><p>${esc(t(c.process.sub))}</p></div>
    <div class="steps">${c.process.items.map((s, i) => `<div class="st reveal" style="transition-delay:${i * 90}ms"><div class="n">${icon(s.icon)}</div><small>0${i + 1}</small><h3>${esc(t(s.title))}</h3><p>${esc(t(s.desc))}</p></div>`).join('')}</div></div></section>`;
}
const DEF_ABOUT = { title: { en: 'About MOTAKAMEL', ar: 'عن متكامل' }, text: { en: 'We are a full-service digital media agency. Video editing, motion graphics, branding, social media, ads and web — one team that takes your idea from the first sketch to the final frame, in any language and for any market.', ar: 'إحنا وكالة إعلام رقمي متكاملة. مونتاج فيديو، موشن جرافيك، هوية بصرية، سوشيال ميديا، إعلانات وويب — فريق واحد ياخد فكرتك من أول اسكتش لحد آخر فريم، بأي لغة ولأي سوق.' }, more: { en: 'Meet the team', ar: 'قابل الفريق' } };
function stats(c) {
  const A = c.about || {}, a = Object.fromEntries(Object.keys(DEF_ABOUT).map(k => [k, t(A[k]) ? A[k] : DEF_ABOUT[k]]));
  return `<section id="about"><div class="wrap ab"><div class="reveal"><div class="sh"><h2>${esc(t(a.title))}</h2></div><p class="lead">${esc(t(a.text))}</p><a class="btn g" href="/team">${esc(t(a.more) || '')} <span class="arr">${icon('arrow')}</span></a></div>
    <div class="stats">${c.stats.items.map((s, i) => `<div class="stat reveal" style="transition-delay:${i * 80}ms"><b class="grad" data-to="${+s.value || 0}" data-suf="${esc(s.suffix || '')}">0${esc(s.suffix || '')}</b><span>${esc(t(s.label))}</span></div>`).join('')}</div></div></section>`;
}
function offices(c) {
  const o = (c.offices || []).filter(x => t(x.city));
  if (!o.length) return '';
  return `<section id="offices" style="padding-bottom:0"><div class="wrap"><div class="of">${o.map((x, i) => `<div class="of-c reveal" style="transition-delay:${i * 80}ms"><span class="of-i">${icon('globe')}</span><b>${esc(t(x.city))}</b><small>${esc(t(x.address) || '')}</small>${x.phone ? `<a href="tel:${esc(String(x.phone).replace(/\s/g, ''))}" dir="ltr">${esc(x.phone)}</a>` : ''}</div>`).join('')}</div></div></section>`;
}
MK.memberCard = (m, i = 0) => `<article class="tm reveal" style="transition-delay:${(i % 4) * 90}ms"><div class="gl"></div><div class="ph"><img src="${esc(m.photo)}" alt="${esc(t(m.name))}" loading="lazy"><span class="no">${String(i + 1).padStart(2, '0')}</span>${m.dept ? `<span class="dp-t">${esc(((ui('dept') || {})[m.dept]) || m.dept)}</span>` : ''}${t(m.bio) ? `<div class="ov">${esc(t(m.bio))}</div>` : ''}</div>
  <div class="bd"><h3>${esc(t(m.name))}</h3><p>${esc(t(m.role))}</p>${MK.socials(m.links) ? `<div class="so">${MK.socials(m.links)}</div>` : ''}</div></article>`;
function team(c) {
  const m = (c.team.members || []).slice(0, 4); if (!m.length) return '';
  return `<section id="team"><div class="wrap"><div class="sh c reveal"><h2>${esc(t(c.team.title))}</h2><p>${esc(t(c.team.sub))}</p></div>
    <div class="tg">${m.map((x, i) => MK.memberCard(x, i)).join('')}</div><div class="more reveal"><a class="btn g" href="/team">${ui('seeTeam')} <span class="arr">${icon('arrow')}</span></a></div></div></section>`;
}
function testimonials(c) {
  const it = c.testimonials.items || []; if (!it.length) return '';
  return `<section><div class="wrap"><div class="sh c reveal"><h2>${esc(t(c.testimonials.title))}</h2></div><div class="tsg">${it.map((x, i) => `<div class="ts reveal" style="transition-delay:${i * 90}ms"><q>${esc(t(x.text))}</q><div class="who"><div class="av">${x.avatar ? `<img src="${esc(x.avatar)}" alt="">` : esc((t(x.name) || '?').trim()[0] || '?')}</div><div><b>${esc(t(x.name))}</b><span>${esc(t(x.role))}</span></div></div></div>`).join('')}</div></div></section>`;
}
function faq(c) {
  const it = c.faq.items || []; if (!it.length) return '';
  return `<section><div class="wrap"><div class="sh c reveal"><h2>${esc(t(c.faq.title))}</h2></div><div class="faq">${it.map(x => `<details class="reveal"><summary>${esc(t(x.q))}</summary><p>${esc(t(x.a))}</p></details>`).join('')}</div></div></section>`;
}
function cta(c) {
  return `<section style="padding-block:40px"><div class="wrap"><div class="cta reveal"><h2>${esc(t(c.cta.title))}</h2><p>${esc(t(c.cta.sub))}</p><a class="btn" href="#contact">${esc(t(c.cta.button))} <span class="arr">${icon('arrow')}</span></a></div></div></section>`;
}
const render = c => { const on = k => !(c.sections && c.sections[k] === false); return hero(c) + (on('clients') ? clients(c) : '') + (on('about') ? stats(c) : '') + (on('services') ? services(c) : '') + (on('works') ? works(c) : '') + (on('band') ? band(c) : '') + (on('process') ? process(c) : '') + (on('team') ? team(c) : '') + (on('testimonials') ? testimonials(c) : '') + (on('faq') ? faq(c) : '') + (on('cta') ? cta(c) : '') + (on('offices') ? offices(c) : '') + `<section id="contact"><div class="wrap">${MK.contactHTML()}</div></section>`; };

/* ---- coverflow (9:16 reels) ---- */
function coverflow(root, cat) {
  const items = cat.items, n = items.length;
  root.innerHTML = `<div class="cf">${items.map((it, i) => `<div class="cf-card" data-i="${i}" role="button" tabindex="0" aria-label="${esc(t(it.title) || ui('watch'))}">${MK.cardMedia(it)}${t(it.title) ? `<div class="cf-cap">${esc(t(it.title))}</div>` : ''}</div>`).join('')}
    <button class="cfn pv" aria-label="prev">‹</button><button class="cfn nx" aria-label="next">›</button></div><div class="dots">${items.map(() => '<i></i>').join('')}</div>`;
  const cards = $$('.cf-card', root), dots = $$('.dots i', root), cf = $('.cf', root), half = Math.floor(n / 2);
  let cur = Math.min(1, n - 1), timer, down = null, moved = 0;
  const layout = () => {
    const w = cards[0].offsetHeight * .5625;
    cards.forEach((c, i) => {
      let o = i - cur; if (n > 1) { o = ((o + half) % n + n) % n - half; if (n % 2 === 0 && o === -half) o = half; }
      const a = Math.abs(o), vis = a <= 3;
      c.style.transform = `translate(-50%,-50%) translateX(${o * w * .74}px) translateZ(${-a * 140}px) rotateY(${-o * 26}deg) scale(${1 - a * .06})`;
      c.style.zIndex = 50 - a; c.style.opacity = vis ? 1 - a * .22 : 0; c.style.pointerEvents = vis ? 'auto' : 'none';
      c.style.filter = a ? `brightness(${1 - a * .2}) blur(${a > 1 ? 1 : 0}px)` : 'none'; c.classList.toggle('c', !o);
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  };
  const go = d => { cur = ((cur + d) % n + n) % n; layout(); };
  const auto = () => { clearInterval(timer); timer = setInterval(() => { if (!document.hidden && n > 1 && !$('#lb').hidden === false) go(1); }, 4200); };
  $('.pv', root).onclick = () => { go(-1); auto(); }; $('.nx', root).onclick = () => { go(1); auto(); };
  cf.addEventListener('pointerdown', e => { down = e.clientX; moved = 0; clearInterval(timer); });
  const mv = e => { if (down == null) return; moved = e.clientX - down; if (Math.abs(moved) > 60) { go(moved < 0 ? 1 : -1); down = e.clientX; moved = 99; } };
  const up = () => { if (down != null) { down = null; auto(); } };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
  cards.forEach((c, i) => { const act = () => { if (Math.abs(moved) > 10) return; if (i === cur) MK.openLB(items, i); else { cur = i; layout(); } }; c.onclick = act; c.onkeydown = e => { if (e.key === 'Enter') act(); }; });
  const rs = () => layout(); addEventListener('resize', rs); layout(); auto();
  return () => { clearInterval(timer); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('resize', rs); };
}

function studioInit(root) {
  const sc = $('.st-scene', root); if (!sc) return;
  const svg = $('.ge', sc), p = $('#gp', sc), h1 = $('#gh1', sc), h2 = $('#gh2', sc), c1 = $('#gc1', sc), c2 = $('#gc2', sc);
  let P1 = [70, 116], P2 = [60, 14], drag = null;
  const draw = () => { p.setAttribute('d', `M14 116C${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]} 186 14`); h1.setAttribute('d', `M14 116L${P1[0]} ${P1[1]}`); h2.setAttribute('d', `M186 14L${P2[0]} ${P2[1]}`); c1.setAttribute('cx', P1[0]); c1.setAttribute('cy', P1[1]); c2.setAttribute('cx', P2[0]); c2.setAttribute('cy', P2[1]); };
  const pt = e => { const r = svg.getBoundingClientRect(); return [Math.max(0, Math.min(200, (e.clientX - r.left) / r.width * 200)), Math.max(-10, Math.min(140, (e.clientY - r.top) / r.height * 130))]; };
  [c1, c2].forEach((c, i) => c.addEventListener('pointerdown', e => { drag = i; c.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); }));
  svg.addEventListener('pointermove', e => { if (drag === null) return; (drag ? P2 : P1).splice(0, 2, ...pt(e)); draw(); });
  svg.addEventListener('pointerup', () => { drag = null; });
  // ambient auto-wiggle until the user touches it
  let touched = false; svg.addEventListener('pointerdown', () => touched = true);
  let raf, t0 = performance.now(); const tc = $('#tc', sc), head = $('.head', sc);
  const loop = n => { raf = requestAnimationFrame(loop); const k = ((n - t0) / 9000) % 1, f = Math.floor(k * 24 * 12);
    if (tc) tc.textContent = `00:00:${String(Math.floor(f / 24)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`;
    if (head) head.style.left = `calc(${k} * (100% - 108px))`;
    if (!touched) { P1 = [70 + Math.sin(n / 1300) * 26, 116 - Math.cos(n / 1700) * 10]; P2 = [60 + Math.cos(n / 1500) * 24, 14 + Math.sin(n / 1100) * 12]; draw(); } };
  raf = requestAnimationFrame(loop); MK.cleanups.push(() => cancelAnimationFrame(raf));
}
const star = (c) => `<div class="s3 ${c}" aria-hidden="true"><div class="s3i">${Array.from({ length: 15 }, (_, i) => `<i style="--z:${(i - 7) * 2.6}px;--o:${i === 0 || i === 14 ? 1 : .42}"></i>`).join('')}</div></div>`;
function stars(root) {
  const put = (sel, cls) => { const e = $(sel, root); if (e && !e.querySelector('.s3')) { e.style.position = e.style.position || 'relative'; e.insertAdjacentHTML('beforeend', star(cls)); } };
  put('.hero', 'a'); put('#process', 'b'); put('.cta', 'c'); put('#team', 'd');
}
function after(root) {
  const sr = $('#sr', root); if (sr) { const im = $$('.sl', sr); let i = 0; const cap = $('#srn', root), tt = $('#srt', root), iv0 = +($('#top', root).dataset.iv) || 4000;
    const play = k => im.forEach((x, j) => { const v = x.querySelector('video'); if (!v) return; if (j === k) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); }); play(0);
    const bars = $$('.sr-bars button', root); let iv;
    const go = k => { im[i].classList.remove('on'); bars[i] && bars[i].classList.remove('on'); i = (k + im.length) % im.length; im[i].classList.add('on'); if (bars[i]) { void bars[i].offsetWidth; bars[i].classList.add('on'); } cap.textContent = String(i + 1).padStart(2, '0'); tt.textContent = im[i].dataset.cap || ''; play(i); };
    const auto = () => { clearInterval(iv); if (im.length > 1) iv = setInterval(() => go(i + 1), iv0); };
    if (im.length > 1) { sr.parentElement.style.setProperty('--iv', iv0 + 'ms'); bars.forEach(b => b.onclick = () => { go(+b.dataset.i); auto(); }); $$('.sr-ar', root).forEach(b => b.onclick = () => { go(i + +b.dataset.d); auto(); }); auto(); MK.cleanups.push(() => clearInterval(iv)); }
    const wrap = sr.parentElement, onS = () => { const k = Math.max(0, 1 - scrollY / (innerHeight * .55)); wrap.style.setProperty('--k', k.toFixed(3)); wrap.style.setProperty('--sc', (.9 + .1 * k).toFixed(3)); }; addEventListener('scroll', onS, { passive: true }); onS(); }
  const li = $$('.svl li', root), pn = $$('.svl .pn', root);
  const act = i => { li.forEach((x, k) => x.classList.toggle('on', k === i)); pn.forEach((x, k) => x.classList.toggle('on', k === i)); };
  li.forEach((x, i) => { x.onmouseenter = () => act(i); x.onfocus = () => act(i); x.onclick = () => act(i); });
  const c = MK.content, cats = c.works.categories.filter(x => x.items && x.items.length); let stop = () => {};
  const show = id => { stop(); const cat = cats.find(x => x.id === id) || cats[0]; if (cat) stop = coverflow($('#cfBox', root), cat); };
  $$('.tab', root).forEach(b => b.onclick = () => { $$('.tab', root).forEach(x => x.classList.toggle('on', x === b)); show(b.dataset.c); });
  show(cats[0] && cats[0].id); MK.cleanups.push(() => stop());
  // counters
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, to = +el.dataset.to, suf = el.dataset.suf, t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / 1800); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }), { threshold: .5 });
  $$('.stat b', root).forEach(b => io.observe(b)); MK.cleanups.push(() => io.disconnect());
  // scrollspy
  const links = $$('#nav a'), ids = ['services', 'works', 'process', 'team', 'contact'];
  const spy = () => { let cur = ''; ids.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) cur = id; }); links.forEach(a => a.classList.toggle('on', a.dataset.k === cur)); };
  addEventListener('scroll', spy, { passive: true }); spy(); MK.cleanups.push(() => removeEventListener('scroll', spy));
}
MK.boot('home', render, after);
})();
