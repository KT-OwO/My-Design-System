import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const themes = ['noodle', 'dark', 'forest', 'high-contrast'];
const catalogURL = new URL('../../index.html', import.meta.url).href;
const patternURL = new URL('../../docs/patterns.html', import.meta.url).href;

test('catalog search, tabs, disclosure and modal work by keyboard', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(catalogURL);
  const invalidReferences = await page.locator('body').evaluate((body) => {
    const ids = [...body.querySelectorAll('[id]')].map((element) => element.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const controls = [...body.querySelectorAll('[aria-controls]')]
      .flatMap((element) => element.getAttribute('aria-controls').split(/\s+/))
      .filter((id) => !ids.includes(id));
    return [...duplicates, ...controls];
  });
  expect(invalidReferences).toEqual([]);
  const search = page.getByRole('searchbox', { name: 'コンポーネントを検索' });
  await search.fill('Tabs');
  const first = page.getByRole('tab', { name: '概要' });
  await first.focus();
  await first.press('ArrowRight');
  const second = page.getByRole('tab', { name: '仕様' });
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveText('コンポーネントの仕様を表示します。');
  await search.fill('');
  const dropdown = page.locator('.mds--dropdown .mds--list-box__field').first();
  await dropdown.focus();
  await dropdown.press('Enter');
  await expect(dropdown).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: '別の項目' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dropdown).toContainText('別の項目');
  await dropdown.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(dropdown).toHaveAttribute('aria-expanded', 'false');
  await expect(dropdown).toBeFocused();
  const open = page.getByRole('button', { name: '確認を開く' });
  await open.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(open).toBeFocused();
  expect(errors).toEqual([]);
});

for (const theme of themes) {
  test(`${theme}: form accessibility, narrow viewport and dialog`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(patternURL);
    await page.locator('html').evaluate((element, value) => { element.dataset.theme = value; }, theme);
    await page.addScriptTag({ path: axePath });
    const audit = () => page.evaluate(async () => (await window.axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })));
    expect(await audit()).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    const confirm = page.getByRole('button', { name: '確認する' });
    const primary = await confirm.evaluate((button) => {
      const context = document.createElement('canvas').getContext('2d');
      context.fillStyle = getComputedStyle(button).getPropertyValue('--mds-button-primary').trim();
      const token = context.fillStyle;
      context.fillStyle = getComputedStyle(button).backgroundColor;
      return { token, rendered: context.fillStyle };
    });
    expect(primary.token).toMatch(/^#[\da-f]{6}$/i);
    expect(primary.rendered).toBe(primary.token);
    await testInfo.attach('settings', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' });
    await confirm.click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('textbox').fill('design@example.com');
    await page.getByRole('textbox').press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: '戻る' })).toBeFocused();
    expect(await audit()).toEqual([]);
    await page.getByRole('button', { name: '保存する' }).click();
    await expect(page.getByRole('status')).toContainText('設定を保存しました');
  });
}

