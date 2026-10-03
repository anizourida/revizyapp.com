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
  assert.doesNotMatch(page, /id="video-title"/);
  assert.match(page, /<section class="video-section" aria-label="فيديو يشرح تطبيق ريفيزي">/);
  assert.match(page, /\.header\s*\{[\s\S]*?padding:\s*0/);
  assert.match(page, /\.video-section\s*\{[\s\S]*?padding:\s*0/);
  assert.match(page, /\.video-player\s*\{[\s\S]*?margin:\s*-15px 0/);
  const videoPlayerStyle = page.match(/\.video-player\s*\{([\s\S]*?)^\s*\}/m)?.[1] ?? '';
  assert.doesNotMatch(videoPlayerStyle, /padding:/);
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
  assert.match(page, /\.header-children\s*\{[\s\S]*?width:\s*100%/);
  assert.match(page, /id="header-prompt-tags"/);
  assert.ok(page.indexOf('class="subtitle"') < page.indexOf('id="header-prompt-tags"'));
  assert.match(page, /id="header-prompt-tags"[\s\S]*?<\/div>\s*<div class="header-tracing-illustration"[\s\S]*?src="parts\/par-6\.png"[\s\S]*?<section class="video-section"[\s\S]*?<section class="revision-benefits"[\s\S]*?<div class="header-learning">/);
  assert.match(page, /\.header-tracing-illustration img \{\s+display: block;\s+width: min\(280px, 72vw\)/);
  assert.match(page, /class="revision-benefit"[\s\S]*?>مسار واضح/);
  assert.match(page, /تمارين مناسبة/);
  assert.match(page, /تقدّم متدرّج/);
  assert.match(page, /\.revision-benefits\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(page, /function chooseHeaderPrompts\(amount\)/);
  assert.match(page, /chooseHeaderPrompts\(5\)/);
  assert.match(page, /'باغي تراجع معاه؟'/);
  assert.match(page, /'كايشد التيليفون بلا فائدة؟'/);
  assert.match(page, /<div class="header-prompt-tags"[\s\S]*?<span class="header-highlight">باغي تراجع معاه؟<\/span>/);
  assert.match(page, /tag\.className = 'header-highlight'/);
  assert.match(page, /\.header-prompt-tags\s*\{[\s\S]*?gap:\s*10px[\s\S]*?margin:\s*14px auto 22px/);
  assert.match(page, /\.header-prompt-tags span\s*\{[\s\S]*?padding:\s*4px 8px 4px[\s\S]*?border-radius:\s*7px[\s\S]*?background:\s*#FFE0A3[\s\S]*?font-size:\s*0\.78rem[\s\S]*?animation:\s*promptFloat/);
  assert.match(page, /\.header-prompt-tags span:nth-child\(3n \+ 2\)\s*\{[\s\S]*?background:\s*#FFF3D8/);
  assert.match(page, /\.header-highlight\s*\{[\s\S]*?background:\s*#FFE0A3/);
  assert.match(page, /باغي تراجع معاه فالدار بطريقة سهلة وممتعة؟/);
  assert.match(page, /<span class="header-curriculum">جميع مواد المنهاج<\/span>/);
  assert.match(page, /ريفيزي كيتضمن جميع المواد اللي كيقراها ولدك أو بنتك فالمدرسة الرائدة/);
  assert.match(page, /\.header-learning \.header-curriculum-description\s*\{/);
  const headerMarkup = page.slice(page.indexOf('<header class="header">'), page.indexOf('</header>'));
  assert.doesNotMatch(headerMarkup, /ريفيزي كيعطي لولدك طريق واضح باش يراجع دروسو/);
  assert.doesNotMatch(headerMarkup, /محتوى منظم فالعربية والفرنسية والرياضيات/);
  assert.match(page, /<span class="header-curriculum">ميزات ريفيزي<\/span>/);
  assert.match(page, /أنشطة تفاعلية متنوعة كتساعد ولدك أو بنتك يفهم، يتدرّب، ويتقدّم خطوة بخطوة/);
  assert.match(page, /class="header-features"/);
  for (let index = 1; index <= 8; index += 1) {
    assert.match(page, new RegExp(`features/feat-${index}\\.png`));
  }
  assert.ok(page.indexOf('features/feat-7.png') < page.indexOf('features/feat-8.png'));
  assert.ok(page.indexOf('features/feat-8.png') < page.indexOf('features/feat-1.png'));
  assert.match(page, /features\/feat-7\.png"[\s\S]*?>الحوارات/);
  assert.match(page, /features\/feat-8\.png"[\s\S]*?>البطاقات التعليمية/);
  assert.match(page, /class="header-feature-more"><img src="features\/feat-0\.png"[\s\S]*?>المزيد/);
  assert.doesNotMatch(page, /المزيد قريبًا/);
  assert.match(page, /\.header-features\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(page, /class="plans"/);
  assert.match(page, /id="plan-selector"/);
  assert.match(page, /activationIntro\.after\(planSelector\)/);
  assert.match(page, /\.activation-card \.plan-selector \.plans\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(page, /\.activation-card \.plan-selector \.plan-period\s*\{\s*display:\s*none/);
  assert.equal((page.match(/class="plan-card/g) || []).length, 3);
  assert.match(page, /aria-label="ابن واحد، اشتراك سنوي، 249 درهم"/);
  assert.match(page, /aria-label="ابنان، اشتراك سنوي، 399 درهم"/);
  assert.match(page, /aria-label="3 أبناء، اشتراك سنوي، 449 درهم"/);
  assert.match(page, /\.plan-card:focus-visible\s*\{/);
  assert.match(page, /planCards\.forEach\(\(card, index\) =>/);
  assert.match(page, /event\.key === 'ArrowRight'/);
  assert.match(page, /event\.key === 'Home'/);
  assert.match(page, /ابن واحد[\s\S]*?350 درهم[\s\S]*?249/);
  assert.match(page, /<button class="plan-card"[\s\S]*?<span class="badge">إخوة<\/span>[\s\S]*?ابنان[\s\S]*?500 درهم[\s\S]*?399/);
  assert.match(page, /3 أبناء[\s\S]*?600 درهم[\s\S]*?449/);
  assert.doesNotMatch(page, /اشتراك شهري/);
  assert.match(page, /class="payment-section"/);
  assert.match(page, /class="activation-card"/);
  assert.match(page, /فعّل اشتراك ريفيزي/);
  assert.match(page, /id="parent-name"/);
  assert.match(page, /id="parent-phone"/);
  assert.match(page, /placeholder="06xxxxxxxx"/);
  assert.match(page, /id="parent-phone-error"/);
  assert.match(page, /function normalizeMoroccanPhone\(phone\)/);
  assert.match(page, /function validateMoroccanPhone\(\)/);
  assert.match(page, /\[67\]\\d\{8\}/);
  assert.match(page, /id="parent-city"/);
  assert.match(page, /id="grade-selectors"/);
  assert.match(page, /data-student-count="1"/);
  assert.match(page, /data-student-count="2"/);
  assert.match(page, /data-student-count="3"/);
  assert.match(page, /function renderGradeSelectors\(studentCount\)/);
  assert.match(page, /renderGradeSelectors\(1\)/);
  assert.match(page, /formData\.getAll\('student_grade'\)/);
  assert.match(page, /studentNames\[index\]\?\.trim\(\) \|\| `اسم الابن \$\{index \+ 1\}`/);
  assert.match(page, /المستوى السادس ابتدائي/);
  assert.doesNotMatch(page, /شنو بغيتي ولدك أو بنتك يقوّي؟/);
  assert.doesNotMatch(page, /كتب اسم كل تلميذ واختار المستوى الدراسي ديالو/);
  assert.doesNotMatch(page, /learning_need/);
  assert.match(page, /صيفط طلب التفعيل فواتساب/);
  assert.doesNotMatch(page, /Attijari/);
  assert.doesNotMatch(page, /CIH/);
  assert.doesNotMatch(page, /RIDA ANIZOU/);
  assert.doesNotMatch(page, /007095000405530040000532/);
  assert.doesNotMatch(page, /42256665211022000/);
  assert.doesNotMatch(page, /اختار البنك اللي غادي تحوّل منه/);
  assert.doesNotMatch(page, /تحويل بنكي/);
  assert.match(page, /function selectPlan\(element\)/);
  assert.match(page, /const price = element\.dataset\.price/);
  assert.match(page, /function updateActivationButton\(\)/);
  assert.match(page, /hasValidMoroccanPhone/);
  assert.match(page, /formData\.get\('parent_name'\)/);
});

test('LP1 has a moving annual-plan offer ticker above the header', () => {
  assert.match(page, /class="offer-ticker"/);
  assert.match(page, /class="offer-ticker-track"/);
  assert.match(page, /اشتراك سنوي ابتداءً من 249 درهم/);
  assert.match(page, /وفّر حتى 151 درهم/);
  assert.match(page, /@keyframes offerTicker/);
});

test('LP1 provides Revizy-specific expandable answers after activation', () => {
  assert.match(page, /class="faq-section" aria-labelledby="faq-title" dir="rtl"/);
  assert.match(page, /<span class="faq-kicker" id="faq-title">أسئلة متكررة<\/span>/);
  assert.doesNotMatch(page, /<h2 id="faq-title">/);
  assert.doesNotMatch(page, /قبل ما تفعّل اشتراك ريفيزي/);
  assert.match(page, /\.faq-section \{\s+margin: 0 24px 34px;\s+text-align: center;/);
  assert.match(page, /\.faq-list \{\s+display: grid;\s+gap: 8px;\s+direction: rtl;\s+text-align: right;/);
  assert.match(page, /\.faq-item summary::before \{\s+content: '\+';\s+order: 1;/);
  assert.match(page, /paymentSection\.after\(faqSection\)/);
  assert.match(page, /شنو هو ريفيزي؟/);
  assert.match(page, /واش ريفيزي غير فيديوهات؟/);
  assert.match(page, /واش نقدر نشرك أكثر من ابن؟/);
  assert.equal((page.match(/class="faq-item"/g) || []).length, 7);
});

test('LP1 ends with a local trust footer for Madrastna, pioneer schools, and the ministry', () => {
  assert.match(page, /<footer class="trust-footer" id="trust-footer"/);
  assert.match(page, /class="trust-credits"/);
  assert.equal((page.match(/class="trust-credit"/g) || []).length, 3);
  assert.doesNotMatch(page, /class="trust-grid"/);
  assert.doesNotMatch(page, /class="trust-card"/);
  assert.match(page, /<img src="credits\/madrastna\.png" alt="مدرستنا">/);
  assert.match(page, /ريفيزي يساهم في جعل المدرسة ذات جودة للجميع/);
  assert.match(page, /<img src="credits\/pionniers\.png" alt="EE TaRL Label AES">/);
  assert.match(page, /ريفيزي مطابق تماماً لدروس المدرسة الرائدة/);
  assert.match(page, /<img src="credits\/men\.png" alt="وزارة التربية الوطنية والتعليم الأولي والرياضة">/);
  assert.match(page, /\.trust-logo img \{\s+display: block;\s+width: 100%;\s+height: 100%;\s+object-fit: contain;/);
  assert.match(page, /\.trust-logo--pioneers \{\s+width: 112px;\s+height: 112px;/);
  assert.match(page, /ريفيزي مطابق لمنهاج وتوصيات وزارة التربية الوطنية/);
  assert.match(page, /© 2026 ريفيزي — جميع الحقوق محفوظة/);
  assert.match(page, /faqSection\.after\(trustFooter\)/);
});

test('LP1 keeps the learning-promise section hidden until it is needed', () => {
  assert.match(page, /<section class="learning-promise"[^>]*\bhidden>/);
  assert.match(page, /المراجعة فالدار ما خاصهاش تولّي ضغط/);
  assert.match(page, /العربية والفرنسية والرياضيات/);
  assert.equal((page.match(/class="learning-topic"/g) || []).length, 4);
});

test('LP1 keeps the subscription-features content grouped and hidden until it is needed', () => {
  assert.match(page, /<section class="subscription-features"[^>]*\bhidden>/);
  assert.match(page, /<p class="section-title" id="subscription-features-title">مميزات الاشتراك<\/p>/);
  assert.match(page, /class="subscription-features"[\s\S]*?class="features"[\s\S]*?حذف الإعلانات/);
});

test('LP1 keeps the revision comparison section hidden until it is needed', () => {
  assert.match(page, /<section class="revizy-contrast"[^>]*\bhidden>/);
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
  assert.ok(swiperStart > headerEnd);
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
