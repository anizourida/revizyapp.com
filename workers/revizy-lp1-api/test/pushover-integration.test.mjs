import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const sourceUrl = new URL('../src/index.js', import.meta.url);

test('queues a Pushover notification only after saving a verified lead', async () => {
  const source = await readFile(sourceUrl, 'utf8');

  assert.match(source, /async function notifyPushover\(env, lead\)/);
  assert.match(source, /https:\/\/api\.pushover\.net\/1\/messages\.json/);
  assert.match(source, /env\.PUSHOVER_APP_TOKEN/);
  assert.match(source, /env\.PUSHOVER_USER_KEY/);
  assert.match(source, /async fetch\(request, env, ctx\)/);

  const savePosition = source.indexOf(').run();');
  const notifyPosition = source.indexOf('ctx.waitUntil(notifyPushover');
  const successPosition = source.lastIndexOf('return json(origin, { ok: true });');

  assert.ok(savePosition >= 0, 'D1 insert should remain present');
  assert.ok(notifyPosition > savePosition, 'notify only after the D1 insert succeeds');
  assert.ok(successPosition > notifyPosition, 'success remains independent of notification delivery');
});

test('provides a protected, read-only lead dashboard with WhatsApp contact links', async () => {
  const source = await readFile(sourceUrl, 'utf8');

  assert.match(source, /url\.pathname === '\/admin'/);
  assert.match(source, /env\.ADMIN_USERNAME/);
  assert.match(source, /env\.ADMIN_PASSWORD/);
  assert.match(source, /WWW-Authenticate/);
  assert.match(source, /SELECT[\s\S]+FROM form_submissions[\s\S]+ORDER BY created_at DESC/);
  assert.match(source, /https:\/\/wa\.me\/212/);
  assert.match(source, /تواصل عبر واتساب/);
});
