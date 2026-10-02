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
  assert.doesNotMatch(page, /src="revizy-logo-primary-as-text\.png"/);
  assert.match(page, /h1\s*\{[\s\S]*?font-size:\s*2\.2rem[\s\S]*?line-height:\s*2/);
  assert.match(page, /class="header-highlight"/);
  assert.match(page, /ولدك او بنتك/);
  assert.match(page, /فالمدرسة الرائدة؟/);
  assert.match(page, /class="header-spark"/);
  assert.match(page, /\.header-spark\s*\{[\s\S]*?top:\s*140px[\s\S]*?transform:\s*rotate\(282deg\)\s*skew\(8deg\)/);
  assert.match(page, /class="header-mark"/);
  assert.match(page, /<header class="header">[\s\S]*?<img class="header-children" src="parts\/par-1\.png"/);
  assert.match(page, /\.header-children\s*\{[\s\S]*?width:\s*calc\(100% \+ 48px\)/);
  assert.match(page, /id="header-prompt-tags"/);
  assert.match(page, /function chooseHeaderPrompts\(amount\)/);
  assert.match(page, /chooseHeaderPrompts\(5\)/);
  assert.match(page, /'باغي تراجع معاه؟'/);
  assert.match(page, /'كايشد التيليفون بلا فائدة؟'/);
  assert.match(page, /<div class="header-prompt-tags"[\s\S]*?<span class="header-highlight">باغي تراجع معاه؟<\/span>/);
  assert.match(page, /tag\.className = 'header-highlight'/);
  assert.match(page, /\.header-prompt-tags\s*\{[\s\S]*?gap:\s*10px[\s\S]*?margin:\s*14px auto 22px/);
  assert.match(page, /\.header-prompt-tags span\s*\{[\s\S]*?border-radius:\s*7px[\s\S]*?background:\s*#FFE0A3[\s\S]*?font-size:\s*0\.78rem[\s\S]*?animation:\s*promptFloat/);
  assert.match(page, /\.header-prompt-tags span:nth-child\(3n \+ 2\)\s*\{[\s\S]*?background:\s*#FFF3D8/);
  assert.match(page, /\.header-highlight\s*\{[\s\S]*?background:\s*#FFE0A3/);
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

test('LP1 contrasts revision with and without Revizy using parent-facing Darija copy', () => {
  assert.match(page, /class="revizy-contrast"/);
  assert.match(page, /بلا ريفيزي ولا مع ريفيزي؟/);
  assert.match(page, /class="revizy-contrast-card revizy-contrast-card--without"/);
  assert.match(page, /class="revizy-contrast-card revizy-contrast-card--with"/);
  assert.match(page, /خطوات واضحة على حساب الدروس/);
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

test('LP1 keeps the scrs gallery in its own compact-arrow swiper', () => {
  assert.match(page, /class="scrs-swiper"/);
  for (let index = 1; index <= 12; index += 1) {
    assert.match(page, new RegExp(`scrs/scr-${index}\\.png`));
  }
  assert.match(page, /id="scrs-prev"/);
  assert.match(page, /id="scrs-next"/);
  assert.match(page, /\.scrs-swiper-nav\s*\{[\s\S]*?width:\s*34px[\s\S]*?height:\s*34px/);
  assert.match(page, /scrsPrev\.addEventListener\('click'/);
  assert.match(page, /scrsNext\.addEventListener\('click'/);
});

test('LP1 screenshot swiper has Instagram-style previous and next controls', () => {
  assert.match(page, /id="learning-prev"/);
  assert.match(page, /id="learning-next"/);
  assert.match(page, /learning-swiper-prev/);
  assert.match(page, /learning-swiper-next/);
  assert.match(page, /learningPrev\.addEventListener\('click'/);
  assert.match(page, /learningNext\.addEventListener\('click'/);
  assert.match(page, /function updateLearningNavigation\(\)/);
});

test('LP1 keeps the original carousel navigation logic while its visible arrows are disabled', () => {
  assert.match(page, /learning-swiper-nav learning-swiper-prev is-disabled/);
  assert.match(page, /learning-swiper-nav learning-swiper-next is-disabled/);
  assert.match(page, /\.learning-swiper-nav\.is-disabled\s*\{\s*display:\s*none/);
  assert.match(page, /learningPrev\.addEventListener\('click'/);
  assert.match(page, /learningNext\.addEventListener\('click'/);
});

test('LP1 screenshot swiper prevents native image dragging so desktop swipes work', () => {
  assert.match(page, /draggable="false"/);
  assert.match(page, /-webkit-user-drag:\s*none/);
  assert.match(page, /learningSwiper\.addEventListener\('dragstart', \(event\) => event\.preventDefault\(\)\)/);
  assert.match(page, /learningSwiper\.setPointerCapture\(event\.pointerId\)/);
});

test('LP1 screenshot swiper loops seamlessly without sliding back to the first image', () => {
  assert.equal((page.match(/data-learning-clone/g) || []).length, 2);
  assert.match(page, /const learningSlideCount = learningDots\.length/);
  assert.match(page, /function resetLearningTrackToRealSlide\(index\)/);
  assert.match(page, /learningTrack\.addEventListener\('transitionend', resetAfterLoop, \{ once: true \}\)/);
  assert.match(page, /learningPrev\.hidden = false/);
  assert.match(page, /learningNext\.hidden = false/);
});

test('LP1 has an audio-testimonials section with three placeholder voice cards', () => {
  assert.match(page, /class="testimonials-section is-hidden"/);
  assert.match(page, /آراء أولياء الأمور/);
  assert.equal((page.match(/class="testimonial-card"/g) || []).length, 3);
  assert.equal((page.match(/class="waveform-bars"/g) || []).length, 3);
  assert.doesNotMatch(page, /#2b896b/);
  assert.match(page, /background:\s*var\(--app-yellow\)/);
});
