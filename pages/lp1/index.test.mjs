import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('LP1 contains an accessible custom player for the local Revizy video', () => {
  assert.match(page, /<video[^>]+id="revizy-video"/);
  assert.match(page, /src="explication-application-revizy\.mp4"/);
  assert.match(page, /<button[^>]+id="video-toggle"/);
  assert.match(page, /aria-label="تشغيل الفيديو"/);
  assert.match(page, /function toggleVideo\(\)/);
  assert.match(page, /class="video-divider"/);
  assert.match(page, /<span id="video-toggle-label">شغّل الفيديو<\/span>/);
  assert.match(page, /وقف الفيديو/);
  assert.match(page, /\.video-toggle\s*\{\s*position:\s*absolute/);
  assert.match(page, /width:\s*112px/);
  assert.match(page, /function revealPauseControl\(\)/);
  assert.match(page, /2000/);
  assert.match(page, /classList\.add\('is-hidden'\)/);
});

test('LP1 preserves the original payment design and flow around the video', () => {
  assert.match(page, /<h1>ولدك فالمدرسة الرائدة؟<\/h1>/);
  assert.match(page, /باغي تراجع معاه فالدار بطريقة سهلة وممتعة؟/);
  assert.match(page, /class="plans"/);
  assert.match(page, /class="payment-section"/);
  assert.match(page, /function selectPlan\(element\)/);
  assert.match(page, /function selectBank\(bank\)/);
});
