import test from 'node:test';
import assert from 'node:assert/strict';
import { autoplayVideo, finishHeroIntro } from '../src/videoPlayback.js';

test('hero autoplay waits for the entrance and still respects reduced motion', () => {
  let pending = true;
  let plays = 0;
  let reduced = false;
  globalThis.matchMedia = () => ({ matches: reduced });
  const video = {
    hasAttribute: () => pending,
    removeAttribute: () => { pending = false; },
    play: () => { plays++; return Promise.resolve(); },
  };
  try {
    autoplayVideo(video);
    assert.equal(plays, 0);
    finishHeroIntro(video);
    assert.equal(plays, 1);
    pending = true;
    reduced = true;
    finishHeroIntro(video);
    assert.equal(plays, 1);
    autoplayVideo(null);
  } finally { delete globalThis.matchMedia; }
});
