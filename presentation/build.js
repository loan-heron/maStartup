// Export PDF : node build.js  →  FrigoFlash.pdf + FrigoFlash-notes-oral.pdf (version 10 min, index.html)
//                                 FrigoFlash-long.pdf + FrigoFlash-long-notes-oral.pdf (version 28 slides, index-long.html)
// OUT=dossier pour changer le dossier de sortie (par défaut : ce dossier).
const { chromium } = require('playwright');
const path = require('path');
const OUT = process.env.OUT || __dirname;
const VERSIONS = [["index.html", "FrigoFlash"], ["index-long.html", "FrigoFlash-long"]];
(async () => {
  const b = await chromium.launch();
  for (const [src, name] of VERSIONS) {
    const url = 'file://' + path.join(__dirname, src);
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    p.on('pageerror', e => console.log('ERR', src, e.message));
    p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', src, m.text()); });
    await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
    await p.pdf({ path: path.join(OUT, name + '.pdf'), width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
    const n = await b.newPage();
    n.on('pageerror', e => console.log('ERR notes', src, e.message));
    await n.goto(url + '#notes', { waitUntil: 'networkidle' }); await n.evaluate(() => document.fonts.ready); await n.waitForTimeout(300);
    await n.pdf({ path: path.join(OUT, name + '-notes-oral.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log('ok', name);
  }
  await b.close();
})();
