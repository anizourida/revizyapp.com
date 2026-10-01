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
});

test('LP1 links every primary call-to-action to the subscription section', () => {
  assert.match(page, /id="subscription"/);
  assert.match(page, /href="#subscription"/);
});
