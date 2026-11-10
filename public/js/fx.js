/* MOTAKAMEL — background FX (particles + cursor spotlight), scroll progress, magnetic buttons, tilt, hero parallax */
(() => {
try { const q = new URLSearchParams(location.search).get('bg'); if (q !== null) localStorage.setItem('mk-bg5', q); document.documentElement.dataset.bg = localStorage.getItem('mk-bg5') || '3'; } catch { document.documentElement.dataset.bg = '3'; }
const $ = s => document.querySelector(s), root = document.documentElement;
const fine = matchMedia('(pointer:fine)').matches, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
let mx = innerWidth / 2, my = innerHeight * .3, sx = mx, sy = my;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

/* scroll progress */
const prog = $('#prog');
const onScroll = () => { const h = root.scrollHeight - innerHeight; if (prog) prog.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
if (reduce) return;

/* particles + spotlight */
const spot = $('.bg .spot'), cv = $('#bgc'), ctx = cv && cv.getContext('2d');
let W, H, DPR, parts = [], C = ['#22d3ee', '#2563eb', '#ffffff'];
function size() {
  DPR = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const n = W < 700 ? 24 : Math.min(72, Math.round(W / 20));
  parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.5 + .5, c: Math.random() * 3 | 0 }));
}
let k = 0;
function frame() {
  requestAnimationFrame(frame); if (document.hidden) return;
  sx += (mx - sx) * .07; sy += (my - sy) * .07;
  if (spot) { spot.style.setProperty('--sx', sx + 'px'); spot.style.setProperty('--sy', sy + 'px'); }
  root.style.setProperty('--px', (mx / innerWidth - .5).toFixed(3)); root.style.setProperty('--py', (my / innerHeight - .5).toFixed(3));
  if (!ctx) return;
  if (k++ % 90 === 0) { const cs = getComputedStyle(root); C = [cs.getPropertyValue('--b').trim() || '#22d3ee', cs.getPropertyValue('--a').trim() || '#2563eb', '#ffffff']; }
  ctx.clearRect(0, 0, W, H);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
    const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 150 && fine) { p.x += dx / d * .6; p.y += dy / d * .6; }
  }
  ctx.lineWidth = 1;
  for (let i = 0; i < parts.length; i++) {
    const a = parts[i]; ctx.fillStyle = C[a.c]; ctx.globalAlpha = .55; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    for (let j = i + 1; j < parts.length; j++) { const b = parts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 125) { ctx.globalAlpha = (1 - d / 125) * .17; ctx.strokeStyle = C[0]; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    if (fine) { const d = Math.hypot(a.x - mx, a.y - my); if (d < 190) { ctx.globalAlpha = (1 - d / 190) * .35; ctx.strokeStyle = C[1] === '#2563eb' ? '#7dd3fc' : C[1]; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); } }
  }
  ctx.globalAlpha = 1;
}
if (cv) { size(); addEventListener('resize', size); requestAnimationFrame(frame); }

if (!fine) return;
/* magnetic buttons + card tilt (event delegation: survives re-render / language switch) */
let mag = null, tilt = null;
addEventListener('pointermove', e => {
  const m = e.target.closest && e.target.closest('.btn,.lang,.cfn,.so a,.tab');
  if (mag && mag !== m) { mag.style.translate = ''; mag = null; }
  if (m) { const r = m.getBoundingClientRect(); m.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px`; mag = m; }
  const t = e.target.closest && e.target.closest('.tm');
  if (tilt && tilt !== t) { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); tilt.classList.remove('tt'); tilt = null; }
  if (t) { const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; t.style.setProperty('--rx', ((.5 - py) * 11).toFixed(2) + 'deg'); t.style.setProperty('--ry', ((px - .5) * 13).toFixed(2) + 'deg'); t.style.setProperty('--gx', (px * 100) + '%'); t.style.setProperty('--gy', (py * 100) + '%'); t.classList.add('tt'); tilt = t; }
}, { passive: true });
})();
