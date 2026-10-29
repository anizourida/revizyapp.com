import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const page = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const submissionScript = page.slice(
  page.indexOf('const FORM_SUBMIT_URL ='),
  page.indexOf("activationForm.addEventListener('submit'"),
);
const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.revizyapp';

function createForm({ response = { ok: true, json: async () => ({ ok: true }) }, token = 'test-token' } = {}) {
  const values = {
    parent_name: ' Test Parent ', parent_phone: '0612345678', parent_city: ' Rabat ',
    student_name: [' Test Child ', ''], student_grade: ['المستوى الأول ابتدائي', 'المستوى الثاني ابتدائي'],
    'cf-turnstile-response': token, website: '',
  };
  const requests = [];
  const redirects = [];
  const events = [];
  const status = { textContent: '', classList: { add() {}, remove() {} } };
  const button = { disabled: false };
  const context = {
    activationForm: {}, whatsappBtn: button, formSubmitStatus: status,
    updateActivationButton() { button.disabled = false; },
    normalizeMoroccanPhone: value => value,
    FormData: class {
      get(key) { return values[key]; }
      getAll(key) { return values[key]; }
    },
    document: { querySelector: () => ({
      dataset: { price: '399' }, querySelector: () => ({ textContent: ' ابنان ' }),
    }) },
    // Storage may be unavailable in a private browser. It must not block a saved lead.
    sessionStorage: { setItem() { throw new Error('Storage unavailable'); } },
    window: { fbq: (...args) => events.push(args), location: { assign: url => redirects.push(url) } },
    async fetch(url, options) {
      requests.push({ url, options });
      return typeof response === 'function' ? response() : response;
    },
  };
  runInNewContext(submissionScript, context);
  return { requests, redirects, events, status, button,
    submit: () => context.submitActivationRequest({ preventDefault() {} }) };
}

test('LP1 saves the full request before sending parents directly to Google Play', async () => {
  let confirmSave;
  const form = createForm({ response: () => new Promise(resolve => { confirmSave = resolve; }) });
  const submission = form.submit();
  assert.deepEqual(form.redirects, []);
  assert.equal(form.requests.length, 1);
  assert.equal(form.requests[0].url, 'https://revizy-lp1-api.3nizou.workers.dev/');
  assert.equal(form.requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(form.requests[0].options.body), {
    landing_page: 'lp1', parent_name: 'Test Parent', parent_phone: '0612345678', parent_city: 'Rabat',
    plan_name: 'ابنان', price_mad: 399,
    students: [{ name: 'Test Child', grade: 'المستوى الأول ابتدائي' },
      { name: 'اسم الابن 2', grade: 'المستوى الثاني ابتدائي' }],
    turnstile_token: 'test-token', website: '',
  });
  confirmSave({ ok: true, json: async () => ({ ok: true }) });
  await submission;
  assert.deepEqual(form.redirects, [playStoreUrl]);
  assert.deepEqual(form.events, [['track', 'Lead']]);
});

for (const [name, response] of [
  ['HTTP error', { ok: false, json: async () => ({ ok: true }) }],
  ['rejected request', { ok: true, json: async () => ({ ok: false }) }],
  ['missing save confirmation', { ok: true, json: async () => ({}) }],
  ['invalid JSON', { ok: true, json: async () => { throw new Error('Invalid JSON'); } }],
  ['network failure', () => { throw new Error('Offline'); }],
]) {
  test(`LP1 keeps the form available without redirecting after ${name}`, async () => {
    const form = createForm({ response });
    await form.submit();
    assert.deepEqual(form.redirects, []);
    assert.deepEqual(form.events, []);
    assert.equal(form.button.disabled, false);
    assert.match(form.status.textContent, /عاود حاول/);
  });
}

test('LP1 requires the security check before submitting or redirecting', async () => {
  const form = createForm({ token: '' });
  await form.submit();
  assert.deepEqual(form.requests, []);
  assert.deepEqual(form.redirects, []);
  assert.match(form.status.textContent, /التحقق الأمني/);
});
