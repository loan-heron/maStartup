// Export PDF : node build.js  →  ../FrigoFlash.pdf + ../FrigoFlash-notes-oral.pdf
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const url = 'file://' + path.join(__dirname, 'index.html');
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.pdf({ path: path.join(__dirname, process.env.OUT || '..', 'FrigoFlash.pdf'), width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
  const n = await b.newPage();
  n.on('pageerror', e => console.log('ERR notes', e.message));
  await n.goto(url + '#notes', { waitUntil: 'networkidle' }); await n.evaluate(() => document.fonts.ready); await n.waitForTimeout(300);
  await n.pdf({ path: path.join(__dirname, process.env.OUT || '..', 'FrigoFlash-notes-oral.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close(); console.log('ok');
})();
