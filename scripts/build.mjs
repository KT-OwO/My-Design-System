import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const read = async (path) => (await readFile(join(root, path), 'utf8')).replaceAll('\r\n', '\n');
const tokens = JSON.parse(await read('tokens/source.json'));

async function output(path, value) {
  if (check) {
    if (await read(path) !== value) throw new Error(`${path} is stale. Run npm run build.`);
    return;
  }
  await writeFile(join(root, path), value);
}

function block(selector, variables, extra = []) {
  const declarations = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`);
  return [selector + ' {', ...extra, ...declarations, '}'].join('\n');
}

function replaceBlock(css, name, value) {
  const start = `/* BEGIN GENERATED ${name} TOKENS */`;
  const end = `/* END GENERATED ${name} TOKENS */`;
  const before = css.indexOf(start);
  const after = css.indexOf(end);
  if (before < 0 || after <= before) throw new Error(`Missing ${name} token markers`);
  return css.slice(0, before) + [start, value, end].join('\n') + css.slice(after + end.length);
}

const prototype = tokens.themes.noodle;
const keys = (record) => Object.keys(record).sort().join(' ');
function resolve(value, variables, trail = []) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (!Object.hasOwn(variables, name) || trail.includes(name)) {
      throw new Error(`Unresolved or circular token: ${[...trail, name].join(' → ')}`);
    }
    return resolve(variables[name], variables, [...trail, name]);
  });
}

for (const [theme, { palette, components }] of Object.entries(tokens.themes)) {
  if (keys(palette) !== keys(prototype.palette) || keys(components) !== keys(prototype.components)) {
    throw new Error(`Token keys do not match the default theme: ${theme}`);
  }
  const values = { ...palette, ...components };
  const variables = { ...tokens.base, ...tokens.semantic, ...values };
  for (const [name, value] of Object.entries(variables)) resolve(value, variables, [name]);
  const selector = theme === 'noodle' ? ':root,\n:root[data-theme="noodle"]' : `:root[data-theme="${theme}"]`;
  const source = theme === 'noodle' ? '/* Palette reference: https://noodle-map.marulabs.dev/search */\n' : '';
  await output(`themes/${theme}.css`, '@charset "UTF-8";\n\n/* Generated from tokens/source.json. */\n' +
    source + block(selector, values) + '\n');
}

let css = await read('styles.css');
css = replaceBlock(css, 'BASE', block(':root', tokens.base, [
  '  color-scheme: var(--mds-color-scheme, light);',
  '  font-family: var(--font-family);',
]));
css = replaceBlock(css, 'SEMANTIC', block(':root', tokens.semantic));
postcss.parse(css, { from: 'styles.css' });
await output('styles.css', css);

for (const page of ['index.html', 'docs/patterns.html']) {
  const html = await read(page);
  const links = [...html.matchAll(/\b(?:src|href)="(\.{1,2}\/[^"#?]+)"/g)];
  await Promise.all(links.map(([, path]) => access(join(root, dirname(page), path))));
}
