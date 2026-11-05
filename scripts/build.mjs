import { build, context } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/tesseract/core', { recursive: true });
mkdirSync('dist/tesseract/lang', { recursive: true });

cpSync('public', 'dist', { recursive: true });
cpSync('node_modules/tesseract.js/dist/worker.min.js', 'dist/tesseract/worker.min.js');
cpSync('node_modules/tesseract.js-core', 'dist/tesseract/core', {
  recursive: true,
  filter: (p) => !/\.(md|json)$|LICENSE/.test(p),
});
// one model per language the popup offers (+ vertical Japanese)
for (const lang of ['eng', 'jpn', 'jpn_vert', 'kor', 'chi_sim']) {
  const pkg = lang === 'eng' ? 'eng' : lang;
  cpSync(
    `node_modules/@tesseract.js-data/${pkg}/4.0.0_best_int/${lang}.traineddata.gz`,
    `dist/tesseract/lang/${lang}.traineddata.gz`,
  );
}

const opts = {
  entryPoints: {
    background: 'src/ext/background.ts',
    content: 'src/ext/content.ts',
    offscreen: 'src/ext/offscreen.ts',
    popup: 'src/ext/popup.ts',
  },
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  outdir: 'dist',
  logLevel: 'info',
};

if (watch) await (await context(opts)).watch();
else await build(opts);
