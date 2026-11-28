import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import '../../runtime/browser.js';

const { disclosure } = globalThis.MyDesignSystem;

const { themes } = JSON.parse(await readFile(new URL('../../tokens/source.json', import.meta.url)));

function luminance(hex) {
  assert.match(hex, /^#[\da-f]{6}$/i);
  const channels = hex.slice(1).match(/../g).map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

for (const [name, { palette, components }] of Object.entries(themes)) {
  test(`${name}: primary text and action states meet 4.5:1 and focus meets 3:1`, () => {
    function assertContrast(foreground, background, minimum = 4.5) {
      const [a, b] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      const ratio = (a + 0.05) / (b + 0.05);
      assert.ok(ratio >= minimum, `${foreground} on ${background}: ${ratio.toFixed(2)} < ${minimum}`);
    }
    for (const surface of [palette['--kt-background'], palette['--kt-surface']]) {
      for (const ink of ['--kt-ink', '--kt-ink-muted', '--kt-accent-strong', '--kt-error']) {
        assertContrast(palette[ink], surface);
      }
      assertContrast(palette['--kt-accent-strong'], surface, 3);
    }
    for (const state of ['', '-hover', '-active']) {
      assertContrast(palette['--kt-on-accent'], components['--mds-button-primary' + state]);
      assertContrast(components['--mds-button-primary'], components['--kt-button-secondary-surface' + state]);
    }
  });
}

test('disclosure synchronizes state and releases its click handler', () => {
  const button = new EventTarget();
  const attrs = new Map();
  button.setAttribute = (name, value) => attrs.set(name, value);
  const content = { id: 'content', hidden: false };
  const states = [];
  const controller = disclosure(button, content, { onChange: (value) => states.push(value) });
  assert.equal(attrs.get('aria-controls'), 'content');
  assert.equal(content.hidden, true);
  button.dispatchEvent(new Event('click'));
  assert.equal(attrs.get('aria-expanded'), 'true');
  assert.equal(content.hidden, false);
  controller.destroy();
  button.dispatchEvent(new Event('click'));
  assert.deepEqual(states, [false, true]);
});
