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

test('LP1 explains Revizy learning support with original Darija copy', () => {
  assert.match(page, /class="learning-promise"/);
  assert.match(page, /المراجعة فالدار ما خاصهاش تولّي ضغط/);
  assert.match(page, /العربية والفرنسية والرياضيات/);
  assert.equal((page.match(/class="learning-topic"/g) || []).length, 4);
});

test('LP1 shows the full-width screenshot swiper directly below the header', () => {
  assert.match(page, /class="learning-screens-swiper"/);
  assert.match(page, /images\/boy-screenshots\.png/);
  assert.match(page, /images\/girl-screenshots\.png/);
  assert.match(page, /function showLearningSlide\(index\)/);
  assert.match(page, /setInterval\([^;]+, 4000\)/);
  assert.match(page, /data-learning-slide/);
  assert.match(page, /\.learning-screens-swiper\s*\{[\s\S]*?margin:\s*0 0 30px/);
  assert.match(page, /\.learning-screen-slide img\s*\{[\s\S]*?height:\s*auto/);

  const headerEnd = page.indexOf('</header>');
  const swiperStart = page.indexOf('class="learning-screens-swiper"');
  const videoStart = page.indexOf('class="video-section"');
  assert.ok(swiperStart > headerEnd && swiperStart < videoStart);
});

test('LP1 screenshot swiper has Instagram-style previous and next controls', () => {
  assert.match(page, /id="learning-prev"/);
  assert.match(page, /id="learning-next"/);
  assert.match(page, /class="learning-swiper-nav learning-swiper-prev"/);
  assert.match(page, /class="learning-swiper-nav learning-swiper-next"/);
  assert.match(page, /learningPrev\.addEventListener\('click'/);
  assert.match(page, /learningNext\.addEventListener\('click'/);
  assert.match(page, /function updateLearningNavigation\(\)/);
});

test('LP1 has an audio-testimonials section with three placeholder voice cards', () => {
  assert.match(page, /class="testimonials-section is-hidden"/);
  assert.match(page, /آراء أولياء الأمور/);
  assert.equal((page.match(/class="testimonial-card"/g) || []).length, 3);
  assert.equal((page.match(/class="waveform-bars"/g) || []).length, 3);
  assert.doesNotMatch(page, /#2b896b/);
  assert.match(page, /background:\s*var\(--app-yellow\)/);
});
