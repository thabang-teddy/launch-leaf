const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const DOC  = String.raw`C:\Users\Teddy\projects\launch-leaf\documentation`;
const EDGE = String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`;
const NAVY = '#1B2B5E';
const ORA  = '#F05830';
const VB   = '-8 -8 80 80';

// ── Folders ────────────────────────────────────────────────────────
['logos/svg','logos/favicon','logos/web','logos/windows','logos/android','logos/linux']
  .forEach(d => fs.mkdirSync(path.join(DOC, d), { recursive: true }));

// ── SVG mark inner elements ────────────────────────────────────────
// viewBox "-8 -8 80 80" → navy 64×64 square at (0,0), white cut at (12,0),
// orange circle at (58,6) r=11 (the circle overflows the square corner slightly
// but the viewBox padding accommodates it)
function markInner(cutFill) {
  return `
  <rect x="0" y="0" width="64" height="64" rx="9" fill="${NAVY}"/>
  <rect x="12" y="0" width="52" height="52" rx="7" fill="${cutFill}"/>
  <circle cx="58" cy="6" r="11" fill="${ORA}"/>
  <path d="M58 -2 Q67 2 65 10 Q58 14 51 10 Q49 2 58 -2Z" fill="white"/>
  <line x1="58" y1="-1" x2="58" y2="13" stroke="${ORA}" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="58" y1="6" x2="52" y2="11" stroke="${ORA}" stroke-width="0.7" stroke-linecap="round"/>
  <line x1="58" y1="6" x2="64" y2="11" stroke="${ORA}" stroke-width="0.7" stroke-linecap="round"/>`;
}

const FONT_IMPORT = `<defs><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&amp;display=swap');</style></defs>`;
const FONT        = `'Inter',system-ui,sans-serif`;

// ── SVG source files ───────────────────────────────────────────────
console.log('Writing SVG source files...');

fs.writeFileSync(path.join(DOC, 'logos/svg/logo-mark.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="80" height="80">${markInner('white')}\n</svg>\n`);

fs.writeFileSync(path.join(DOC, 'logos/svg/logo-mark-on-dark.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="80" height="80">${markInner(NAVY)}\n</svg>\n`);

fs.writeFileSync(path.join(DOC, 'logos/svg/logo-horizontal.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 360 80" width="360" height="80">
  ${FONT_IMPORT}
  ${markInner('white')}
  <text x="80" y="50" font-family="${FONT}" font-size="40" font-weight="900" letter-spacing="-1" fill="${NAVY}">Launch</text>
  <text x="232" y="50" font-family="${FONT}" font-size="40" font-weight="900" letter-spacing="-1" fill="${ORA}">Leaf</text>
</svg>\n`);

fs.writeFileSync(path.join(DOC, 'logos/svg/logo-stacked.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 148" width="240" height="148">
  ${FONT_IMPORT}
  <g transform="translate(88,0)">${markInner('white')}\n  </g>
  <text x="120" y="92" text-anchor="middle" font-family="${FONT}" font-size="32" font-weight="900" letter-spacing="-0.5" fill="${NAVY}">Launch<tspan fill="${ORA}">Leaf</tspan></text>
  <text x="120" y="114" text-anchor="middle" font-family="${FONT}" font-size="10" font-weight="600" letter-spacing="2.5" fill="#888780">PORTFOLIO &amp; DASHBOARD</text>
</svg>\n`);

console.log('  ✓ logo-mark.svg');
console.log('  ✓ logo-mark-on-dark.svg');
console.log('  ✓ logo-horizontal.svg');
console.log('  ✓ logo-stacked.svg');

// ── Screenshot helper ──────────────────────────────────────────────
let seq = 0;
function makePng(inner, outFile, size, vb, bgColor) {
  const uid  = ++seq;
  const tmp  = path.join(DOC, `_tmp_${uid}.html`);
  const bg   = bgColor || 'white';

  fs.writeFileSync(tmp,
    `<!DOCTYPE html><html><head><meta charset="UTF-8">` +
    `<style>*{margin:0;padding:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:${bg}}</style>` +
    `</head><body>` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb || VB}">${inner}</svg>` +
    `</body></html>`);

  const args = [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${size},${size}`,
    `--screenshot=${outFile}`,
    `file:///${tmp.replace(/\\/g, '/')}`,
  ];

  const result = spawnSync(EDGE, args, { timeout: 20000 });
  try { fs.unlinkSync(tmp); } catch (_) {}

  const exists = fs.existsSync(outFile);
  console.log(`  ${exists ? '✓' : '✗'} ${path.relative(DOC, outFile)} (${size}px)`);
  return exists;
}

// ── ICO builder (pure Node, embeds PNGs directly) ─────────────────
function buildIco(pngPaths) {
  const images = pngPaths
    .filter(f => fs.existsSync(f))
    .map(f => {
      const buf  = fs.readFileSync(f);
      const name = path.basename(f, '.png');
      const m    = name.match(/(\d+)/);
      const sz   = m ? parseInt(m[1]) : 32;
      return { buf, sz };
    });

  if (!images.length) return null;

  const dirSize = 6 + images.length * 16;
  let offset = dirSize;
  for (const img of images) { img.offset = offset; offset += img.buf.length; }

  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(images.length, 4);

  let pos = 6;
  for (const img of images) {
    out.writeUInt8(img.sz >= 256 ? 0 : img.sz, pos);
    out.writeUInt8(img.sz >= 256 ? 0 : img.sz, pos + 1);
    out.writeUInt8(0, pos + 2);
    out.writeUInt8(0, pos + 3);
    out.writeUInt16LE(1, pos + 4);
    out.writeUInt16LE(32, pos + 6);
    out.writeUInt32LE(img.buf.length, pos + 8);
    out.writeUInt32LE(img.offset, pos + 12);
    pos += 16;
    img.buf.copy(out, img.offset);
  }
  return out;
}

// ── Generate PNGs ──────────────────────────────────────────────────
const inner     = markInner('white');
const innerDark = markInner(NAVY);

console.log('\nFavicon PNGs...');
for (const s of [16, 32, 48]) {
  makePng(inner, path.join(DOC, `logos/favicon/favicon-${s}x${s}.png`), s, VB, 'transparent');
}

console.log('\nWeb logos...');
for (const s of [32, 64, 128, 256, 512, 1024]) {
  makePng(inner, path.join(DOC, `logos/web/logo-${s}.png`), s, VB, 'white');
}

console.log('\nWindows icons...');
for (const s of [16, 32, 48, 64, 128, 256]) {
  makePng(inner, path.join(DOC, `logos/windows/icon-${s}.png`), s, VB, 'white');
}

console.log('\nAndroid icons...');
const androidSizes = [
  ['mipmap-mdpi',     48,  false],
  ['mipmap-hdpi',     72,  false],
  ['mipmap-xhdpi',    96,  false],
  ['mipmap-xxhdpi',   144, false],
  ['mipmap-xxxhdpi',  192, false],
  ['play-store',      512, false],
];
for (const [name, s, transp] of androidSizes) {
  makePng(inner, path.join(DOC, `logos/android/${name}.png`), s, VB, transp ? 'transparent' : 'white');
}

console.log('\nLinux icons...');
for (const s of [16, 22, 24, 32, 48, 64, 128, 256, 512]) {
  makePng(inner, path.join(DOC, `logos/linux/${s}x${s}.png`), s, VB, 'transparent');
}

// ── Build ICO files ────────────────────────────────────────────────
console.log('\nBuilding ICO files...');

const faviconIco = buildIco([
  path.join(DOC, 'logos/favicon/favicon-16x16.png'),
  path.join(DOC, 'logos/favicon/favicon-32x32.png'),
  path.join(DOC, 'logos/favicon/favicon-48x48.png'),
]);
if (faviconIco) {
  fs.writeFileSync(path.join(DOC, 'logos/favicon/favicon.ico'), faviconIco);
  console.log('  ✓ favicon/favicon.ico');
}

const winIco = buildIco([16, 32, 48, 64, 128, 256]
  .map(s => path.join(DOC, `logos/windows/icon-${s}.png`)));
if (winIco) {
  fs.writeFileSync(path.join(DOC, 'logos/windows/app-icon.ico'), winIco);
  console.log('  ✓ windows/app-icon.ico');
}

// ── Summary ────────────────────────────────────────────────────────
console.log('\nDone. Files written to:');
console.log(`  ${path.join(DOC, 'logos')}`);
