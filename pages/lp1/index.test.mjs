import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('LP1 contains an accessible custom player for the local Revizy video', () => {
  assert.match(page, /<video[^>]+id="revizy-video"/);
  assert.match(page, /src="1001\.mp4"/);
  assert.match(page, /<button[^>]+id="video-toggle"/);
  assert.match(page, /aria-label="تشغيل"/);
  assert.match(page, /function toggleVideo\(\)/);
  assert.match(page, /class="video-divider"/);
  assert.match(page, /<span id="video-toggle-label">تشغيل<\/span>/);
  assert.match(page, /إيقاف/);
  assert.match(page, /\.video-toggle\s*\{\s*position:\s*absolute/);
  assert.match(page, /width:\s*112px/);
  assert.match(page, /function revealPauseControl\(\)/);
  assert.match(page, /2000/);
  assert.match(page, /classList\.add\('is-hidden'\)/);
  assert.match(page, /linear-gradient\(135deg, #243857, #304a70\)/);
  assert.match(page, /width:\s*38px/);
});

test('LP1 preserves the original payment design and flow around the video', () => {
  assert.match(page, /<h1>ولدك فالمدرسة الرائدة؟<\/h1>/);
  assert.match(page, /باغي تراجع معاه فالدار بطريقة سهلة وممتعة؟/);
  assert.match(page, /class="plans"/);
  assert.match(page, /class="payment-section"/);
  assert.match(page, /function selectPlan\(element\)/);
  assert.match(page, /function selectBank\(bank\)/);
});

test('LP1 has a moving annual-plan offer ticker above the header', () => {
  assert.match(page, /class="offer-ticker"/);
  assert.match(page, /class="offer-ticker-track"/);
  assert.match(page, /الاشتراك السنوي بـ 249 درهم/);
  assert.match(page, /وفر 99 درهم/);
  assert.match(page, /@keyframes offerTicker/);
});

test('LP1 has an audio-testimonials section with three placeholder voice cards', () => {
  assert.match(page, /class="testimonials-section is-hidden"/);
  assert.match(page, /آراء أولياء الأمور/);
  assert.equal((page.match(/class="testimonial-card"/g) || []).length, 3);
  assert.equal((page.match(/class="waveform-bars"/g) || []).length, 3);
  assert.doesNotMatch(page, /#2b896b/);
  assert.match(page, /background:\s*var\(--app-yellow\)/);
});
