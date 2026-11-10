(() => {
const { $, $$, esc, t, ui, icon } = MK;
let dept = 'all';
MK.memberCard = (m, i = 0) => `<article class="tm reveal" style="transition-delay:${(i % 4) * 90}ms"><div class="gl"></div><div class="ph"><img src="${esc(m.photo)}" alt="${esc(t(m.name))}" loading="lazy"><span class="no">${String(i + 1).padStart(2, '0')}</span>${m.dept ? `<span class="dp-t">${esc(((ui('dept') || {})[m.dept]) || m.dept)}</span>` : ''}${t(m.bio) ? `<div class="ov">${esc(t(m.bio))}</div>` : ''}</div>  <div class="bd"><h3>${esc(t(m.name))}</h3><p>${esc(t(m.role))}</p>${MK.socials(m.links) ? `<div class="so">${MK.socials(m.links)}</div>` : ''}</div></article>`;
function render(c) {
  const ms = c.team.members || [], depts = ['all', ...new Set(ms.map(m => m.dept).filter(Boolean))], label = d => (ui('dept') || {})[d] || d;
  const list = ms.filter(m => dept === 'all' || m.dept === dept);
  return `<section class="ph-hero"><div class="wrap"><span class="eyebrow">${icon('globe')} ${esc(c.brand.name)} ${esc(c.brand.tag)}</span><h1 class="grad" style="display:block">${esc(t(c.team.title))}</h1><p>${esc(t(c.team.sub))}</p></div></section>
    <section style="padding-top:0"><div class="wrap">${depts.length > 2 ? `<div class="dp">${depts.map(d => `<button class="tab ${d === dept ? 'on' : ''}" data-d="${esc(d)}">${esc(label(d))}</button>`).join('')}</div>` : '<div style="height:30px"></div>'}
    ${list.length ? `<div class="tg" id="tg">${list.map((x, i) => MK.memberCard(x, i)).join('')}</div>` : `<p class="empty">${ui('empty')}</p>`}
    <div class="cta reveal join"><h2>${ui('joinT')}</h2><p>${ui('joinS')}</p><a class="btn" href="/#contact">${esc(t(c.cta.button))} <span class="arr">${icon('arrow')}</span></a></div></div></section>`;
}
function after(root) {
  $$('.dp .tab', root).forEach(b => b.onclick = () => { dept = b.dataset.d; const y = scrollY; MK.apply(); scrollTo(0, y); });
}
MK.boot('team', render, after);
})();
