// سيرفر محلي: node serve.js  ثم افتح http://localhost:3000   (الأدمن: /admin)
// لما تشغّله كده، الأدمن بيحفظ التعديلات والصور مباشرة في ملفات المشروع (content.json و uploads/).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, 'public'), types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ico': 'image/x-icon' };
const local = req => /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress || '');
const body = req => new Promise((res, rej) => { const a = []; let n = 0; req.on('data', c => { n += c.length; if (n > 700e6) { rej(new Error('big')); req.destroy(); } else a.push(c); }); req.on('end', () => res(Buffer.concat(a))); req.on('error', rej); });
const json = (res, c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
  if (p.startsWith('/__api/')) {
    if (!local(req)) return json(res, 403, { error: 'local only' });
    try {
      if (p === '/__api/ping') return json(res, 200, { ok: true });
      if (p === '/__api/save' && req.method === 'POST') {
        const b = await body(req); JSON.parse(b.toString('utf8'));
        const f = path.join(root, 'content.json'); if (fs.existsSync(f)) fs.copyFileSync(f, path.join(root, 'content.backup.json'));
        fs.writeFileSync(f, b); return json(res, 200, { ok: true });
      }
      if (p === '/__api/upload' && req.method === 'POST') {
        const name = path.basename(u.searchParams.get('name') || 'file.bin').replace(/[^\w.؀-ۿ-]+/g, '-');
        fs.mkdirSync(path.join(root, 'uploads'), { recursive: true });
        fs.writeFileSync(path.join(root, 'uploads', name), await body(req)); return json(res, 200, { path: '/uploads/' + name });
      }
    } catch (e) { return json(res, 500, { error: String(e.message || e) }); }
    return json(res, 404, { error: 'not found' });
  }
  if (p.endsWith('/')) p += 'index.html';
  let f = path.join(root, p); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
}).listen(3000, () => console.log('الموقع:  http://localhost:3000\nالأدمن:  http://localhost:3000/admin'));
